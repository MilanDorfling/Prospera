const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    // Canonical category id (e.g., 'shopping', 'bills-utilities')
    category: { type: String, default: 'uncategorized', trim: true },
    color: { type: String, trim: true },
    userToken: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

expenseSchema.index({ userToken: 1, createdAt: -1 });

module.exports = mongoose.model('Expense', expenseSchema);