const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = 3000;
const filePath = path.join(__dirname, 'transactions.json');

// Middleware to serve frontend and parse JSON
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Create an empty JSON file if it doesn't exist
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, '[]');
}

// === Routes ===

// Get all transactions
app.get('/transactions', (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error reading file.' });
    res.json(JSON.parse(data));
  });
});

// Add a new transaction
app.post('/transactions', (req, res) => {
  const { description, amount, date, category } = req.body;

  if (!description || !amount || !date || !category) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  const newTransaction = { description, amount, date, category };

  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error reading file.' });

    const transactions = JSON.parse(data);
    transactions.push(newTransaction);

    fs.writeFile(filePath, JSON.stringify(transactions, null, 2), (err) => {
      if (err) return res.status(500).json({ message: 'Error writing file.' });
      res.status(201).json(newTransaction);
    });
  });
});

// Delete a transaction by index
app.delete('/transactions/:index', (req, res) => {
  const index = parseInt(req.params.index, 10);

  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error reading file.' });

    const transactions = JSON.parse(data);

    if (index < 0 || index >= transactions.length) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    transactions.splice(index, 1);

    fs.writeFile(filePath, JSON.stringify(transactions, null, 2), (err) => {
      if (err) return res.status(500).json({ message: 'Error writing file.' });
      res.status(200).json({ message: 'Transaction deleted successfully.' });
    });
  });
});

// Get category summary
app.get('/report/category', (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error reading file.' });

    const transactions = JSON.parse(data);
    const report = {};

    transactions.forEach(tx => {
      const category = tx.category || 'Uncategorized';
      const amount = parseFloat(tx.amount);

      report[category] = (report[category] || 0) + amount;
    });

    res.json(report);
  });
});

// Get monthly balance
app.get('/balance/:year/:month', (req, res) => {
  const { year, month } = req.params;

  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Error reading file.' });

    const transactions = JSON.parse(data);
    const filtered = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return (
        txDate.getFullYear() === parseInt(year) &&
        txDate.getMonth() === parseInt(month) - 1
      );
    });

    const balance = filtered.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

    res.json({
      month: `${year}-${month}`,
      totalTransactions: filtered.length,
      balance
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
