const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Otp = require('../models/Otp');
const { sendOtpEmail } = require('../utils/mailer');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

const generate4DigitOtp = () => Math.floor(1000 + Math.random() * 9000).toString();
const hash = (val) => crypto.createHash('sha256').update(val).digest('hex');

exports.register = async (req, res) => {
  const { name, email, password, isAdmin } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User exists' });
    user = new User({ name, email, password, isAdmin });
    await user.save();
    res.json({ token: generateToken(user._id), user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ msg: 'Invalid credentials' });
    res.json({ token: generateToken(user._id), user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Send OTP for signup (optional signup flow)
exports.sendSignupOtp = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) return res.status(400).json({ msg: 'Email is required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: 'User already registered with this email' });
    const code = generate4DigitOtp();
    const codeHash = hash(code);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await Otp.findOneAndUpdate(
      { email, purpose: 'signup' },
      { codeHash, expiresAt },
      { upsert: true, setDefaultsOnInsert: true, new: true }
    );
    await sendOtpEmail(email, code, 'signup');
    return res.json({ msg: 'OTP sent to email for signup verification' });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// Complete signup using OTP
exports.registerWithOtp = async (req, res) => {
  const { name, email, password, otp } = req.body;
  try {
    if (!name || !email || !password || !otp) return res.status(400).json({ msg: 'All fields are required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: 'User already registered' });
    const rec = await Otp.findOne({ email, purpose: 'signup' });
    if (!rec || rec.expiresAt < new Date()) return res.status(400).json({ msg: 'OTP invalid or expired' });
    if (rec.codeHash !== hash(otp)) return res.status(400).json({ msg: 'Invalid OTP' });
    // OTP valid -> create user
    const user = new User({ name, email, password });
    await user.save();
    await Otp.deleteOne({ _id: rec._id });
    return res.json({ token: generateToken(user._id), user });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// Send OTP for password reset (forgot password)
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    const code = generate4DigitOtp();
    const codeHash = hash(code);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await Otp.findOneAndUpdate(
      { email, purpose: 'reset' },
      { codeHash, expiresAt },
      { upsert: true, setDefaultsOnInsert: true, new: true }
    );
    await sendOtpEmail(email, code, 'reset');
    return res.json({ msg: 'OTP sent to email for password reset' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Reset password using OTP
exports.resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;
  try {
    if (!email || !otp || !password) return res.status(400).json({ msg: 'Email, OTP and new password are required' });
    const rec = await Otp.findOne({ email, purpose: 'reset' });
    if (!rec || rec.expiresAt < new Date()) return res.status(400).json({ msg: 'OTP invalid or expired' });
    if (rec.codeHash !== hash(otp)) return res.status(400).json({ msg: 'Invalid OTP' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    user.password = password;
    await user.save();
    await Otp.deleteOne({ _id: rec._id });
    res.json({ msg: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Simple reset without email/token (by email) - as requested
exports.resetPasswordSimple = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) return res.status(400).json({ msg: 'Email and new password are required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    return res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// Reset password for the currently authenticated user (no email required)
exports.resetPasswordMe = async (req, res) => {
  try {
    const { password } = req.body;
    if (!req.user || !req.user._id) return res.status(401).json({ msg: 'Not authorized' });
    if (!password) return res.status(400).json({ msg: 'New password is required' });
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    return res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
