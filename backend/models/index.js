const mongoose = require('mongoose');

// ─── Category ────────────────────────────────────────────────────────────────
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
const Category = mongoose.model('Category', categorySchema);

// ─── Cart ────────────────────────────────────────────────────────────────────
const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
  discountedPrice: { type: Number, required: true }
});

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [cartItemSchema],
  totalAmount: { type: Number, default: 0 },
  totalItems: { type: Number, default: 0 }
}, { timestamps: true });
const Cart = mongoose.model('Cart', cartSchema);

// ─── Order ───────────────────────────────────────────────────────────────────
const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: Number,
  price: Number
});

const vendorOrderSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  trackingNumber: { type: String, default: '' },
  statusHistory: [{ status: String, note: String, timestamp: { type: Date, default: Date.now } }]
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, sparse: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorOrders: [vendorOrderSchema],
  totalAmount: { type: Number, required: true },
  finalAmount: { type: Number, required: true },
  shippingAddress: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  paymentMethod: { type: String, default: 'mock' },
  paymentStatus: { type: String, default: 'pending' },
  status: { type: String, default: 'pending' }
}, { timestamps: true });
const Order = mongoose.model('Order', orderSchema);

// ─── Review ──────────────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true }
}, { timestamps: true });
const Review = mongoose.model('Review', reviewSchema);

// ─── Wishlist ─────────────────────────────────────────────────────────────────
const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });
const Wishlist = mongoose.model('Wishlist', wishlistSchema);

// ─── Coupon ──────────────────────────────────────────────────────────────────
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  discountValue: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscountAmount: { type: Number },
  usageLimit: { type: Number },
  usedCount: { type: Number, default: 0 },
  expiresAt: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
const Coupon = mongoose.model('Coupon', couponSchema);

// ─── Notification ─────────────────────────────────────────────────────────────
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { Category, Cart, Order, Review, Wishlist, Coupon, Notification };
