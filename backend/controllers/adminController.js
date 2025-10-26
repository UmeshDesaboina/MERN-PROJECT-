const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');

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

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
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

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user').populate('items.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.createCoupon = async (req, res) => {
  const { code, discount, expiration, minAmount } = req.body;
  try {
    const coupon = new Coupon({ code, discount, expiration, minAmount });
    await coupon.save();
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { isBlocked } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, courierName, trackingId, courierUrl } = req.body;
    const now = new Date();
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    order.status = status;
    if (status === 'Shipped') {
      if (courierName !== undefined) order.courierName = courierName;
      if (trackingId !== undefined) order.trackingId = trackingId;
      const suppliedUrl = (courierUrl || '').trim();
      order.courierUrl = suppliedUrl || order.courierUrl || buildTrackingUrl(order.courierName, order.trackingId);
      order.shippedAt = now;
    }
    if (status === 'Delivered') {
      order.deliveredAt = now;
    }

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

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalRevenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    res.json({
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue: totalRevenueAgg[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.createProduct = async (req, res) => {
  const { name, description, price, category, stock, image, images = [], sizes = [], brand } = req.body;
  try {
    const imgs = Array.isArray(images) ? images.filter(Boolean) : [];
    const primary = image || imgs[0] || '';
    const cleanSizes = (Array.isArray(sizes) ? sizes : []).filter(s => s && String(s).toUpperCase() !== 'XXL');
    const product = new Product({ name, description, price, category, stock, image: primary, images: imgs, sizes: cleanSizes, brand });
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  const { name, description, price, category, stock, image, images = [], sizes = [], brand } = req.body;
  try {
    const updates = { name, description, price, category, stock, brand };
    if (Array.isArray(images)) updates.images = images.filter(Boolean);
    if (Array.isArray(sizes)) updates.sizes = sizes.filter(s => s && String(s).toUpperCase() !== 'XXL');
    if (image !== undefined) updates.image = image;
    // If no explicit primary image but images provided, set primary to first
    if (!updates.image && updates.images && updates.images.length) updates.image = updates.images[0];

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
