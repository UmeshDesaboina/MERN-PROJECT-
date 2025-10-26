const express = require('express');
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  sendSignupOtp,
  registerWithOtp,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Standard auth
router.post('/register', register);
router.post('/login', login);

// OTP-based signup (optional flow)
router.post('/send-signup-otp', sendSignupOtp);
router.post('/register-with-otp', registerWithOtp);

// OTP-based reset
router.post('/forgotpassword', forgotPassword); // now sends 4-digit OTP
router.post('/resetpassword', resetPassword); // expects { email, otp, password }

// Other variants
router.post('/resetpassword-simple', require('../controllers/authController').resetPasswordSimple);
router.post('/resetpassword-me', protect, require('../controllers/authController').resetPasswordMe);

module.exports = router;
