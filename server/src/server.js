require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config/config');
const authMiddleware = require('./middlewares/authMiddleware');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(config.DB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('DB connection error:', err));

// Auth Routes (unprotected)
app.use('/api/auth', require('./routes/authRoutes'));

// Protected Routes
app.use('/api/books', authMiddleware, require('./routes/bookRoutes'));
app.use('/api/users', authMiddleware, require('./routes/userRoutes'));
app.use('/api/finance', authMiddleware, require('./routes/financeRoutes'));
app.use('/api/coupons', authMiddleware, require('./routes/couponRoutes'));

// Start server
const PORT = config.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
