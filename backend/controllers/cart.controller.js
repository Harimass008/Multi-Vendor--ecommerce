const { Cart } = require('../models/index');
const Product = require('../models/Product.model');
const { ApiResponse } = require('../utils/response.utils');

const recalculateCart = (cart) => {
  cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.totalAmount = cart.items.reduce((sum, item) => sum + (item.discountedPrice * item.quantity), 0);
};

// ─── Get Cart ─────────────────────────────────────────────────────────────────
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id })
      .populate('items.productId', 'name images stock isActive discountedPrice price')
      .populate('items.vendorId', 'storeName');

    if (!cart) cart = await Cart.create({ userId: req.user._id, items: [] });

    cart.items = cart.items.filter(item => item.productId?.isActive && item.productId?.stock > 0);
    recalculateCart(cart);
    await cart.save();

    ApiResponse(res, 200, 'Cart retrieved', { cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Add to Cart ──────────────────────────────────────────────────────────────
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);

    if (!product || !product.isActive) return res.status(404).json({ message: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ message: `Only ${product.stock} items in stock` });

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) cart = await Cart.create({ userId: req.user._id, items: [] });

    const discountedPrice = Math.round(product.price - (product.price * product.discountPercentage / 100));

    const existingItem = cart.items.find(i => i.productId.toString() === productId);
    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (product.stock < newQty) return res.status(400).json({ message: `Only ${product.stock} items in stock` });
      existingItem.quantity = newQty;
    } else {
      cart.items.push({
        productId, vendorId: product.vendorId,
        quantity, price: product.price, discountedPrice,
      });
    }

    recalculateCart(cart);
    await cart.save();
    ApiResponse(res, 200, 'Item added to cart', { cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Update Cart Item ─────────────────────────────────────────────────────────
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);

    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ message: `Only ${product.stock} items in stock` });

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(i => i.productId.toString() === productId);
    if (!item) return res.status(404).json({ message: 'Item not in cart' });

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.productId.toString() !== productId);
    } else {
      item.quantity = quantity;
      // Update discounted price in case product discount changed
      item.discountedPrice = Math.round(product.price - (product.price * product.discountPercentage / 100));
    }

    recalculateCart(cart);
    await cart.save();
    ApiResponse(res, 200, 'Cart updated', { cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Remove from Cart ─────────────────────────────────────────────────────────
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(i => i.productId.toString() !== req.params.id);
    recalculateCart(cart);
    await cart.save();

    ApiResponse(res, 200, 'Item removed', { cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Clear Cart ───────────────────────────────────────────────────────────────
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [], totalAmount: 0, totalItems: 0 });
    ApiResponse(res, 200, 'Cart cleared', {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
