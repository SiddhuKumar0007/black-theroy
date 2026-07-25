const Product = require('../models/Product');
const { saveProductsToJSON } = require('../utils/productBackup');

// @desc    Get all products (with search, category, sizes, colors, price filters & sort)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from filtering
    const removeFields = ['select', 'sort', 'page', 'limit', 'search', 'minPrice', 'maxPrice', 'category', 'sizes', 'colors', 'adminView'];
    removeFields.forEach((param) => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

    // Parse back to object
    let filterObj = JSON.parse(queryStr);

    // Search query
    if (req.query.search) {
      filterObj.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { tags: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Category filter (supports commas)
    if (req.query.category) {
      const categories = req.query.category.split(',');
      filterObj.category = { $in: categories };
    }

    // Subcategory filter
    if (req.query.subcategory) {
      filterObj.subcategory = { $regex: new RegExp(req.query.subcategory, 'i') };
    }

    // Sizes filter (supports commas)
    if (req.query.sizes) {
      const sizes = req.query.sizes.split(',');
      filterObj.sizes = { $in: sizes };
    }

    // Colors filter (supports hexes / names)
    if (req.query.colors) {
      const colors = req.query.colors.split(',');
      filterObj['colors.name'] = { $in: colors };
    }

    // Min / Max Price
    if (req.query.minPrice || req.query.maxPrice) {
      filterObj.price = {};
      if (req.query.minPrice) filterObj.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filterObj.price.$lte = Number(req.query.maxPrice);
    }

    // Filter published only by default for customers
    if (!req.query.adminView) {
      filterObj.status = 'published';
    }

    // Finding resource
    query = Product.find(filterObj);

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt'); // default to new arrivals
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Product.countDocuments(filterObj);

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const products = await query;

    // Pagination result
    const pagination = {};
    if (endIndex < total) {
      pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }

    res.status(200).json({
      success: true,
      count: products.length,
      pagination,
      total,
      data: products
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: `Product not found with id ${req.params.id}` });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    await saveProductsToJSON();

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: `Product not found with id ${req.params.id}` });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    await saveProductsToJSON();

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: `Product not found with id ${req.params.id}` });
    }

    await Product.findByIdAndDelete(req.params.id);
    await saveProductsToJSON();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get similar products
// @route   GET /api/products/:id/similar
// @access  Public
exports.getSimilarProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Find other products in same category, excluding current product
    const similar = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      status: 'published'
    }).limit(4);

    res.status(200).json({
      success: true,
      data: similar
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Search suggestions
// @route   GET /api/products/search/suggestions
// @access  Public
exports.getSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Match product names or categories containing the query
    const suggestions = await Product.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ],
      status: 'published'
    })
      .select('name category')
      .limit(6);

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (err) {
    next(err);
  }
};
