require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const couponRoutes = require('./routes/coupons');
const reviewRoutes = require('./routes/reviews');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const adminRoutes = require('./routes/admin');
const addressRoutes = require('./routes/addresses');
const chatRoutes = require('./routes/chatRoutes');

// Auto Seed Helper Function
const autoSeedDB = async () => {
  try {
    const Product = require('./models/Product');
    const Coupon = require('./models/Coupon');
    const User = require('./models/User');
    const { loadProductsFromJSON, saveProductsToJSON } = require('./utils/productBackup');

    // First try restoring from persistent JSON backup
    const restored = await loadProductsFromJSON();

    // If count > 0 and restored, return
    const count = await Product.countDocuments();
    if (count > 0 && restored) {
      console.log('✅ Persistent custom products loaded!');
      return;
    }

    if (count > 0) return;

    console.log('🌱 Auto-seeding database with initial products and accounts...');
    await Product.deleteMany({});
    
    const seedProducts = [
      {
        name: 'Obsidian Heavyweight Oversized Tee',
        sku: 'BT-TEE-OBS-01',
        barcode: '8901234567890',
        description: 'An architectural silhouette crafted from dense 280 GSM combed cotton. Featuring dropped shoulders, a tight ribbed mock neck, and a relaxed boxy fit that holds its shape. Double-needle stitch finishes. Preshrunk to ensure a permanent premium fit.',
        category: 'T-Shirts',
        subcategory: 'Oversized',
        price: 2499,
        salePrice: 1999,
        material: '100% Organic Combed Cotton',
        gsm: 280,
        fitType: 'Oversized',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [
          { name: 'Pitch Black', hex: '#0B0B0B' },
          { name: 'Asphalt Grey', hex: '#3E3E3E' }
        ],
        images: [
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600',
          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600'
        ],
        stockQuantity: 120,
        lowStockLimit: 15,
        status: 'published',
        tags: ['tee', 'oversized', 'obsidian', 'heavyweight']
      },
      {
        name: 'Monolith Vintage Acid-Wash Tee',
        sku: 'BT-TEE-MON-02',
        barcode: '8901234567891',
        description: 'Hand-dyed Relic Mineral Acid Wash Tee crafted from 300 GSM heavy combed cotton. Each tee features a unique distressed fade, reinforced collar, and heavy drop shoulder boxy drape.',
        category: 'T-Shirts',
        subcategory: 'Acid Wash',
        price: 2999,
        salePrice: 2299,
        material: '100% Heavy Combed Cotton',
        gsm: 300,
        fitType: 'Relic Boxy Fit',
        sizes: ['M', 'L', 'XL'],
        colors: [
          { name: 'Acid Wash Charcoal', hex: '#2B2B2B' },
          { name: 'Mineral Wash Black', hex: '#1C1C1C' }
        ],
        images: [
          'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=600',
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600'
        ],
        stockQuantity: 85,
        lowStockLimit: 10,
        status: 'published',
        tags: ['tee', 'acidwash', 'vintage', 'heavyweight']
      },
      {
        name: 'Spectral Chalk Architectural Graphic Tee',
        sku: 'BT-TEE-SPC-03',
        barcode: '8901234567892',
        description: 'Luxury high-density screenprint graphic tee featuring geometric branding typography on the back. Constructed from 260 GSM chalk white ring-spun jersey with ribbed crew neck.',
        category: 'T-Shirts',
        subcategory: 'Graphic',
        price: 2799,
        salePrice: 2199,
        material: '100% Organic Ring-Spun Cotton',
        gsm: 260,
        fitType: 'Relaxed Drop-Shoulder',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Chalk White', hex: '#F9F6F0' },
          { name: 'Off White', hex: '#F5F5F0' }
        ],
        images: [
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600',
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600'
        ],
        stockQuantity: 90,
        lowStockLimit: 12,
        status: 'published',
        tags: ['tee', 'graphic', 'white', 'streetwear']
      },
      {
        name: 'Theory Matte Core Minimalist Tee',
        sku: 'BT-TEE-THY-04',
        barcode: '8901234567893',
        description: 'Clean minimalist silhouette engineered for subtle luxury. Tight mock collar, silent side split seams, and a ultra-clean 240 GSM matte finish.',
        category: 'T-Shirts',
        subcategory: 'Minimalist',
        price: 2299,
        salePrice: 1799,
        material: '100% Matte Combed Jersey',
        gsm: 240,
        fitType: 'Clean Boxy Fit',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [
          { name: 'Matte Onyx Black', hex: '#121212' },
          { name: 'Slate Grey', hex: '#4A4A4A' }
        ],
        images: [
          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600',
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600'
        ],
        stockQuantity: 110,
        lowStockLimit: 15,
        status: 'published',
        tags: ['tee', 'minimalist', 'black', 'core']
      },
      {
        name: 'Cyberpunk Nocturne Typography Tee',
        sku: 'BT-TEE-CYB-05',
        barcode: '8901234567894',
        description: 'Subtle reflective typography across the chest with architectural coordinates on the sleeve. Heavyweight 290 GSM combed cotton in midnight black.',
        category: 'T-Shirts',
        subcategory: 'Graphic',
        price: 2899,
        salePrice: 2299,
        material: '100% Combed Heavy Cotton',
        gsm: 290,
        fitType: 'Oversized Boxy',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Midnight Black', hex: '#050505' }
        ],
        images: [
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600'
        ],
        stockQuantity: 75,
        lowStockLimit: 10,
        status: 'published',
        tags: ['tee', 'graphic', 'typography', 'cyberpunk']
      },
      {
        name: 'Vapor Sand Distressed Acid-Wash Tee',
        sku: 'BT-TEE-VAP-06',
        barcode: '8901234567895',
        description: 'Desert sand mineral wash with subtle micro-distressing around hemline and sleeves. 280 GSM heavy jersey with ultra-soft hand feel.',
        category: 'T-Shirts',
        subcategory: 'Acid Wash',
        price: 3199,
        salePrice: 2499,
        material: '100% Organic Cotton',
        gsm: 280,
        fitType: 'Oversized Relic',
        sizes: ['M', 'L', 'XL'],
        colors: [
          { name: 'Sand Washed', hex: '#C2B280' }
        ],
        images: [
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600'
        ],
        stockQuantity: 60,
        lowStockLimit: 8,
        status: 'published',
        tags: ['tee', 'acidwash', 'sand', 'vintage']
      }
    ];

    await Product.insertMany(seedProducts);
    await saveProductsToJSON();

    await Coupon.deleteMany({});
    const seedCoupons = [
      {
        code: 'THEORY20',
        discountType: 'percentage',
        discountValue: 20,
        minOrderAmount: 2000,
        expiryDate: new Date('2028-12-31'),
        usageLimit: 500,
        isActive: true
      },
      {
        code: 'FLAT500',
        discountType: 'flat',
        discountValue: 500,
        minOrderAmount: 3000,
        expiryDate: new Date('2028-12-31'),
        usageLimit: 200,
        isActive: true
      },
      {
        code: 'FREESHIP',
        discountType: 'free_shipping',
        discountValue: 0,
        minOrderAmount: 500,
        expiryDate: new Date('2028-12-31'),
        usageLimit: 1000,
        isActive: true
      }
    ];

    await Coupon.insertMany(seedCoupons);

    await User.deleteMany({ email: { $in: ['admin@blacktheory.com', 'siddhujha2006@gmail.com', 'siddhukumar2006@gmail.com'] } });
    await User.create({
      name: 'Admin User',
      email: 'admin@blacktheory.com',
      password: 'admin123',
      role: 'admin',
      phone: '9999999999'
    });
    await User.create({
      name: 'Siddhu Jha Admin',
      email: 'siddhujha2006@gmail.com',
      password: 'admin12345',
      role: 'admin',
      phone: '9654365649'
    });
    await User.create({
      name: 'Siddhu Kumar',
      email: 'siddhukumar2006@gmail.com',
      password: 'siddhujha12345',
      role: 'admin',
      phone: '9654365649'
    });

    console.log('✅ Auto-seeding completed successfully!');
  } catch (err) {
    console.error('Auto-seed error:', err.message);
  }
};

const app = express();

// Connect to database and then auto-seed
connectDB().then(() => {
  setTimeout(() => autoSeedDB(), 1000);
});

// Seeding Route for instant manual trigger
app.get('/api/seed', async (req, res) => {
  await autoSeedDB();
  res.status(200).json({
    success: true,
    message: 'Database seeded! Admin: admin@blacktheory.com / admin123 | Customer: siddhukumar2006@gmail.com / siddhujha12345'
  });
});

// Security Headers
app.use(helmet());

// CORS Setup
app.use(cors());

// Body parser (10mb limit to support base64 image uploads)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting (basic API protector)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/chat', chatRoutes);

// Seeding Route for instant sandbox startup
app.get('/api/seed', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const Coupon = require('./models/Coupon');

    // 1. Clear existing products
    await Product.deleteMany({});
    
    // 2. Add seed products
    const seedProducts = [
      {
        name: 'Obsidian Heavyweight Oversized Tee',
        sku: 'BT-TEE-OBS-01',
        barcode: '8901234567890',
        description: 'An architectural silhouette crafted from dense 280 GSM combed cotton. Featuring dropped shoulders, a tight ribbed mock neck, and a relaxed boxy fit that holds its shape. Double-needle stitch finishes. Preshrunk to ensure a permanent premium fit.',
        category: 'T-Shirts',
        subcategory: 'Oversized',
        price: 2499,
        salePrice: 1999,
        material: '100% Organic Combed Cotton',
        gsm: 280,
        fitType: 'Oversized',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [
          { name: 'Pitch Black', hex: '#0B0B0B' },
          { name: 'Asphalt Grey', hex: '#3E3E3E' }
        ],
        images: [
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600',
          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600'
        ],
        stockQuantity: 120,
        lowStockLimit: 15,
        status: 'published',
        tags: ['tee', 'oversized', 'obsidian', 'heavyweight']
      },
      {
        name: 'Monolith Raw Denim Jacket',
        sku: 'BT-JKT-MON-02',
        barcode: '8901234567891',
        description: 'Structured utility crafted from 14oz raw selvedge Japanese denim. This jacket develops a unique wear profile over time. Silver-coated custom zinc alloy hardware, dual chest pockets, and discrete welt pockets.',
        category: 'Outerwear',
        subcategory: 'Jackets',
        price: 7999,
        salePrice: 6499,
        material: '14oz Japanese Selvedge Denim',
        gsm: 400,
        fitType: 'Regular Boxy',
        sizes: ['M', 'L', 'XL'],
        colors: [
          { name: 'Midnight Raw Indigo', hex: '#1C2331' },
          { name: 'Shadow Black', hex: '#121212' }
        ],
        images: [
          'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=600',
          'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=600'
        ],
        stockQuantity: 45,
        lowStockLimit: 5,
        status: 'published',
        tags: ['denim', 'jacket', 'outerwear', 'raw']
      },
      {
        name: 'Spectral Chalk White Hoodie',
        sku: 'BT-HD-SPC-03',
        barcode: '8901234567892',
        description: 'Luxury fleece comfort engineered for an elegant drape. Constructed using 420 GSM heavy cotton loopback jersey. Features a double-lined hood with no drawstrings for a minimalist luxury appearance, kangaroo pocket, and rib-knit cuffs.',
        category: 'Hoodies',
        subcategory: 'Fleece',
        price: 4499,
        salePrice: 3899,
        material: '80% Organic Cotton, 20% Poly Fleece',
        gsm: 420,
        fitType: 'Relaxed Fit',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Chalk White', hex: '#F9F6F0' },
          { name: 'Onyx Black', hex: '#151515' }
        ],
        images: [
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600',
          'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600'
        ],
        stockQuantity: 80,
        lowStockLimit: 12,
        status: 'published',
        tags: ['hoodie', 'white', 'fleece', 'minimalist']
      },
      {
        name: 'Theory Tailored Cargo Joggers',
        sku: 'BT-PNT-THY-04',
        barcode: '8901234567893',
        description: 'Tapered luxury utility bottoms. Water-repellent matte-nylon finish, elasticized waist with silver-capped cords, dual cargo flap pockets with magnetic locks, and zippered back pockets.',
        category: 'Pants',
        subcategory: 'Joggers',
        price: 3999,
        salePrice: 3299,
        material: 'Premium Matte Nylon Blend',
        gsm: 210,
        fitType: 'Tapered Utility',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [
          { name: 'Matte Charcoal Black', hex: '#1C1C1C' }
        ],
        images: [
          'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600',
          'https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=600'
        ],
        stockQuantity: 65,
        lowStockLimit: 8,
        status: 'published',
        tags: ['cargo', 'joggers', 'pants', 'utility']
      }
    ];

    await Product.insertMany(seedProducts);

    // 3. Seed Default Coupons
    await Coupon.deleteMany({});
    const seedCoupons = [
      {
        code: 'THEORY20',
        discountType: 'percentage',
        discountValue: 20,
        minOrderAmount: 2000,
        expiryDate: new Date('2028-12-31'),
        usageLimit: 500,
        isActive: true
      },
      {
        code: 'FLAT500',
        discountType: 'flat',
        discountValue: 500,
        minOrderAmount: 3000,
        expiryDate: new Date('2028-12-31'),
        usageLimit: 200,
        isActive: true
      },
      {
        code: 'FREESHIP',
        discountType: 'free_shipping',
        discountValue: 0,
        minOrderAmount: 500,
        expiryDate: new Date('2028-12-31'),
        usageLimit: 1000,
        isActive: true
      }
    ];

    await Coupon.insertMany(seedCoupons);

    // 4. Seed Default Admin and Customer Users
    const User = require('./models/User');
    await User.deleteMany({ email: { $in: ['admin@blacktheory.com', 'siddhukumar2006@gmail.com'] } });
    await User.create({
      name: 'Admin User',
      email: 'admin@blacktheory.com',
      password: 'admin123',
      role: 'admin',
      phone: '9999999999'
    });
    await User.create({
      name: 'Siddhu Kumar',
      email: 'siddhukumar2006@gmail.com',
      password: 'siddhujha12345',
      role: 'admin',
      phone: '9654365649'
    });

    res.status(200).json({
      success: true,
      message: 'Database seeded! Admin: admin@blacktheory.com / admin123 | Customer: siddhukumar2006@gmail.com / siddhujha12345'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Root check
app.get('/', (req, res) => {
  res.send('Black Theory API is running...');
});

// DEV ONLY: Quick password reset
app.get('/api/dev/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.query;
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Provide ?email=...&newPassword=...' });
    }
    const User = require('./models/User');
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: `Password reset for ${email}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;
