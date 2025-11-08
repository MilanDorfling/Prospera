const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

function extractToken(req) {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return req.query.userToken || req.body.userToken;
}

function requireUserToken(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(400).json({ error: 'userToken required' });
  req.userToken = token;
  next();
}

// Create expense
router.post('/', requireUserToken, async (req, res) => {
  try {
    const { name, amount, color, category } = req.body;
    console.log('[expense] POST /api/expenses', {
      name,
      amount,
      hasColor: Boolean(color),
      category,
      userToken: req.userToken?.slice(0, 8) + '...'
    });
    if (name == null || amount == null) {
      return res.status(400).json({ error: 'name and amount required' });
    }
    const expense = new Expense({
      name,
      amount,
      color,
      category: category || 'uncategorized',
      userToken: req.userToken,
    });
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all expenses for a user
router.get('/', requireUserToken, async (req, res) => {
  try {
    console.log('[expense] GET /api/expenses for user', req.userToken?.slice(0, 8) + '...');
    const expenses = await Expense.find({ userToken: req.userToken }).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update expense
router.put('/:id', requireUserToken, async (req, res) => {
  try {
    const update = { ...req.body };
    // Never allow changing userToken through update
    delete update.userToken;
    console.log('[expense] PUT /api/expenses/:id', req.params.id, 'user', req.userToken?.slice(0, 8) + '...');
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userToken: req.userToken },
      update,
      { new: true }
    );
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete expense
router.delete('/:id', requireUserToken, async (req, res) => {
  try {
    console.log('[expense] DELETE /api/expenses/:id', req.params.id, 'user', req.userToken?.slice(0, 8) + '...');
    const del = await Expense.findOneAndDelete({ _id: req.params.id, userToken: req.userToken });
    if (!del) return res.status(404).json({ error: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;