const express = require('express');
const { createOrder, getOrders, getOrder, updateOrderStatus, markTransaction, submitTransaction } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, admin, updateOrderStatus);
// Customer submits their UPI transaction ID
router.put('/:id/transaction/submit', protect, submitTransaction);
// Admin verifies/overrides transaction status
router.put('/:id/transaction', protect, admin, markTransaction);

module.exports = router;
