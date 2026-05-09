// payment.routes.js
const express = require('express');
const payRouter = express.Router();
const { createPaymentOrder, verifyPayment } = require('../controllers/misc.controller');
const { authenticate } = require('../middleware/auth.middleware');
payRouter.post('/create-order', authenticate, createPaymentOrder);
payRouter.post('/verify', authenticate, verifyPayment);
module.exports = payRouter;
