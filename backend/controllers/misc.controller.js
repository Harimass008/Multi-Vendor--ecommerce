const User = require('../models/User.model');
const Admin = require('../models/Admin.model');
const Vendor = require('../models/Vendor.model');
const Product = require('../models/Product.model');
const { Category, Order, Coupon } = require('../models/index');
const { ApiResponse } = require('../utils/response.utils');

// ══════════════════════════════════════════════════════════
//  ADMIN CONTROLLERS
// ══════════════════════════════════════════════════════════
const adminDashboard = async (req, res) => {
  try {
    // TODO: Add actual dashboard data
    ApiResponse(res, 200, 'Admin dashboard data', {});
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const adminGetUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' });
    ApiResponse(res, 200, 'Users retrieved', { users });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const adminGetVendors = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status === 'banned') {
      filter.isBanned = true;
    } else if (status) {
      filter.approvalStatus = status;
      filter.isBanned = false;
    }
    const vendors = await Vendor.find(filter);
    ApiResponse(res, 200, 'Vendors retrieved', { vendors });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const adminApproveVendor = async (req, res) => {
  try {
    const { action, note } = req.body;
    const updateData = { approvalNote: note || '' };

    if (action === 'approve') {
      updateData.approvalStatus = 'approved';
    } else if (action === 'reject') {
      updateData.approvalStatus = 'rejected';
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const vendor = await Vendor.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    ApiResponse(res, 200, `Vendor ${action}d`, { vendor });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const adminBanVendor = async (req, res) => {
  try {
    const { action } = req.body;
    const updateData = { isBanned: action === 'ban' };
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    ApiResponse(res, 200, `Vendor ${action === 'ban' ? 'banned' : 'unbanned'}`, { vendor });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const adminDeleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    ApiResponse(res, 200, 'Vendor deleted', {});
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const adminBanUser = async (req, res) => {
  try {
    // TODO: Implement ban/unban logic
    ApiResponse(res, 200, 'User ban status toggled', {});
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const adminGetAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
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

    ApiResponse(res, 200, 'All orders retrieved', { orders: enrichedOrders });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const adminCreateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const category = await Category.create({ name, slug, description });
    ApiResponse(res, 201, 'Category created', { category });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const adminUpdateCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const category = await Category.findByIdAndUpdate(req.params.id, { name, slug, description, isActive }, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    ApiResponse(res, 200, 'Category updated', { category });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const adminDeleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    ApiResponse(res, 200, 'Category deleted', {});
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const adminGetCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    ApiResponse(res, 200, 'Categories retrieved', { categories });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const adminCreateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    ApiResponse(res, 201, 'Coupon created', { coupon });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ══════════════════════════════════════════════════════════
//  USER CONTROLLERS
// ══════════════════════════════════════════════════════════
const getProfile = async (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateProfile = async (req, res) => {
  try {
    res.status(200).json({ message: 'Profile updated' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const addAddress = async (req, res) => {
  try {
    res.status(200).json({ message: 'Address added' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const removeAddress = async (req, res) => {
  try {
    res.status(200).json({ message: 'Address removed' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ══════════════════════════════════════════════════════════
//  VENDOR PROFILE CONTROLLER
// ══════════════════════════════════════════════════════════
const getVendorProfile = async (req, res) => {
  try {
    res.status(200).json({ vendor: req.vendor });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateVendorProfile = async (req, res) => {
  try {
    res.status(200).json({ message: 'Vendor profile updated' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getVendorDashboard = async (req, res) => {
  try {
    res.status(200).json({ message: 'Vendor dashboard data' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ══════════════════════════════════════════════════════════
//  PAYMENT CONTROLLER
// ══════════════════════════════════════════════════════════
const createPaymentOrder = async (req, res) => {
  try {
    res.status(200).json({ message: 'Payment order created' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const verifyPayment = async (req, res) => {
  try {
    res.status(200).json({ message: 'Payment verified' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ══════════════════════════════════════════════════════════
//  REVIEW CONTROLLERS
// ══════════════════════════════════════════════════════════
const createReview = async (req, res) => {
  try {
    res.status(201).json({ message: 'Review submitted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getProductReviews = async (req, res) => {
  try {
    res.status(200).json({ reviews: [] });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ══════════════════════════════════════════════════════════
//  WISHLIST CONTROLLERS
// ══════════════════════════════════════════════════════════
const getWishlist = async (req, res) => {
  try {
    res.status(200).json({ wishlist: [] });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const toggleWishlist = async (req, res) => {
  try {
    res.status(200).json({ message: 'Wishlist toggled' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ══════════════════════════════════════════════════════════
//  COUPON CONTROLLERS
// ══════════════════════════════════════════════════════════
const getActiveCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).select('-__v');
    ApiResponse(res, 200, 'Active coupons retrieved', { coupons });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    if (!coupon.isActive) return res.status(400).json({ message: 'Coupon is inactive' });
    if (new Date() > coupon.expiresAt) return res.status(400).json({ message: 'Coupon has expired' });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }
    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({ message: `Minimum order amount ₹${coupon.minOrderAmount} required` });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.floor((orderAmount * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    ApiResponse(res, 200, 'Coupon validated', {
      discountAmount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ══════════════════════════════════════════════════════════
//  NOTIFICATION CONTROLLERS
// ══════════════════════════════════════════════════════════
const getNotifications = async (req, res) => {
  try {
    res.status(200).json({ notifications: [] });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const markAllRead = async (req, res) => {
  try {
    res.status(200).json({ message: 'Notifications marked read' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = {
  adminDashboard, adminGetUsers, adminGetVendors, adminApproveVendor, adminBanUser, adminBanVendor, adminDeleteVendor,
  adminGetAllOrders, adminCreateCategory, adminUpdateCategory, adminDeleteCategory, adminGetCategories,
  getProfile, updateProfile, addAddress, removeAddress,
  getVendorProfile, updateVendorProfile, getVendorDashboard,
  createPaymentOrder, verifyPayment,
  createReview, getProductReviews,
  getWishlist, toggleWishlist,
  validateCoupon, adminCreateCoupon, getActiveCoupons,
  getNotifications, markAllRead,
};
