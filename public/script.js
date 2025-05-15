document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const form = document.getElementById("transactionForm");
  const transactionList = document.getElementById("transactionsList");
  const categorySummary = document.getElementById("categorySummary");
  const monthlyBalance = document.getElementById("monthlyBalance");
  const yearSelect = document.getElementById("yearSelect");
  
  // Chart instances
  let categoryChart, trendChart, yearlyChart;
  
  // Initialize
  fetchTransactions();
  fetchCategorySummary();
  fetchMonthlyBalance();
  populateYearDropdown();
  
  // Theme Toggle
  document.getElementById("themeToggle").addEventListener("change", (e) => {
    document.body.classList.toggle("dark-mode", e.target.checked);
    updateChartColors();
  });

  // Form Submission
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
    }
  });

  // UI Refresh Function
  function refreshUI() {
    fetchTransactions();
    fetchCategorySummary();
    fetchMonthlyBalance();
    renderYearlyTrend(yearSelect.value);
  }

  // Fetch Transactions
  async function fetchTransactions() {
    try {
      const res = await fetch("/transactions");
      const data = await res.json();
      
      transactionList.innerHTML = data.map((tx, index) => `
        <div class="transaction ${tx.amount < 0 ? 'expense' : 'income'}">
          <span>${tx.date} - ${tx.description}</span>
          <span class="amount">$${Math.abs(tx.amount).toFixed(2)}</span>
          <button onclick="deleteTransaction(${index})">×</button>
        </div>
      `).join("");
    } catch {
      transactionList.innerHTML = "<div class='error'>Failed to load transactions</div>";
    }
  }

  // Delete Transaction
  window.deleteTransaction = async (index) => {
    await fetch(`/transactions/${index}`, { method: "DELETE" });
    refreshUI();
  };

  // Category Summary
  async function fetchCategorySummary() {
    try {
      const res = await fetch("/report/category");
      const data = await res.json();
      
      categorySummary.innerHTML = Object.entries(data)
        .map(([category, amount]) => `
          <li class="${amount < 0 ? 'expense' : 'income'}">
            ${category}: $${Math.abs(amount).toFixed(2)}
          </li>`
        ).join("");

      renderCategoryChart(data);
    } catch {
      categorySummary.innerHTML = "<li class='error'>Error loading summary</li>";
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
      
      monthlyBalance.innerHTML = `
        <span>Month: ${data.month}</span>
        <span>Transactions: ${data.totalTransactions}</span>
        <span class="${data.balance < 0 ? 'expense' : 'income'}">
          Balance: $${data.balance.toFixed(2)}
        </span>
      `;
      
      renderTrendChart(data);
    } catch {
      monthlyBalance.innerHTML = "<span class='error'>Error loading balance</span>";
    }
  }

  // Year Dropdown
  function populateYearDropdown() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 5; i--) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      yearSelect.appendChild(option);
    }
    yearSelect.value = currentYear;
    renderYearlyTrend(currentYear);
  }

  // Yearly Trend
  yearSelect.addEventListener("change", () => {
    renderYearlyTrend(yearSelect.value);
  });

  async function renderYearlyTrend(year) {
    try {
      const res = await fetch(`/balance/year/${year}`);
      const data = await res.json();
      renderYearlyChart(data);
    } catch {
      console.error("Failed to load yearly trend");
    }
  }

  // Chart Rendering Functions
  function renderCategoryChart(data) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    if (categoryChart) categoryChart.destroy();

    const backgroundColors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
      '#9966FF', '#FF9F40', '#8AC24A', '#FF5722'
    ];

    categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(data),
        datasets: [{
          data: Object.values(data),
          backgroundColor: backgroundColors,
          borderWidth: 1
        }]
      },
      options: {
        plugins: {
          legend: { position: 'right' },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${context.label}: $${Math.abs(value).toFixed(2)} (${percentage}%)`;
              }
            }
          }
        },
        cutout: '70%'
      }
    });
  }

  function renderTrendChart(data) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    if (trendChart) trendChart.destroy();

    trendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: 30 }, (_, i) => i + 1),
        datasets: [{
          label: 'Daily Balance Trend',
          data: generateDailyTrendData(data.balance),
          borderColor: data.balance < 0 ? '#F44336' : '#4CAF50',
          backgroundColor: 'transparent',
          tension: 0.4,
          pointRadius: 0
        }]
      },
      options: {
        scales: {
          x: { display: false },
          y: { 
            beginAtZero: false,
            ticks: {
              callback: (value) => `$${value}`
            }
          }
        },
        plugins: {
          legend: { display: false },
          annotation: {
            annotations: {
              line: {
                type: 'line',
                yMin: 0,
                yMax: 0,
                borderColor: '#666',
                borderWidth: 1
              }
            }
          }
        }
      }
    });
  }

  function generateDailyTrendData(monthlyBalance) {
    // Simulate daily fluctuations within the month
    return Array.from({ length: 30 }, (_, i) => {
      const progress = i / 29; // 0 to 1
      const fluctuation = Math.sin(progress * Math.PI * 4) * (monthlyBalance * 0.3);
      return monthlyBalance * progress + fluctuation;
    });
  }

  function renderYearlyChart(data) {
    const ctx = document.getElementById('yearlyChart').getContext('2d');
    if (yearlyChart) yearlyChart.destroy();

    // Calculate trend line
    const monthlyData = data.monthlyTotals;
    const trendLine = calculateTrendLine(monthlyData);

    yearlyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
          {
            label: 'Monthly Balance',
            data: monthlyData,
            backgroundColor: monthlyData.map(val => 
              val < 0 ? 'rgba(244, 67, 54, 0.7)' : 'rgba(76, 175, 80, 0.7)'
            ),
            borderColor: monthlyData.map(val => 
              val < 0 ? '#F44336' : '#4CAF50'
            ),
            borderWidth: 1
          },
          {
            label: 'Trend',
            data: trendLine,
            type: 'line',
            borderColor: '#FF9800',
            backgroundColor: 'transparent',
            borderWidth: 3,
            pointRadius: 0,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.raw;
                return `${label}: $${value.toFixed(2)}`;
              }
            }
          },
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: (value) => `$${value}`
            }
          }
        }
      }
    });
  }

  function calculateTrendLine(data) {
    // Simple linear regression for trend line
    const n = data.length;
    const xSum = data.reduce((sum, _, i) => sum + i, 0);
    const ySum = data.reduce((sum, val) => sum + val, 0);
    const xySum = data.reduce((sum, val, i) => sum + (i * val), 0);
    const xSqSum = data.reduce((sum, _, i) => sum + (i * i), 0);
    
    const slope = (n * xySum - xSum * ySum) / (n * xSqSum - xSum * xSum);
    const intercept = (ySum - slope * xSum) / n;
    
    return data.map((_, i) => intercept + slope * i);
  }

  function updateChartColors() {
    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#eee' : '#333';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    if (yearlyChart) {
      yearlyChart.options.scales.x.ticks.color = textColor;
      yearlyChart.options.scales.y.ticks.color = textColor;
      yearlyChart.options.scales.x.grid.color = gridColor;
      yearlyChart.options.scales.y.grid.color = gridColor;
      yearlyChart.update();
    }
  }
});