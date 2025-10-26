const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendMail } = require('../utils/mailer');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

const normEmail = (v) => String(v || '').trim().toLowerCase();
const getEmail = (body) => normEmail(body?.email || body?.Email || body?.userEmail);
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const findUserByEmail = (email) => User.findOne({ email: new RegExp(`^${escapeRegExp(email)}$`, 'i') });

exports.register = async (req, res) => {
  const name = req.body.name;
  const email = getEmail(req.body);
  const password = req.body.password;
  const isAdmin = req.body.isAdmin;
  try {
    if (!email) return res.status(400).json({ msg: 'Email is required' });
    let user = await findUserByEmail(email);
    if (user) return res.status(400).json({ msg: 'User exists' });
    user = new User({ name, email, password, isAdmin });
    await user.save();
    res.json({ token: generateToken(user._id), user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.login = async (req, res) => {
  const email = getEmail(req.body);
  const password = req.body.password;
  try {
    const user = await findUserByEmail(email);
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ msg: 'Invalid credentials' });
    res.json({ token: generateToken(user._id), user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Public: request password reset link (no login, no OTP)
exports.forgotPassword = async (req, res) => {
  try {
    const email = getEmail(req.body);
    if (!email) return res.status(400).json({ msg: 'Email is required' });
    const user = await findUserByEmail(email);
    if (!user) return res.status(200).json({ msg: 'If that email exists, a reset link has been sent' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token; // in production consider hashing this
    user.resetTokenExpiration = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const appUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const link = `${appUrl}/forgotpassword?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}`;
    const subject = 'Reset your password';
    const text = `Click the link to reset your password: ${link}`;
    const html = `<p>Click the button to reset your password:</p><p><a href="${link}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;border-radius:6px;text-decoration:none">Reset Password</a></p><p>If the button doesn't work, copy and paste this URL into your browser:<br/>${link}</p>`;
    await sendMail({ to: user.email, subject, text, html });

    return res.json({ msg: 'If that email exists, a reset link has been sent' });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// Public: reset password with token received via email
exports.resetPassword = async (req, res) => {
  try {
    const email = getEmail(req.body);
    const token = req.body.token;
    const newPassword = req.body.password || req.body.newPassword;
    const confirm = req.body.confirmPassword || req.body.confirm;
    if (!email || !token || !newPassword || !confirm) return res.status(400).json({ msg: 'Email, token, and passwords are required' });
    if (newPassword !== confirm) return res.status(400).json({ msg: 'Passwords do not match' });

    const user = await findUserByEmail(email);
    if (!user || !user.resetToken || !user.resetTokenExpiration) return res.status(400).json({ msg: 'Invalid or expired token' });
    if (user.resetToken !== token || user.resetTokenExpiration < new Date()) {
      return res.status(400).json({ msg: 'Invalid or expired token' });
    }

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    return res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// Public: direct reset by email (no login, no email link, no OTP)
exports.resetPasswordDirect = async (req, res) => {
  try {
    const email = getEmail(req.body);
    const newPassword = req.body.password || req.body.newPassword;
    const confirmPassword = req.body.confirmPassword || req.body.confirm;
    if (!email || !newPassword || !confirmPassword) return res.status(400).json({ msg: 'Email, password, confirmPassword are required' });
    if (newPassword !== confirmPassword) return res.status(400).json({ msg: 'Passwords do not match' });
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    return res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// Reset/Change password for the currently authenticated user (no email required)
// Accepts either { newPassword, confirmPassword } or { password, confirmPassword }
exports.resetPasswordMe = async (req, res) => {
  try {
    const newPassword = req.body.newPassword ?? req.body.password;
    const confirmPassword = req.body.confirmPassword ?? req.body.newPasswordConfirm ?? req.body.confirm;

    if (!req.user || !req.user._id) return res.status(401).json({ msg: 'Not authorized' });
    if (!newPassword || !confirmPassword) return res.status(400).json({ msg: 'New password and confirm password are required' });
    if (newPassword !== confirmPassword) return res.status(400).json({ msg: 'Passwords do not match' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    return res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
