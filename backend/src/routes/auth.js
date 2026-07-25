const express = require('express');
const {
  register,
  login,
  getMe,
  googleLogin,
  requestOtp,
  verifyOtp,
  updateProfile,
  forgotPasswordOtp,
  resetPasswordOtp
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/google', googleLogin);
router.post('/otp-request', requestOtp);
router.post('/otp-verify', verifyOtp);
router.post('/forgot-password-otp', forgotPasswordOtp);
router.post('/reset-password-otp', resetPasswordOtp);
router.put('/profile', protect, updateProfile);

module.exports = router;
