const { Cart, Order, Product } = require('../models/index');
const { ApiResponse } = require('../utils/response.utils');

// ─── Helper: Generate unique order number ────────────────────────────────────
const generateOrderNumber = async () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const orderNumber = `ORD-${timestamp}-${random}`;

  // Check if it already exists (very unlikely but safe)
  const existing = await Order.findOne({ orderNumber });
  if (existing) return generateOrderNumber();

  return orderNumber;
};

// ─── Place Order ──────────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    // Validate shipping address
    if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.pincode) {
      return res.status(400).json({ message: 'Invalid shipping address' });
    }

    // Create vendor orders
    const vendorMap = {};
    for (const item of cart.items) {
      const vid = item.vendorId.toString();
      if (!vendorMap[vid]) vendorMap[vid] = { vendorId: item.vendorId, items: [], subtotal: 0, status: 'pending' };

      vendorMap[vid].items.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      });
      vendorMap[vid].subtotal += item.price * item.quantity;
    }

    const orderNumber = await generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      userId: req.user._id,
      vendorOrders: Object.values(vendorMap).map(v => ({
        ...v,
        trackingNumber: '',
        statusHistory: [{ status: 'pending', note: 'Order created', timestamp: new Date() }]
      })),
      totalAmount: cart.totalAmount,
      finalAmount: cart.totalAmount,
      shippingAddress: {
        name: shippingAddress.name,
        phone: shippingAddress.phone,
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode
      },
      paymentMethod,
      paymentStatus: 'paid'
    });

    // Clear cart
    cart.items = [];
    cart.totalAmount = 0;
    cart.totalItems = 0;
    await cart.save();

    ApiResponse(res, 201, 'Order placed successfully', { order });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─── Get User Orders ──────────────────────────────────────────────────────────
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('vendorOrders.vendorId', 'storeName')
      .populate('vendorOrders.items.productId', 'name images');

    // Enrich items with product details
    const enrichedOrders = orders.map(order => ({
      ...order.toObject(),
      vendorOrders: order.vendorOrders.map(vo => ({
        ...vo.toObject(),
        items: vo.items.map(item => ({
          ...item.toObject(),
          name: item.productId?.name || 'Product',
          image: item.productId?.images?.[0]?.url || '/placeholder.png'
        }))
      }))
    }));

    ApiResponse(res, 200, 'Orders retrieved', { orders: enrichedOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get Single Order ─────────────────────────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('vendorOrders.vendorId', 'storeName')
      .populate('vendorOrders.items.productId', 'name images');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Enrich items with product details
    const enrichedOrder = {
      ...order.toObject(),
      vendorOrders: order.vendorOrders.map(vo => ({
        ...vo.toObject(),
        items: vo.items.map(item => ({
          ...item.toObject(),
          name: item.productId?.name || 'Product',
          image: item.productId?.images?.[0]?.url || '/placeholder.png'
        }))
      }))
    };

    ApiResponse(res, 200, 'Order retrieved', { order: enrichedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Vendor: Get Orders ───────────────────────────────────────────────────────
const getVendorOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'vendorOrders.vendorId': req.vendor._id })
      .populate('vendorOrders.items.productId', 'name images');

    // Filter out other vendors' items from the response and enrich items with product details
    const filteredOrders = orders.map(order => {
      const vendorOrders = order.vendorOrders
        .filter(vo => vo.vendorId.toString() === req.vendor._id.toString())
        .map(vo => ({
          ...vo.toObject(),
          items: vo.items.map(item => ({
            ...item.toObject(),
            name: item.productId?.name || 'Product',
            image: item.productId?.images?.[0]?.url || '/placeholder.png'
          }))
        }));

      return { ...order.toObject(), vendorOrders };
    });

    ApiResponse(res, 200, 'Vendor orders retrieved', { orders: filteredOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Vendor: Update Order Status ──────────────────────────────────────────────
const updateVendorOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, note } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const vendorOrder = order.vendorOrders.find(vo => vo.vendorId.toString() === req.vendor._id.toString());
    if (!vendorOrder) return res.status(404).json({ message: 'Vendor order not found' });

    // Validate status transition
    const validTransitions = {
      pending: ['processing', 'cancelled'],
      paid: ['processing'],
      processing: ['shipped', 'dispatched'],
      shipped: ['dispatched', 'delivered'],
      dispatched: ['delivery', 'delivered'],
      delivery: ['delivered'],
      delivered: ['completed']
    };

    const allowedStatuses = validTransitions[vendorOrder.status] || [];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Cannot change status from ${vendorOrder.status} to ${status}` });
    }

    vendorOrder.status = status;
    if (trackingNumber !== undefined) vendorOrder.trackingNumber = trackingNumber;
    vendorOrder.statusHistory = vendorOrder.statusHistory || [];
    vendorOrder.statusHistory.push({ status, note: note || '', timestamp: new Date() });
    await order.save();

    ApiResponse(res, 200, 'Order status updated', { order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Cancel Order ────────────────────────────────────────────────────────────
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ message: `Cannot cancel a ${order.status} order` });
    }

    order.status = 'cancelled';
    await order.save();

    ApiResponse(res, 200, 'Order cancelled successfully', { order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getUserOrders, getOrderById, cancelOrder, getVendorOrders, updateVendorOrderStatus };
