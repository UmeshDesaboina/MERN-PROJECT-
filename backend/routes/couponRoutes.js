const express = require('express');
const Coupon = require('../models/Coupon');

const router = express.Router();

// Public: list active, non-expired coupons
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({ isActive: true, expiration: { $gt: now } })
      .select('code discount minAmount expiration');
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;