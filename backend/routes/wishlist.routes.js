// wishlist.routes.js
const express = require('express');
const wl = express.Router();
const { getWishlist, toggleWishlist } = require('../controllers/misc.controller');
const { authenticate } = require('../middleware/auth.middleware');
wl.get('/', authenticate, getWishlist);
wl.post('/toggle', authenticate, toggleWishlist);
module.exports = wl;
