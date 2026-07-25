const express = require('express');
const {
  createCoupon,
  getAllCoupons,
  deleteCoupon,
  applyCoupon
} = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/apply', protect, applyCoupon);

// Admin-only operations
router.post('/', protect, authorize('admin'), createCoupon);
router.get('/', protect, authorize('admin'), getAllCoupons);
router.delete('/:id', protect, authorize('admin'), deleteCoupon);

module.exports = router;
