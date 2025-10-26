const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const { protect } = require('./middleware/authMiddleware');

const app = express();

connectDB();

// Relax CORS to avoid frontend origin mismatches during deployment/dev
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/cartwishlist', require('./routes/cartWishlistRoutes'));

// Direct auth reset endpoints to avoid router mismatch issues (dup safe)
const authCtrl = require('./controllers/authController');
app.post('/api/auth/resetpassword-me', protect, authCtrl.resetPasswordMe);

app.use(errorHandler);

module.exports = app;
