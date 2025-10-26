const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const mongoose = require('mongoose');

const calcSubtotalFromItems = async (items) => {
  // Recalculate prices from DB to avoid trusting client input
  let subtotal = 0;
  for (const item of items) {
    try {
      if (!item?.product || !mongoose.Types.ObjectId.isValid(item.product)) continue;
      const product = await Product.findById(item.product);
      if (!product) continue;
      subtotal += (product.price || 0) * (item.qty || 0);
    } catch (_) {
      continue;
    }
  }
  return subtotal;
};

// Generate a 15-digit numeric orderId. Low collision risk; ensure uniqueness with a quick retry loop.
const generateOrderId = () => {
  let s = '';
  while (s.length < 15) s += Math.floor(Math.random() * 10).toString();
  if (s[0] === '0') s = '1' + s.slice(1); // avoid leading zero
  return s;
};

// Build a public tracking URL from courier name + tracking ID (best-effort)
const buildTrackingUrl = (courierName, trackingId) => {
  const n = String(courierName || '').toLowerCase();
  const id = encodeURIComponent(String(trackingId || ''));
  if (!id) return '';
  if (n.includes('bluedart')) return `https://www.bluedart.com/track?track=${id}`;
  if (n.includes('dtdc')) return `https://www.dtdc.in/tracking/tracking_results.asp?Ttype=awb_no&strCnno=${id}`;
  if (n.includes('delhivery')) return `https://www.delhivery.com/track/package/${id}`;
  if (n.includes('ekart')) return `https://ekartlogistics.com/track/${id}`;
  if (n.includes('xpressbees')) return `https://www.xpressbees.com/track-shipment?isawb=Yes&trackid=${id}`;
  if (n.includes('india post') || n.includes('speed post')) return `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx`;
  return '';
};

const computeDiscountAmount = (subtotal, cp) => {
  if (!cp) return 0;
  if (!cp.isActive) return 0;
  if (cp.expiration && new Date(cp.expiration) < new Date()) return 0;
  if (cp.minAmount && subtotal < cp.minAmount) return 0;
  // Treat discount as percentage (Admin UI labels Discount (%))
  const pct = Math.max(0, Math.min(100, cp.discount || 0));
  const amount = (subtotal * pct) / 100;
  return Math.round((amount + Number.EPSILON) * 100) / 100; // round to 2 decimals
};

exports.listPublicCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({ isActive: true, expiration: { $gt: now } })
      .select('code discount minAmount expiration');
    return res.json(coupons);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ msg: 'Coupon code required' });

    // Get user's cart subtotal
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    const subtotal = cart?.items?.reduce((acc, i) => acc + ((i.product?.price || 0) * (i.qty || 0)), 0) || 0;

    const cp = await Coupon.findOne({ code: code });
    if (!cp) return res.status(400).json({ msg: 'Invalid coupon code' });

    const discount = computeDiscountAmount(subtotal, cp);
    if (discount <= 0) {
      return res.status(400).json({ msg: 'Coupon not applicable' });
    }

    return res.json({ discount });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { items, paymentMethod, couponCode, shippingAddress } = req.body;

    // Basic validation to avoid 500s on bad input/auth
    if (!req.user) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ msg: 'No items to order' });
    }

    // Recalculate subtotal securely
    const subtotal = await calcSubtotalFromItems(items);

    // Optional coupon
    let couponDoc = null;
    if (couponCode) {
      couponDoc = await Coupon.findOne({ code: couponCode });
    }
    const discount = computeDiscountAmount(subtotal, couponDoc);
    const finalTotal = Math.max(0, Math.round(((subtotal - discount) + Number.EPSILON) * 100) / 100);

  // Generate unique 15-digit orderId (retry a few times on collision)
  let orderId = generateOrderId();
  for (let i = 0; i < 3; i++) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await Order.findOne({ orderId }).select('_id');
    if (!exists) break;
    orderId = generateOrderId();
  }

  // Build UPI URI for ONLINE payments using fixed merchant UPI ID
  const payeeVPA = '6304538290@ybl';
  const payeeName = encodeURIComponent('Fight Wisdom');
  const amount = finalTotal.toFixed(2);
  const txnNote = encodeURIComponent(`Order ${orderId}`);
  const upiUri = `upi://pay?pa=${encodeURIComponent(payeeVPA)}&pn=${payeeName}&am=${amount}&cu=INR&tn=${txnNote}`;

  const couponId = couponDoc ? couponDoc._id : undefined;
  const order = new Order({ 
    user: req.user.id, 
    orderId,
    items, 
    total: finalTotal, 
    paymentMethod, 
    upiUri: paymentMethod === 'ONLINE' ? upiUri : undefined,
    paymentStatus: paymentMethod === 'ONLINE' ? 'Pending' : undefined,
    coupon: couponId,
    shippingAddress,
    tracking: { history: [{ status: 'Pending', at: new Date() }] }
  });
    await order.save();

    // Update stock
    for (let item of items) {
      try {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock = Math.max(0, (product.stock || 0) - (item.qty || 0));
          await product.save();
        }
      } catch (_) {}
    }

    return res.json(order);
  } catch (err) {
    return res.status(500).json({ msg: err.message || 'Server Error' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('items.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user items.product');
    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, courierName, trackingId } = req.body;
    const now = new Date();

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    order.status = status;
    // Maintain top-level fields
    if (status === 'Shipped') {
      if (courierName) order.courierName = courierName;
      if (trackingId) order.trackingId = trackingId;
      // If a URL was provided on request, prefer it; else attempt to build
      const reqUrl = (req.body.courierUrl || '').trim();
      order.courierUrl = reqUrl || buildTrackingUrl(order.courierName, order.trackingId);
      order.shippedAt = now;
    }
    if (status === 'Delivered') {
      order.deliveredAt = now;
    }

    // Keep structured tracking too
    order.tracking = order.tracking || { history: [] };
    if (courierName) order.tracking.courierName = courierName;
    if (trackingId) order.tracking.trackingId = trackingId;
    if (order.courierUrl) order.tracking.url = order.courierUrl;
    order.tracking.history = order.tracking.history || [];
    order.tracking.history.push({ status, at: now });

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Customer submits UPI transaction/reference ID after paying in app
exports.submitTransaction = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const tx = String(transactionId || '').trim();
    if (!tx) return res.status(400).json({ msg: 'transactionId is required' });
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) return res.status(404).json({ msg: 'Order not found or not owned by user' });
    order.transactionId = tx;
    order.paymentStatus = 'Submitted';
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Admin verifies transaction and marks as Paid/Failed (does not auto-change shipping status)
exports.markTransaction = async (req, res) => {
  const { success, transactionId } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });
    const tx = String(transactionId || '').trim();
    if (tx) order.transactionId = tx;
    order.paymentStatus = success ? 'Paid' : 'Failed';
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
