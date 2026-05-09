const express = require('express');
const r = express.Router();
const { getNotifications, markAllRead } = require('../controllers/misc.controller');
const { authenticate } = require('../middleware/auth.middleware');
r.get('/', authenticate, getNotifications);
r.put('/mark-read', authenticate, markAllRead);
module.exports = r;
