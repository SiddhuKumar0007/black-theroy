const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get dashboard metrics & analytics data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Basic Counts (excluding cancelled orders)
    const totalOrdersCount = await Order.countDocuments({ orderStatus: { $ne: 'cancelled' } });
    const totalUsersCount = await User.countDocuments({ role: 'customer' });
    
    // Real Total Revenue calculations (only active/completed orders, excluding cancelled)
    const activeOrders = await Order.find({ orderStatus: { $ne: 'cancelled' } });
    const totalRevenue = activeOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Today's Real Sales & Daily Orders (excluding cancelled)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayOrders = await Order.find({
      createdAt: { $gte: startOfToday },
      orderStatus: { $ne: 'cancelled' }
    });
    const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Low Stock Alerts & Out of Stock
    const products = await Product.find();
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const lowStockAlerts = [];

    products.forEach((p) => {
      if (p.stockQuantity === 0 || p.outOfStockToggle) {
        outOfStockCount++;
      } else if (p.stockQuantity <= p.lowStockLimit) {
        lowStockCount++;
        lowStockAlerts.push({
          _id: p._id,
          name: p.name,
          sku: p.sku,
          stock: p.stockQuantity
        });
      }
    });

    // Real Weekly Sales Chart Data for the last 7 days (excluding cancelled)
    const salesChart = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);

      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);

      const dayOrders = await Order.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        orderStatus: { $ne: 'cancelled' }
      });

      const daySales = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      salesChart.push({
        day: days[d.getDay()],
        sales: daySales,
        orders: dayOrders.length
      });
    }

    // Top Selling Products (sorted mock based on stock depleted or general ratings)
    const topProducts = await Product.find({ status: 'published' })
      .sort('-rating')
      .limit(5)
      .select('name price rating stockQuantity');

    // Customer summaries
    const customers = await User.find({ role: 'customer' }).limit(10).select('name email createdAt');

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders: totalOrdersCount,
        todaySales: todayRevenue,
        totalCustomers: totalUsersCount,
        lowStockCount,
        outOfStockCount,
        conversionRate: 3.2 // simulated percentage
      },
      lowStockAlerts,
      salesChart,
      topProducts,
      recentCustomers: customers
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users list (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'customer' }).sort('-createdAt');
    
    // Add cumulative spending for each customer
    const usersWithSpending = await Promise.all(
      users.map(async (u) => {
        const orders = await Order.find({ user: u._id, paymentStatus: 'paid' });
        const totalSpending = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          loyaltyPoints: u.loyaltyPoints,
          isBanned: u.isBanned,
          createdAt: u.createdAt,
          totalOrders: orders.length,
          totalSpending
        };
      })
    );

    res.status(200).json({
      success: true,
      data: usersWithSpending
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Ban / Unban user
// @route   PUT /api/admin/users/:id/ban
// @access  Private/Admin
exports.toggleBanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isBanned ? 'suspended' : 'activated'}`,
      data: user
    });
  } catch (err) {
    next(err);
  }
};
