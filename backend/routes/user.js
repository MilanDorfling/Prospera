const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { requireUserToken } = require('../middleware/auth');

// Token endpoint simplified: no DB access, just returns an existing or new token
router.post('/token', (req, res) => {
  const { userToken } = req.body || {};
  if (userToken) {
    // Echo back provided token without validation/storage
    return res.json({ userToken });
  }
  // Generate a new ephemeral token (not persisted)
  const newToken = uuidv4();
  return res.status(201).json({ userToken: newToken });
});

// GET /api/user/profile - Get user profile
router.get('/profile', requireUserToken, async (req, res) => {
  try {
    const userToken = req.userToken;
    let user = await User.findOne({ userToken });
    
    if (!user) {
      // Create user if doesn't exist
      user = await User.create({ userToken });
    }
    
    res.json({
      name: user.name,
      profilePhoto: user.profilePhoto,
      currency: user.currency,
      theme: user.theme,
      monthlyBudget: user.monthlyBudget,
      notificationsEnabled: user.notificationsEnabled,
      language: user.language,
      hapticFeedbackEnabled: user.hapticFeedbackEnabled,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/user/profile - Update user profile
router.put('/profile', requireUserToken, async (req, res) => {
  try {
    const userToken = req.userToken;
    const updates = req.body;
    
    // Validate and sanitize updates
    const allowedFields = ['name', 'profilePhoto', 'currency', 'theme', 'monthlyBudget', 'notificationsEnabled', 'language', 'hapticFeedbackEnabled'];
    const sanitizedUpdates = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        sanitizedUpdates[field] = updates[field];
      }
    }
    
    // Trim string fields
    if (typeof sanitizedUpdates.name === 'string') sanitizedUpdates.name = sanitizedUpdates.name.trim();
    if (typeof sanitizedUpdates.profilePhoto === 'string') sanitizedUpdates.profilePhoto = sanitizedUpdates.profilePhoto.trim();
    if (typeof sanitizedUpdates.currency === 'string') sanitizedUpdates.currency = sanitizedUpdates.currency.trim();
    if (typeof sanitizedUpdates.language === 'string') sanitizedUpdates.language = sanitizedUpdates.language.trim();
    
    // Upsert user
    const user = await User.findOneAndUpdate(
      { userToken },
      sanitizedUpdates,
      { new: true, upsert: true, runValidators: true }
    );
    
    res.json({
      name: user.name,
      profilePhoto: user.profilePhoto,
      currency: user.currency,
      theme: user.theme,
      monthlyBudget: user.monthlyBudget,
      notificationsEnabled: user.notificationsEnabled,
      language: user.language,
      hapticFeedbackEnabled: user.hapticFeedbackEnabled,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
