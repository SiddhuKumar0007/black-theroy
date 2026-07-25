const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  sendCustomerMessage,
  getCustomerChat,
  getAdminChats,
  sendAdminReply,
  closeChat
} = require('../controllers/chatController');

// Optional auth middleware so user token is read if present
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const jwt = require('jsonwebtoken');
      const User = require('../models/User');
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123_blacktheory');
      req.user = await User.findById(decoded.id);
    } catch (e) {
      // ignore invalid token for public chat
    }
  }
  next();
};

// Customer routes
router.post('/send', optionalAuth, sendCustomerMessage);
router.get('/my-chat', optionalAuth, getCustomerChat);

// Admin routes
router.get('/admin/conversations', protect, authorize('admin'), getAdminChats);
router.post('/admin/reply', protect, authorize('admin'), sendAdminReply);
router.put('/admin/close/:id', protect, authorize('admin'), closeChat);

module.exports = router;
