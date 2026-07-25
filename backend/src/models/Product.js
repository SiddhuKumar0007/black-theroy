const mongoose = require('mongoose');

const ColorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hex: { type: String, required: true }
});

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true
    },
    brand: {
      type: String,
      default: 'Black Theory'
    },
    sku: {
      type: String,
      required: [true, 'Please add SKU'],
      unique: true,
      trim: true
    },
    barcode: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please add description']
    },
    category: {
      type: String,
      required: [true, 'Please select category']
    },
    subcategory: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      required: [true, 'Please add a base price']
    },
    salePrice: {
      type: Number,
      default: null
    },
    discountPercent: {
      type: Number,
      default: 0
    },
    material: {
      type: String,
      default: '100% Premium Cotton'
    },
    gsm: {
      type: Number,
      default: 240 // Default luxury heavy weight
    },
    fitType: {
      type: String,
      default: 'Oversized' // Oversized/Relaxed/Regular
    },
    sizes: {
      type: [String],
      enum: ['S', 'M', 'L', 'XL', 'XXL'],
      default: ['S', 'M', 'L', 'XL', 'XXL']
    },
    colors: [ColorSchema],
    images: {
      type: [String],
      required: [true, 'Please add at least one product image']
    },
    videoUrl: {
      type: String,
      default: ''
    },
    sizeStock: {
      S: { type: Number, default: 20 },
      M: { type: Number, default: 35 },
      L: { type: Number, default: 30 },
      XL: { type: Number, default: 15 },
      XXL: { type: Number, default: 0 }
    },
    stockQuantity: {
      type: Number,
      default: 100
    },
    lowStockLimit: {
      type: Number,
      default: 10
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published'
    },
    weight: {
      type: Number, // in grams
      default: 250
    },
    tags: [String],
    rating: {
      type: Number,
      default: 5
    },
    numReviews: {
      type: Number,
      default: 0
    },
    outOfStockToggle: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Pre-save to calculate discount percent and total stockQuantity from sizeStock
ProductSchema.pre('save', function (next) {
  if (this.salePrice && this.salePrice < this.price) {
    this.discountPercent = Math.round(((this.price - this.salePrice) / this.price) * 100);
  } else {
    this.discountPercent = 0;
  }

  if (this.sizeStock) {
    const s = Number(this.sizeStock.S) || 0;
    const m = Number(this.sizeStock.M) || 0;
    const l = Number(this.sizeStock.L) || 0;
    const xl = Number(this.sizeStock.XL) || 0;
    const xxl = Number(this.sizeStock.XXL) || 0;
    this.stockQuantity = s + m + l + xl + xxl;
  }

  next();
});

module.exports = mongoose.model('Product', ProductSchema);
