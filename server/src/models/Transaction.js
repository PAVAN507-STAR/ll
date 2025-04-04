const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: String,  // e.g., "membership", "book issue fine", "marketing", "new book", etc.
  amount: { type: Number, required: true },
  description: String,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', transactionSchema);
