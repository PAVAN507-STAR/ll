const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    index: true // Add index for faster name searches
  },
  phone: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^\d+$/.test(v); // Only allow digits
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  class: {
    type: String,
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Add text index for better search
studentSchema.index({ name: 'text' });

module.exports = mongoose.model('Student', studentSchema); 