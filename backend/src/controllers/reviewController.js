const Review = require('../models/Review');
const Product = require('../models/Product');

// Helper to update product rating
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId, status: 'approved' });
  const numReviews = reviews.length;
  const rating =
    numReviews > 0
      ? Math.round((reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews) * 10) / 10
      : 5;

  await Product.findByIdAndUpdate(productId, { rating, numReviews });
};

// @desc    Add or update a product review
// @route   POST /api/reviews/:productId
// @access  Private
exports.addProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.productId;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed this product
    let review = await Review.findOne({ product: productId, user: req.user.id });

    if (review) {
      review.rating = rating;
      review.comment = comment;
      await review.save();
    } else {
      review = await Review.create({
        product: productId,
        user: req.user.id,
        userName: req.user.name,
        rating,
        comment
      });
    }

    await updateProductRating(productId);

    res.status(201).json({
      success: true,
      message: 'Review added/updated successfully',
      data: review
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, status: 'approved' }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin: Reply to a review
// @route   POST /api/reviews/:reviewId/reply
// @access  Private/Admin
exports.replyToReview = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.replies.push({
      user: req.user.id,
      comment
    });

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Reply posted successfully',
      data: review
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin: Moderate review (Approve / Delete)
// @route   PUT /api/reviews/:reviewId/moderate
// @access  Private/Admin
exports.moderateReview = async (req, res, next) => {
  try {
    const { status } = req.body; // 'approved' or 'pending'
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.status = status;
    await review.save();

    await updateProductRating(review.product);

    res.status(200).json({
      success: true,
      message: `Review marked as ${status}`,
      data: review
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin: Delete review
// @route   DELETE /api/reviews/:reviewId
// @access  Private/Admin
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(req.params.reviewId);

    await updateProductRating(productId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
