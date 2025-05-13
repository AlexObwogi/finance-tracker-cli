//import the necessary modules
const express = require ('express');
const path = require ('path');
const fs = require ('fs');
const app = express();

//set up the server to handle JSON input
app.use(express.json());

//define the port the server will run on
const PORT = 3000;

//define the path to the transactions.json file
//use path.join to create a cross-platform compatible path
//__dirname is a global variable that contains the path to the current directory
const filePath = path.join(__dirname, 'transactions.json');

//check if the transactions.json file exists, if not create it
if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]');
}

//endpoint for all root requests
app.get('/', (req, res) => {
    res.send('Welcome to the Expense Tracker API');
});
 
//Endpoint to get all transactions
app.get('/transactions', (req, res) => {

    //read the transactions from the JSOn file
    fs.readFile('transactions.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({Message: 'Error reading file.'});
            return;
        }
        res.json(JSON.parse(data));
    });
});
    
//Endpoint to add a transaction 
app.post('/transactions', (req, res) => {
const {description, amount, date} = req.body;

if (!description || !amount || !date) {
    res.status(400).json({message: 'Missing required fields.'});
    return;
}

const newTransaction = {description, amount , date};

//read the current transactions from the JSON file
fs.readFile('transactions.json', 'utf-8', (err, data) => {
    if (err) {
        res.status(500).json({message: 'Error reading file.'});
        return;
    }
    const transactions = JSON.parse(data);
    transactions.push(newTransaction);

    //write the updated transactions back to the JSON file
    fs.writeFile('transactions.json', JSON.stringify(transactions, null, 2), (err) => {
        if (err) {
            res.status(500).json({message: 'Error writing file.'});
            return;
        }
        res.status(201).json(newTransaction);
       
    });
});
});

//Endpoint to delete a transaction
app.delete('transactions/:index', (req, res) => {
    const index = parseInt(req.params.index, 10);

    //read the exiting transactions from the JSON file
    fs.readFile('transactions.json', 'utf-8', (err,data) => {
        if (err) {
            res.status(500).json({message: 'Error reading file.'});
            return;
        }
        const transactions = JSON.parse(data);

        //check if the index is valid
        if (index < 0 || index >= transactions.length) {
            res.status(404).json({message: 'Transaction not found.'});
            return;
        }

        //remove the transaction from the array
        transactions.splice(index, 1);

        //write the updated transactions back to the JSON file
        fs.writeFile('transactions.json', JSON.stringify(transactions, null, 2), (err) => {
            if (err) {
                res.status(500).json({message: 'Error writing file.'});
                return;
            }
            res.status(200).json({message: 'Transaction deleted successfully.'});
        });
    });
});

//Endpoint to check monthly balance
app.get('/balance/:year/:month', (req, res) => {
    const {year,month} = req.params;

    fs.readFile('transactions.json', 'utf-8', (err, data) => {
        if (err) {
            res.status(500).json({message: 'Error reading file.'});
            return;
        }
        const transactions = JSON.parse(data);

        //filter the transactions for the given  month and year
        const filtered = transactions.filter (tx => {
            const txDate = new Date(tx.date);
            return (
                txDate.getFullYear() === parseInt(year) &&
                txDate.getFullMonth() === parseInt(month) - 1 // month is 0-indexed in JS
            );
        });

        //calculate the total balance
        const balance = filtered.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
        res.json({
            month: `${year}-${month}`,
            totalTansactions: filtered.length,
            balance
        });
    });
});

//start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});