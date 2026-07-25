const express = require('express');
const { getCart, syncCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getCart);
router.post('/sync', syncCart);

module.exports = router;
