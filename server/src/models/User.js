const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  age: Number,
  phone: { type: String, required: true },
  membershipActive: { type: Boolean, default: true },
  membershipStart: { type: Date, default: Date.now },
  balance: { type: Number, default: 100 }, // Initial balance for new users
  // Add new field to track which books this user has borrowed
  borrowedBooks: [{
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    },
    quantity: {
      type: Number,
      default: 1
    },
    issueDate: {
      type: Date,
      default: Date.now
    }
  }]
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
// Compare this snippet from server/src/models/IssueReturn.js: