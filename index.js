const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve frontend files

const PORT = 3000;
const filePath = path.join(__dirname, 'transactions.json');

if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]');
}

app.get('/', (req, res) => {
    res.send('Welcome to the Expense Tracker API');
});

app.get('/transactions', (req, res) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ Message: 'Error reading file.' });
            return;
        }
        res.json(JSON.parse(data));
    });
});

app.post('/transactions', (req, res) => {
    const { description, amount, date, category } = req.body;

    if (!description || !amount || !date || !category) {
        res.status(400).json({ message: 'Missing required fields.' });
        return;
    }

    const newTransaction = { description, amount, date, category };

    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            res.status(500).json({ message: 'Error reading file.' });
            return;
        }

        const transactions = JSON.parse(data);
        transactions.push(newTransaction);

        fs.writeFile(filePath, JSON.stringify(transactions, null, 2), (err) => {
            if (err) {
                res.status(500).json({ message: 'Error writing file.' });
                return;
            }
            res.status(201).json(newTransaction);
        });
    });
});

app.get('/report/category', (req, res) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ message: 'Error reading file.' });
            return;
        }

        const transactions = JSON.parse(data);
        const report = {};

        transactions.forEach(tx => {
            const category = tx.category || 'Uncategorized';
            const amount = parseFloat(tx.amount);

            if (!report[category]) {
                report[category] = 0;
            }

            report[category] += amount;
        });

        res.json(report);
    });
});

app.delete('/transactions/:index', (req, res) => {
    const index = parseInt(req.params.index, 10);

    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            res.status(500).json({ message: 'Error reading file.' });
            return;
        }

        const transactions = JSON.parse(data);

        if (index < 0 || index >= transactions.length) {
            res.status(404).json({ message: 'Transaction not found.' });
            return;
        }

        transactions.splice(index, 1);

        fs.writeFile(filePath, JSON.stringify(transactions, null, 2), (err) => {
            if (err) {
                res.status(500).json({ message: 'Error writing file.' });
                return;
            }
            res.status(200).json({ message: 'Transaction deleted successfully.' });
        });
    });
});

app.get('/balance/:year/:month', (req, res) => {
    const { year, month } = req.params;

    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            res.status(500).json({ message: 'Error reading file.' });
            return;
        }

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
