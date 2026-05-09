// cart.routes.js
const express = require('express');
const cartRouter = express.Router();
const cartCtrl = require('../controllers/cart.controller');
const { authenticate } = require('../middleware/auth.middleware');

cartRouter.get('/', authenticate, cartCtrl.getCart);
cartRouter.post('/add', authenticate, cartCtrl.addToCart);
cartRouter.put('/update', authenticate, cartCtrl.updateCartItem);
cartRouter.delete('/remove/:id', authenticate, cartCtrl.removeFromCart);
cartRouter.delete('/clear', authenticate, cartCtrl.clearCart);

module.exports = cartRouter;
