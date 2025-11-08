const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userToken: { type: String, required: true, unique: true },
  name: { type: String, trim: true, default: '' },
  profilePhoto: { type: String, trim: true, default: null },
  currency: { type: String, trim: true, default: 'USD' },
  theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
  monthlyBudget: { type: Number, min: 0, default: null },
  notificationsEnabled: { type: Boolean, default: true },
  language: { type: String, trim: true, default: 'en' },
  hapticFeedbackEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
