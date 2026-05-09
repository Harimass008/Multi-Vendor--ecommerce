const express = require('express');
const r = express.Router();
const { createOrder, getUserOrders, getOrderById, cancelOrder } = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth.middleware');

r.post('/create', authenticate, createOrder);
r.get('/user', authenticate, getUserOrders);
r.get('/:id', authenticate, getOrderById);
r.put('/:id/cancel', authenticate, cancelOrder);

module.exports = r;
