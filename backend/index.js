require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan'); // ✅ for request logging
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // ✅ log every request in dev format

// Import routes
const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense');
const incomeRoutes = require('./routes/income');
const savingsGoalRoutes = require('./routes/savingsGoal');

// Health for connectivity checks
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/savings-goals', savingsGoalRoutes);

// Database connection
mongoose 
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Root route
app.get('/', (req, res) => {
  res.send('Prospera Backend Running 🚀');
});

// Server
const PORT = process.env.PORT || 5000;
// Explicitly bind to 0.0.0.0 so devices on LAN can reach the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
