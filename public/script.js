// public/script.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("transactionForm");
  const descriptionInput = document.getElementById("description");
  const amountInput = document.getElementById("amount");
  const dateInput = document.getElementById("date");
  const categoryInput = document.getElementById("category");
  const transactionList = document.getElementById("transactionsList");
  const categorySummary = document.getElementById("categorySummary");
  const monthlyBalance = document.getElementById("monthlyBalance");

  // Load data on start
  fetchTransactions();
  fetchCategorySummary();
  fetchMonthlyBalance();

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const transaction = {
      description: descriptionInput.value,
      amount: parseFloat(amountInput.value),
      date: dateInput.value,
      category: categoryInput.value,
    };

    const res = await fetch("/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaction),
    });

    if (res.ok) {
      form.reset();
      fetchTransactions();
      fetchCategorySummary();
      fetchMonthlyBalance();
    } else {
      alert("Failed to add transaction.");
    }
  });

  // Fetch and display all transactions
  async function fetchTransactions() {
    try {
      const res = await fetch("/transactions");
      const data = await res.json();

      transactionList.innerHTML = "";
      data.forEach((tx, index) => {
        const div = document.createElement("div");
        div.classList.add("transaction");
        div.textContent = `${tx.date} - ${tx.description} - ${tx.amount} (${tx.category})`;

        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.onclick = async () => {
          await fetch(`/transactions/${index}`, { method: "DELETE" });
          fetchTransactions();
          fetchCategorySummary();
          fetchMonthlyBalance();
        };

        div.appendChild(delBtn);
        transactionList.appendChild(div);
      });
    } catch (err) {
      transactionList.innerHTML = "Failed to load transactions.";
    }
  }

  // Fetch and display category summary
  async function renderCategoryChart(data) {
    try {
      const res = await fetch("/report/category");
      const data = await res.json();

      categorySummary.innerHTML = "";
      for (const category in data) {
        const li = document.createElement("li");
        li.textContent = `${category}: ${data[category]}`;
        categorySummary.appendChild(li);
      }
    } catch (err) {
      categorySummary.innerHTML = "<li>Error loading summary.</li>";
    }
  }

  // Fetch and display current monthly balance
  async function renderTrendChart(data) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");

    try {
      const res = await fetch(`/balance/${year}/${month}`);
      const data = await res.json();

      monthlyBalance.textContent = `Month: ${data.month}, Transactions: ${data.totalTransactions}, Balance: ${data.balance}`;
    } catch (err) {
      monthlyBalance.textContent = "Error loading monthly balance.";
    }
  }
});
let categoryChart, trendChart;

function renderCategoryChart(data) {
  const ctx = document.getElementById('categoryChart').getContext('2d');
  if (categoryChart) categoryChart.destroy();

  categoryChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(data),
      datasets: [{
        label: 'Spending by Category',
        data: Object.values(data),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#9C27B0'],
      }]
    }
  });
}

function renderTrendChart(data) {
  const ctx = document.getElementById('trendChart').getContext('2d');
  if (trendChart) trendChart.destroy();

  const isNegative = data.balance < 0;
  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [data.month],
      datasets: [{
        label: 'Monthly Balance',
        data: [data.balance],
        borderColor: isNegative ? '#f44336' : '#4CAF50',
        backgroundColor: isNegative ? '#f44336aa' : '#4CAF50aa',
        fill: true
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
document.getElementById("themeToggle").addEventListener("change", (e) => {
  document.body.classList.toggle("dark", e.target.checked);
});
