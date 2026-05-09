const Product = require('../models/Product.model');
const { Category } = require('../models/index');
const { ApiResponse } = require('../utils/response.utils');

// ─── Get All Products ──────────────────────────────────────────────────────────
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category', 'name').populate('vendorId', 'storeName');
    ApiResponse(res, 200, 'Products retrieved', { products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get Single Product ───────────────────────────────────────────────────────
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name').populate('vendorId', 'storeName');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    ApiResponse(res, 200, 'Product retrieved', { product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const parseJsonArrayField = (field) => {
  if (Array.isArray(field)) field = field[field.length - 1];
  return JSON.parse(field || '[]');
};

// ─── Vendor: Create Product ───────────────────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    const { name, description, price, discountPercentage, stock, category, tags, specifications, isActive } = req.body;

    const images = req.files ? req.files.map(file => ({
      url: file.path,
      public_id: file.filename
    })) : [];

    const product = await Product.create({
      vendorId: req.vendor._id,
      name, description, price: Number(price), discountPercentage: Number(discountPercentage || 0),
      stock: Number(stock), category, tags: parseJsonArrayField(tags),
      specifications: parseJsonArrayField(specifications), images, isActive: isActive === 'true'
    });

    res.status(201).json({ message: 'Product created', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Vendor: Update Product ───────────────────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, vendorId: req.vendor._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { name, description, price, discountPercentage, stock, category, tags, specifications, isActive } = req.body;

    const newImages = req.files ? req.files.map(file => ({
      url: file.path,
      public_id: file.filename
    })) : [];

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = Number(price);
    if (discountPercentage !== undefined) product.discountPercentage = Number(discountPercentage || 0);
    if (stock) product.stock = Number(stock);
    if (category) product.category = category;
    if (tags) product.tags = parseJsonArrayField(tags);
    if (specifications) product.specifications = parseJsonArrayField(specifications);
    if (newImages.length > 0) product.images = [...product.images, ...newImages]; // Append new images
    if (isActive !== undefined) product.isActive = isActive === 'true';

    await product.save();

    res.status(200).json({ message: 'Product updated', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Vendor: Delete Product ───────────────────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, vendorId: req.vendor._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await product.deleteOne();
    res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Vendor: Get My Products ──────────────────────────────────────────────────
const getVendorProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendorId: req.vendor._id })
      .populate('category', 'name')
      .populate('vendorId', 'storeName');
    ApiResponse(res, 200, 'Vendor products retrieved', { products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get All Categories ───────────────────────────────────────────────────────
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    ApiResponse(res, 200, 'Categories retrieved', { categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getVendorProducts, getCategories };
