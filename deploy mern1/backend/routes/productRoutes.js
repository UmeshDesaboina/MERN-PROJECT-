const express = require('express');
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview, uploadImage } = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, admin, uploadImage, createProduct);
router.put('/:id', protect, admin, uploadImage, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:id/reviews', protect, addReview);

module.exports = router;