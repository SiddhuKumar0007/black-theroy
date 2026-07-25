const express = require('express');
const { getDashboardStats, getUsers, toggleBanUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/ban', toggleBanUser);

// Cloudinary image upload endpoint
router.post('/upload', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: 'Please provide an image base64 string' });
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: 'black-theory-products'
    });

    res.status(200).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
