const express = require('express');
const { getCart, addToCart, updateCart, removeFromCart, getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/cartWishlistController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/cart', protect, getCart);
router.post('/cart', protect, addToCart);
router.put('/cart', protect, updateCart);
router.delete('/cart', protect, removeFromCart);

router.get('/wishlist', protect, getWishlist);
router.post('/wishlist', protect, addToWishlist);
router.delete('/wishlist', protect, removeFromWishlist);

module.exports = router;