const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');

exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) cart = new Cart({ user: req.user.id, items: [] });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.addToCart = async (req, res) => {
  const { productId, qty, size } = req.body;
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = new Cart({ user: req.user.id, items: [] });
    const itemIndex = cart.items.findIndex(i => i.product.toString() === productId && String(i.size || '') === String(size || ''));
    if (itemIndex > -1) cart.items[itemIndex].qty += qty;
    else cart.items.push({ product: productId, qty, size });
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.updateCart = async (req, res) => {
  const { productId, qty } = req.body;
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ msg: 'Cart not found' });
    const itemIndex = cart.items.findIndex(i => i.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].qty = qty;
      await cart.save();
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  const { productId } = req.body;
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    cart.items = cart.items.filter(i => i.product.toString() !== productId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Similar for Wishlist
exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products');
    if (!wishlist) wishlist = new Wishlist({ user: req.user.id, products: [] });
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.addToWishlist = async (req, res) => {
  const { productId } = req.body;
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) wishlist = new Wishlist({ user: req.user.id, products: [] });
    if (!wishlist.products.includes(productId)) wishlist.products.push(productId);
    await wishlist.save();
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  const { productId } = req.body;
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    wishlist.products = wishlist.products.filter(p => p.toString() !== productId);
    await wishlist.save();
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};