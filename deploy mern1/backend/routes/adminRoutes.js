const express = require('express');
const { 
  getUsers, 
  getOrders, 
  blockUser, 
  updateOrderStatus, 
  getStats,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteUser
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stats', protect, admin, getStats);
router.get('/users', protect, admin, getUsers);
router.delete('/users/:id', protect, admin, deleteUser);
router.put('/users/:id/block', protect, admin, blockUser);

router.get('/orders', protect, admin, getOrders);
router.put('/orders/:id/status', protect, admin, updateOrderStatus);

router.get('/products', protect, admin, getProducts);
router.post('/products', protect, admin, createProduct);
router.put('/products/:id', protect, admin, updateProduct);
router.delete('/products/:id', protect, admin, deleteProduct);


module.exports = router;
