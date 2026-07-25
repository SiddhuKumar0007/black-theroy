try {
  console.log('--- VERIFYING BACKEND IMPORT STRUCTURES ---');
  
  // Models
  console.log('Loading Mongoose Models...');
  const User = require('./models/User');
  const Product = require('./models/Product');
  const Category = require('./models/Category');
  const Order = require('./models/Order');
  const Payment = require('./models/Payment');
  const Coupon = require('./models/Coupon');
  const Review = require('./models/Review');
  const Wishlist = require('./models/Wishlist');
  const Cart = require('./models/Cart');
  const Address = require('./models/Address');
  const Notification = require('./models/Notification');
  console.log('✔ All 11 models loaded successfully.');

  // Config/DB
  console.log('Loading configuration modules...');
  const connectDB = require('./config/db');
  console.log('✔ DB config modules loaded.');

  // Middleware
  console.log('Loading middleware modules...');
  const authMiddleware = require('./middleware/auth');
  const errorHandler = require('./middleware/error');
  console.log('✔ Middleware modules loaded.');

  // Controllers
  console.log('Loading controllers...');
  const authController = require('./controllers/authController');
  const productController = require('./controllers/productController');
  const orderController = require('./controllers/orderController');
  const couponController = require('./controllers/couponController');
  const reviewController = require('./controllers/reviewController');
  const cartController = require('./controllers/cartController');
  const wishlistController = require('./controllers/wishlistController');
  const adminController = require('./controllers/adminController');
  const addressController = require('./controllers/addressController');
  console.log('✔ Controllers loaded.');

  // Routes
  console.log('Loading routing maps...');
  const authRoutes = require('./routes/auth');
  const productRoutes = require('./routes/products');
  const orderRoutes = require('./routes/orders');
  const couponRoutes = require('./routes/coupons');
  const reviewRoutes = require('./routes/reviews');
  const cartRoutes = require('./routes/cart');
  const wishlistRoutes = require('./routes/wishlist');
  const adminRoutes = require('./routes/admin');
  const addressRoutes = require('./routes/addresses');
  console.log('✔ Routes loaded.');

  console.log('--- VERIFICATION SUCCESSFUL ---');
  console.log('All backend JavaScript files are syntactically correct and reference paths resolve successfully.');
  process.exit(0);
} catch (err) {
  console.error('✖ Verification Error:', err.message);
  console.error(err.stack);
  process.exit(1);
}
