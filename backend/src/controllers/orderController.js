const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const User = require('../models/User');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentGateway,
      paymentGatewayId,
      couponCode,
      gstNumber
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    // Verify stock and calculate subtotal
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Only ${product.stockQuantity} remaining.`
        });
      }

      const itemPrice = product.salePrice || product.price;
      subtotal += itemPrice * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: itemPrice,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: product.images[0]
      });
    }

    // Process Coupon
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        // Validate expiry and limits
        const now = new Date();
        if (coupon.expiryDate > now && coupon.usedCount < coupon.usageLimit && subtotal >= coupon.minOrderAmount) {
          if (coupon.discountType === 'percentage') {
            discountAmount = Math.round(subtotal * (coupon.discountValue / 100));
          } else if (coupon.discountType === 'flat') {
            discountAmount = coupon.discountValue;
          } else if (coupon.discountType === 'free_shipping') {
            discountAmount = 0; // handled in shipping logic
          }
          // Increment usage count
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    // Calculate shipping (free shipping above 1000 INR/USD or if coupon is free shipping)
    let shippingCharges = 100;
    if (subtotal >= 1000 || (couponCode && couponCode.toUpperCase() === 'FREESHIP')) {
      shippingCharges = 0;
    }

    const totalAmount = subtotal + shippingCharges - discountAmount;

    // Deduct stock quantities
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: -item.quantity }
      });
    }

    // Set Estimated Delivery Date (5 days from now)
    const estDelivery = new Date();
    estDelivery.setDate(estDelivery.getDate() + 5);

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      paymentGateway,
      paymentGatewayId: paymentGatewayId || `mock_txn_${Math.random().toString(36).substring(2, 10)}`,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      couponCode: couponCode || '',
      discountAmount,
      shippingCharges,
      gstNumber: gstNumber || '',
      estimatedDeliveryDate: estDelivery,
      totalAmount
    });

    // Award loyalty points: 1% of subtotal as points
    const pointsEarned = Math.round(subtotal * 0.01);
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { loyaltyPoints: pointsEarned }
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check ownership
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const { orderStatus, paymentStatus, courierTracking, courierName } = req.body;

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (courierTracking) order.courierTracking = courierTracking;
    if (courierName) order.courierName = courierName;

    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel/Refund order
// @route   POST /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ownership check
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Only allow cancellation if order is pending or processing
    if (order.orderStatus !== 'pending' && order.orderStatus !== 'processing' && req.user.role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Order has already been shipped and cannot be cancelled' });
    }

    order.orderStatus = 'cancelled';
    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: item.quantity }
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled and stock restored successfully',
      data: order
    });
  } catch (err) {
    next(err);
  }
};
