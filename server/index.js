const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Test route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'TEAM VISHVAKARMA MSME backend is running!',
  });
});

// Temporary in-memory transactions
let transactions = [
  { id: 1, type: 'Sale', title: 'Restaurant orders', category: 'Sales', amount: 8500, date: 'Today' },
  { id: 2, type: 'Expense', title: 'Vegetable supplies', category: 'Inventory', amount: 2200, date: 'Today' },
];

// Get all transactions
app.get('/api/transactions', (req, res) => {
  res.json({ success: true, data: transactions });
});

// Add a transaction
app.post('/api/transactions', (req, res) => {
  const { type, title, amount } = req.body;

  if (!['Sale', 'Expense'].includes(type)) {
    return res.status(400).json({ success: false, message: 'Type must be Sale or Expense.' });
  }

  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ success: false, message: 'A transaction description is required.' });
  }

  if (amount === undefined || amount === null || amount === '' || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: 'Amount must be a positive number.' });
  }

  const transaction = {
    id: Date.now(),
    type,
    title: title.trim(),
    category: type === 'Sale' ? 'Sales' : 'General',
    amount: Number(amount),
    date: new Date().toISOString().slice(0, 10),
  };

  transactions.unshift(transaction);
  res.status(201).json({ success: true, data: transaction });
});

app.listen(PORT, () => {
  console.log(`MSME backend running at http://localhost:${PORT}`);
});