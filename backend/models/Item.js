const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemName:    { type: String, required: true },
  description: { type: String },
  type:        { type: String, enum: ['Lost', 'Found'], required: true },
  location:    { type: String, required: true },
  date:        { type: Date, default: Date.now },
  contactInfo: { type: String, required: true }
});

module.exports = mongoose.model('Item', itemSchema);