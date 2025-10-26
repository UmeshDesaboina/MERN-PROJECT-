const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Update profile but do not allow changing email or password here
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Disallow changing email and password via this endpoint
    if (typeof req.body.email !== 'undefined' && req.body.email !== user.email) {
      return res.status(400).json({ msg: 'Email cannot be changed' });
    }
    if (typeof req.body.password !== 'undefined') {
      return res.status(400).json({ msg: 'Password cannot be changed here' });
    }

    // Allow updating safe fields (extend as needed)
    if (typeof req.body.name === 'string') user.name = req.body.name;

    await user.save();
    const sanitized = user.toObject();
    delete sanitized.password;
    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
