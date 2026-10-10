const Database = require('better-sqlite3');
const db = new Database('msme.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    type TEXT NOT NULL DEFAULT 'Customer',
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

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

// Add sample transactions only when the database is empty
const count = db.prepare('SELECT COUNT(*) AS total FROM transactions').get();

if (count.total === 0) {
  const insert = db.prepare(`
    INSERT INTO transactions (type, title, category, amount, date)
    VALUES (?, ?, ?, ?, ?)
  `);

  insert.run('Sale', 'Restaurant orders', 'Sales', 8500, 'Today');
  insert.run('Expense', 'Vegetable supplies', 'Inventory', 2200, 'Today');
}

// Get all transactions from SQLite
app.get('/api/transactions', (req, res) => {
  const transactions = db.prepare(
    'SELECT * FROM transactions ORDER BY id DESC'
  ).all();

  res.json({ success: true, data: transactions });
});

// Get all customers and leads
app.get('/api/customers', (req, res) => {
  const customers = db.prepare(
    'SELECT * FROM customers ORDER BY id DESC'
  ).all();

  res.json({ success: true, data: customers });
});

// Add a customer or lead
app.post('/api/customers', (req, res) => {
  const { name, phone, type, notes } = req.body;

  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Customer name is required.',
    });
  }

  if (!['Customer', 'Lead'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Type must be Customer or Lead.',
    });
  }

  const result = db.prepare(`
    INSERT INTO customers (name, phone, type, notes)
    VALUES (?, ?, ?, ?)
  `).run(
    name.trim(),
    typeof phone === 'string' ? phone.trim() : '',
    type,
    typeof notes === 'string' ? notes.trim() : ''
  );

  const customer = db.prepare(
    'SELECT * FROM customers WHERE id = ?'
  ).get(result.lastInsertRowid);

  res.status(201).json({ success: true, data: customer });
});


// Update a customer or lead
app.put('/api/customers/:id', (req, res) => {
  const { name, phone, type, notes } = req.body;
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      success: false,
      message: 'Invalid customer ID.',
    });
  }

  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Customer name is required.',
    });
  }

  if (!['Customer', 'Lead'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Type must be Customer or Lead.',
    });
  }

  const result = db.prepare(`
    UPDATE customers
    SET name = ?, phone = ?, type = ?, notes = ?
    WHERE id = ?
  `).run(
    name.trim(),
    typeof phone === 'string' ? phone.trim() : '',
    type,
    typeof notes === 'string' ? notes.trim() : '',
    id
  );

  if (result.changes === 0) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found.',
    });
  }

  const customer = db.prepare(
    'SELECT * FROM customers WHERE id = ?'
  ).get(id);

  res.json({ success: true, data: customer });
});


// Delete a customer or lead
app.delete('/api/customers/:id', (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      success: false,
      message: 'Invalid customer ID.',
    });
  }

  const result = db.prepare(
    'DELETE FROM customers WHERE id = ?'
  ).run(id);

  if (result.changes === 0) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found.',
    });
  }

  res.json({
    success: true,
    message: 'Customer deleted successfully.',
  });
});


// Add a transaction to SQLite
app.post('/api/transactions', (req, res) => {
  const { type, title, amount } = req.body;

  if (!['Sale', 'Expense'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Type must be Sale or Expense.',
    });
  }

  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: 'A transaction description is required.',
    });
  }

  if (
    amount === undefined ||
    amount === null ||
    amount === '' ||
    !Number.isFinite(Number(amount)) ||
    Number(amount) <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be a positive number.',
    });
  }

  const category = type === 'Sale' ? 'Sales' : 'General';
  const date = new Date().toISOString().slice(0, 10);

  const result = db.prepare(`
    INSERT INTO transactions (type, title, category, amount, date)
    VALUES (?, ?, ?, ?, ?)
  `).run(type, title.trim(), category, Number(amount), date);

  const transaction = db.prepare(
    'SELECT * FROM transactions WHERE id = ?'
  ).get(result.lastInsertRowid);

  res.status(201).json({ success: true, data: transaction });
});



app.listen(PORT, () => {
  console.log(`MSME backend running at http://localhost:${PORT}`);
});