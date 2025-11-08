const express = require('express');
const router = express.Router();
const SavingsGoal = require('../models/SavingsGoal');
const { requireUserToken } = require('../middleware/auth');

// GET all savings goals for authenticated user
router.get('/', requireUserToken, async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ userToken: req.userToken }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    console.error('[savings-goals:get] error', error);
    res.status(500).json({ error: 'Failed to fetch savings goals' });
  }
});

// POST create new savings goal
router.post('/', requireUserToken, async (req, res) => {
  try {
    const { name, targetAmount, currentAmount, targetDate, icon, monthlyContribution, color } = req.body;
    if (!name || targetAmount == null || !targetDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const goal = new SavingsGoal({
      userToken: req.userToken,
      name: String(name).trim(),
      targetAmount: Number(targetAmount),
      currentAmount: currentAmount != null ? Number(currentAmount) : 0,
      targetDate,
      icon: icon || 'piggy-bank',
      monthlyContribution: monthlyContribution != null ? Number(monthlyContribution) : 0,
      color: typeof color === 'string' ? color.trim() : undefined,
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    console.error('[savings-goals:post] error', error);
    res.status(500).json({ error: 'Failed to create savings goal' });
  }
});

// PUT update savings goal (scoped by userToken)
router.put('/:id', requireUserToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates.userToken; // never allow reassignment
    if (typeof updates.color === 'string') updates.color = updates.color.trim();

    const goal = await SavingsGoal.findOneAndUpdate(
      { _id: id, userToken: req.userToken },
      updates,
      { new: true }
    );
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    res.json(goal);
  } catch (error) {
    console.error('[savings-goals:put] error', error);
    res.status(500).json({ error: 'Failed to update savings goal' });
  }
});

// PATCH update current amount (progress) with completion check
router.patch('/:id/progress', requireUserToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentAmount } = req.body;
    if (typeof currentAmount !== 'number') {
      return res.status(400).json({ error: 'currentAmount must be a number' });
    }

    const goal = await SavingsGoal.findOne({ _id: id, userToken: req.userToken });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    goal.currentAmount = currentAmount;
    if (currentAmount >= goal.targetAmount && !goal.completedAt) {
      goal.completedAt = new Date();
    }
    await goal.save();
    res.json(goal);
  } catch (error) {
    console.error('[savings-goals:patch] error', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// DELETE savings goal (scoped by userToken)
router.delete('/:id', requireUserToken, async (req, res) => {
  try {
    const { id } = req.params;
    const goal = await SavingsGoal.findOneAndDelete({ _id: id, userToken: req.userToken });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    res.json({ message: 'Goal deleted', id });
  } catch (error) {
    console.error('[savings-goals:delete] error', error);
    res.status(500).json({ error: 'Failed to delete savings goal' });
  }
});

module.exports = router;
