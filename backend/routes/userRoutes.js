const express = require('express');
const { getProfile, updateProfile, deleteUser } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Admin: delete user (fallback route)
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
