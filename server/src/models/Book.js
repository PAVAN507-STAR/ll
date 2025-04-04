const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  class: { type: String, required: true },
  copies: { type: Number, required: true },
  status: { type: Boolean, default: true },
  issuedCopies: { type: Number, default: 0 },
  addedAt: { type: Date, default: Date.now },
  // Add new field to track which users have borrowed this book
  issuedTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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

// Add a virtual field for available copies
bookSchema.virtual('availableCopies').get(function() {
  return this.copies - this.issuedCopies;
});

// Ensure virtuals are included in JSON output
bookSchema.set('toJSON', { virtuals: true });
bookSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Book", bookSchema);
