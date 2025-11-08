const express = require('express');
const router = express.Router();
const Income = require('../models/Income');

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

// Create income
router.post('/', requireUserToken, async (req, res) => {
  try {
    const { name, amount } = req.body;
    console.log('[income] POST /api/income', {
      name,
      amount,
      userToken: req.userToken?.slice(0, 8) + '...'
    });
    if (name == null || amount == null) {
      return res.status(400).json({ error: 'name and amount required' });
    }
    const income = new Income({ name, amount, userToken: req.userToken });
    await income.save();
    res.status(201).json(income);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all income for a user
router.get('/', requireUserToken, async (req, res) => {
  try {
    console.log('[income] GET /api/income for user', req.userToken?.slice(0, 8) + '...');
    const rows = await Income.find({ userToken: req.userToken }).sort({ createdAt: -1 });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update income
router.put('/:id', requireUserToken, async (req, res) => {
  try {
    const update = { ...req.body };
    delete update.userToken;
    console.log('[income] PUT /api/income/:id', req.params.id, 'user', req.userToken?.slice(0, 8) + '...');
    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, userToken: req.userToken },
      update,
      { new: true }
    );
    if (!income) return res.status(404).json({ error: 'Income not found' });
    res.json(income);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete income
router.delete('/:id', requireUserToken, async (req, res) => {
  try {
    console.log('[income] DELETE /api/income/:id', req.params.id, 'user', req.userToken?.slice(0, 8) + '...');
    const del = await Income.findOneAndDelete({ _id: req.params.id, userToken: req.userToken });
    if (!del) return res.status(404).json({ error: 'Income not found' });
    res.json({ message: 'Income deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;