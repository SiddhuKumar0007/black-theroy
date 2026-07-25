const Wishlist = require('../models/Wishlist');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products');

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }

    res.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle product in wishlist
// @route   POST /api/wishlist/toggle
// @access  Private
exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID required' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }

    const index = wishlist.products.indexOf(productId);

    if (index > -1) {
      // Remove product
      wishlist.products.splice(index, 1);
      await wishlist.save();
      res.status(200).json({ success: true, message: 'Removed from wishlist', added: false });
    } else {
      // Add product
      wishlist.products.push(productId);
      await wishlist.save();
      res.status(200).json({ success: true, message: 'Added to wishlist', added: true });
    }
  } catch (err) {
    next(err);
  }
};
