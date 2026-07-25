const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

const backupFilePath = path.join(__dirname, '../../data/persistent_products.json');

// Ensure data directory exists
const ensureDirExists = () => {
  const dir = path.dirname(backupFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Save all products to JSON file
exports.saveProductsToJSON = async () => {
  try {
    ensureDirExists();
    const products = await Product.find({});
    fs.writeFileSync(backupFilePath, JSON.stringify(products, null, 2));
    console.log(`💾 Saved ${products.length} products to persistent backup!`);
  } catch (err) {
    console.error('Failed to save products backup:', err.message);
  }
};

// Load products from JSON file if available
exports.loadProductsFromJSON = async () => {
  try {
    ensureDirExists();
    if (fs.existsSync(backupFilePath)) {
      const data = fs.readFileSync(backupFilePath, 'utf8');
      const products = JSON.parse(data);
      if (Array.isArray(products) && products.length > 0) {
        await Product.deleteMany({});
        await Product.insertMany(products);
        console.log(`📥 Restored ${products.length} products from persistent backup!`);
        return true;
      }
    }
  } catch (err) {
    console.error('Failed to restore products from backup:', err.message);
  }
  return false;
};
