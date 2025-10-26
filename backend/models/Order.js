const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // 15-digit human-friendly order identifier (in addition to _id)
  orderId: { type: String, unique: true, index: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    qty: Number,
    price: Number,
    size: String,
  }],
  total: Number,
  status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  // Online payments supported via UPI deep link; QR is disabled
  paymentMethod: { type: String, enum: ['COD', 'ONLINE'] },
  // qrCode removed from usage; keeping field optional for backward compatibility if present in old docs
  qrCode: String,
  upiUri: String, // UPI deep link for ONLINE payments
  transactionId: String, // Customer-submitted UPI transaction/reference ID
  paymentStatus: { type: String, enum: ['Pending', 'Submitted', 'Paid', 'Failed'], default: 'Pending' },
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  shippingAddress: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String }
  },
  // Shipping info set by admin when order is shipped (top-level for easy querying)
  courierName: { type: String },
  trackingId: { type: String },
  courierUrl: { type: String },
  shippedAt: { type: Date },
  deliveredAt: { type: Date },
  // Structured tracking details (for Atlas schema clarity)
  tracking: {
    courierName: { type: String },
    trackingId: { type: String },
    url: { type: String },
    history: [{
      status: { type: String },
      at: { type: Date, default: Date.now }
    }]
  }
}, { timestamps: true, strict: true });

module.exports = mongoose.model('Order', orderSchema);
