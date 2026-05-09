const express = require('express');
const r = express.Router();
const { createReview, getProductReviews } = require('../controllers/misc.controller');
const { authenticate } = require('../middleware/auth.middleware');
r.post('/', authenticate, createReview);
r.get('/product/:productId', getProductReviews);
module.exports = r;
