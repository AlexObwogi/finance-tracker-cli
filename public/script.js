document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("transactionForm");
  const transactionList = document.getElementById("transactionsList");
  const categorySummary = document.getElementById("categorySummary");
  const monthlyBalance = document.getElementById("monthlyBalance");
  const yearSelect = document.getElementById("yearSelect");

  // Load initial data
  fetchTransactions();
  fetchCategorySummary();
  fetchMonthlyBalance();
  populateYearDropdown();

  // Theme toggle
  document.getElementById("themeToggle").addEventListener("change", (e) => {
    document.body.classList.toggle("dark-mode", e.target.checked);
  });

  // Handle new transaction form
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const transaction = {
      description: form.description.value,
      amount: parseFloat(form.amount.value),
      date: form.date.value,
      category: form.category.value
    };

    const res = await fetch("/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaction)
    });

    if (res.ok) {
      form.reset();
      refreshUI();
    } else {
      alert("Failed to add transaction.");
    }
  });

  // Refresh main sections
  function refreshUI() {
    fetchTransactions();
    fetchCategorySummary();
    fetchMonthlyBalance();
    renderYearlyTrend(yearSelect.value);
  }

  // Transactions List
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
          refreshUI();
        };

        div.appendChild(delBtn);
        transactionList.appendChild(div);
      });
    } catch {
      transactionList.innerHTML = "Failed to load transactions.";
    }
  }

  // Category Summary
  async function fetchCategorySummary() {
    try {
      const res = await fetch("/report/category");
      const data = await res.json();

      categorySummary.innerHTML = "";
      for (const category in data) {
        const li = document.createElement("li");
        li.textContent = `${category}: ${data[category]}`;
        categorySummary.appendChild(li);
      }

      renderCategoryChart(data);
    } catch {
      categorySummary.innerHTML = "<li>Error loading summary.</li>";
    }
  }

  // Monthly Balance
  async function fetchMonthlyBalance() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");

    try {
      const res = await fetch(`/balance/${year}/${month}`);
      const data = await res.json();

      monthlyBalance.textContent = `Month: ${data.month}, Transactions: ${data.totalTransactions}, Balance: ${data.balance}`;
      renderTrendChart(data);
    } catch {
      monthlyBalance.textContent = "Error loading monthly balance.";
    }
  }

  // Yearly Dropdown & Trends
  async function populateYearDropdown() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 10; i--) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      yearSelect.appendChild(option);
    }
    yearSelect.value = currentYear;
    renderYearlyTrend(currentYear);
  }

  yearSelect.addEventListener("change", () => {
    renderYearlyTrend(yearSelect.value);
  });

  async function renderYearlyTrend(year) {
    try {
      const res = await fetch(`/balance/year/${year}`);
      const data = await res.json();
      renderYearlyChart(data);
    } catch {
      console.error("Failed to fetch yearly trend.");
    }
  }
});

// Charts
let categoryChart, trendChart, yearlyChart;

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

  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [data.month],
      datasets: [{
        label: 'Monthly Balance',
        data: [data.balance],
        borderColor: data.balance < 0 ? '#f44336' : '#4CAF50',
        backgroundColor: data.balance < 0 ? '#f44336aa' : '#4CAF50aa',
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

function renderYearlyChart(data) {
  const ctx = document.getElementById("yearlyChart").getContext("2d");
  if (yearlyChart) yearlyChart.destroy();

  yearlyChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ],
    datasets: [{
      label: `Balance Trend (${data.year})`,
      data: data.monthlyTotals,
      borderColor: "#1976D2",          // Richer blue
      backgroundColor: "rgba(25, 118, 210, 0.2)",
      pointBackgroundColor: "#1976D2", // Add colorful dots
      pointRadius: 4,
      borderWidth: 3,
      fill: true,
      tension: 0.3
    }]
  },
  options: {
    plugins: {
      legend: {
        labels: {
          color: "#333" // Visible on light mode
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: "#333"
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: value => `${value >= 0 ? '' : '-'}$${Math.abs(value)}`,
          color: "#333"
        }
      }
    }
  }
});
}
const darkMode = document.body.classList.contains("dark-mode");

yearlyChart.options.plugins.legend.labels.color = darkMode ? "#eee" : "#333";
yearlyChart.options.scales.x.ticks.color = darkMode ? "#eee" : "#333";
yearlyChart.options.scales.y.ticks.color = darkMode ? "#eee" : "#333";
yearlyChart.update();
