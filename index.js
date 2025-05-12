//import the necessary modules
const express = require ('express:');
const path = require ('path');
const fs = require ('fs');
const app = express();

//set up the server to handle JSON input
app.use(express.json());

//define the port the server will run on
const PORT = 3000;

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
    
//Endpoint to get a transaction 
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

//start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});