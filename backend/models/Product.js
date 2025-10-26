const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, required: true },
  comment: String,
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  category: { type: String, enum: ['Streetwear', 'Sportswear', 'Dailywear', 'Accessories'], required: true },
  image: String, // Primary image URL (first of images)
  images: [{ type: String }], // Additional images
  sizes: [{ type: String }], // e.g., ['S','M','L','XL','XXL']
  brand: { type: String },
  reviews: [reviewSchema],
  averageRating: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);