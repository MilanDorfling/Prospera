const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema({
  userToken: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true },
  targetAmount: { type: Number, required: true, min: 0 },
  currentAmount: { type: Number, default: 0, min: 0 },
  targetDate: { type: Date, required: true },
  icon: {
    type: String,
    enum: ['car', 'home', 'airplane', 'school', 'heart-pulse', 'piggy-bank', 'star'],
    default: 'piggy-bank'
  },
  // Optional user-selected color (hex or rgba string)
  color: { type: String, trim: true },
  monthlyContribution: { type: Number, default: 0, min: 0 },
  completedAt: { type: Date, default: null },
}, {
  timestamps: true
});

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
