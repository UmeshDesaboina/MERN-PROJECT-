const express = require('express');
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  resetPasswordMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Standard auth
router.post('/register', register);
router.post('/login', login);

// Public password reset (no login)
router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword', resetPassword);
router.post('/resetpassword-direct', require('../controllers/authController').resetPasswordDirect);

// Logged-in password change
router.post('/resetpassword-me', protect, resetPasswordMe);

module.exports = router;
