const Cart = require('../models/Cart');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Sync user cart
// @route   POST /api/cart/sync
// @access  Private
exports.syncCart = async (req, res, next) => {
  try {
    const { items } = req.body; // Array of { product: id, size: string, color: object, quantity: number }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({ user: req.user.id });
    }

    cart.items = items;
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product');

    res.status(200).json({
      success: true,
      data: populatedCart
    });
  } catch (err) {
    next(err);
  }
};
