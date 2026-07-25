const express = require('express');
const {
  addProductReview,
  getProductReviews,
  replyToReview,
  moderateReview,
  deleteReview
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/:productId', getProductReviews);
router.post('/:productId', protect, addProductReview);

// Admin-only operations
router.post('/:reviewId/reply', protect, authorize('admin'), replyToReview);
router.put('/:reviewId/moderate', protect, authorize('admin'), moderateReview);
router.delete('/:reviewId', protect, authorize('admin'), deleteReview);

module.exports = router;
