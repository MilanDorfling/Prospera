const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    userToken: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

incomeSchema.index({ userToken: 1, createdAt: -1 });

module.exports = mongoose.model('Income', incomeSchema);