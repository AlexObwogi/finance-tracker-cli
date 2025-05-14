# 💰 Expense Tracker

A simple **Expense Tracker** built using **Node.js**, **JSON file storage**, and **vanilla JavaScript frontend**. No databases or frameworks required.

![screenshot](https://via.placeholder.com/800x400?text=Expense+Tracker+Screenshot)
*Simple, file-based expense tracking in your browser.*

---

## 🚀 Features

* ✅ Add income or expense transactions
* 📋 View a list of all transactions
* 📊 Monthly balance overview
* 🗂 Category-wise summary
* ❌ Delete transactions

---

## 📁 Project Structure

```plaintext
expense-tracker/
├── index.js              # Node.js backend (Express)
├── transactions.json     # Stores all transactions (auto-created)
├── public/
│   ├── index.html        # Frontend UI
│   └── script.js         # Frontend logic
└── README.md             # This file
```

---

## ⚙️ How to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/expense-tracker.git
cd expense-tracker
```

### 2. Install dependencies

```bash
npm install express
```

### 3. Start the server

```bash
node index.js
```

Go to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📬 API Endpoints

| Method | Endpoint                | Description                   |
| ------ | ----------------------- | ----------------------------- |
| GET    | `/transactions`         | List all transactions         |
| POST   | `/transactions`         | Add a new transaction         |
| DELETE | `/transactions/:index`  | Delete a transaction by index |
| GET    | `/report/category`      | Get category totals           |
| GET    | `/balance/:year/:month` | Get monthly balance summary   |

---

## 💾 Example Transaction Format

```json
{
  "description": "Groceries",
  "amount": -50.75,
  "date": "2025-05-10",
  "category": "Food"
}
```

* Positive `amount` = Income
* Negative `amount` = Expense

---

## 🧠 How It Works

* The frontend is served from the `public` folder using Express.
* All transactions are saved in a file called `transactions.json`.
* When you add, delete, or view transactions, the backend reads/writes that file.
* The frontend dynamically updates based on the responses using JavaScript.

---

## 📈 Example Output

**Request:**

```
GET /balance/2025/05
```

**Response:**

```json
{
  "month": "2025-05",
  "totalTransactions": 5,
  "balance": 1200
}
```

---

## 🌱 Future Improvements

* [ ] Edit transactions
* [ ] User login support
* [ ] Data visualization charts
* [ ] Migrate to a real database (MongoDB/SQLite)

---

## 👨‍💻 Author

**Your Name**
📧 [obwogialex728@gmail.com](mailto:obwogialex728@gmail.com)
🔗 [github.com/AlexObwogi](https://github.com/AlexObwogi)

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
