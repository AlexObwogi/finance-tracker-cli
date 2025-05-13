// public/script.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("transaction-form");
  const descriptionInput = document.getElementById("description");
  const amountInput = document.getElementById("amount");
  const dateInput = document.getElementById("date");
  const categoryInput = document.getElementById("category");
  const transactionList = document.getElementById("transaction-list");
  const categorySummary = document.getElementById("category-summary");
  const monthForm = document.getElementById("month-form");
  const monthlyBalance = document.getElementById("monthly-balance");

  // Load all data on start
  fetchTransactions();
  fetchCategorySummary();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const transaction = {
      description: descriptionInput.value,
      amount: parseFloat(amountInput.value),
      date: dateInput.value,
      category: categoryInput.value
    };

    const res = await fetch("/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaction)
    });

    if (res.ok) {
      form.reset();
      fetchTransactions();
      fetchCategorySummary();
    }
  });

  async function fetchTransactions() {
    const res = await fetch("/transactions");
    const data = await res.json();

    transactionList.innerHTML = "";
    data.forEach((tx, index) => {
      const li = document.createElement("li");
      li.textContent = `${tx.date} - ${tx.description} - ${tx.amount} (${tx.category})`;

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.onclick = async () => {
        await fetch(`/transactions/${index}`, { method: "DELETE" });
        fetchTransactions();
        fetchCategorySummary();
      };

      li.appendChild(delBtn);
      transactionList.appendChild(li);
    });
  }

  async function fetchCategorySummary() {
    const res = await fetch("/report/category");
    const data = await res.json();

    categorySummary.innerHTML = "";
    for (const category in data) {
      const li = document.createElement("li");
      li.textContent = `${category}: ${data[category]}`;
      categorySummary.appendChild(li);
    }
  }

  monthForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const monthValue = document.getElementById("month").value;
    const [year, month] = monthValue.split("-");

    const res = await fetch(`/balance/${year}/${month}`);
    const data = await res.json();

    monthlyBalance.textContent = `Month: ${data.month}, Transactions: ${data.totalTransactions}, Balance: ${data.balance}`;
  });
});
