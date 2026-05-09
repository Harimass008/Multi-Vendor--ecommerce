// ── routes/auth.routes.js ────────────────────────────────────────────────────
const express = require('express');
const r = express.Router();
const c = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

r.post('/user/register', c.registerUser);
r.post('/user/login', c.loginUser);

r.post('/vendor/register', c.registerVendor);
r.post('/vendor/login', c.loginVendor);

r.post('/admin/login', c.loginAdmin);

r.post('/logout', c.logout);

module.exports = r;
