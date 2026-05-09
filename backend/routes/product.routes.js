const express = require('express');
const r = express.Router();
const c = require('../controllers/product.controller');
const { getCategories } = require('../controllers/product.controller');
const { authenticate, authorize, isApprovedVendor } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary');

r.get('/', c.getProducts);
r.get('/categories', getCategories);
r.get('/:id', c.getProduct);

// Vendor routes
r.get('/vendor/my-products', authenticate, authorize('vendor'), isApprovedVendor, c.getVendorProducts);
r.post('/vendor/create', authenticate, authorize('vendor'), isApprovedVendor, upload.array('images', 5), c.createProduct);
r.put('/vendor/:id', authenticate, authorize('vendor'), isApprovedVendor, upload.array('images', 5), c.updateProduct);
r.delete('/vendor/:id', authenticate, authorize('vendor'), isApprovedVendor, c.deleteProduct);

module.exports = r;
