document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("transactionForm");
  const desc = document.getElementById("description");
  const amt = document.getElementById("amount");
  const date = document.getElementById("date");
  const list = document.getElementById("transactionsList");
  const monthlyBalance = document.getElementById("monthlyBalance");
  const categorySummary = document.getElementById("categorySummary");

  function fetchTransactions() {
    fetch('/transactions')
      .then(res => res.json())
      .then(data => {
        list.innerHTML = "";
        let balance = 0;
        let categories = {};

        data.forEach((tx, index) => {
          balance += Number(tx.amount);

          // Category grouping
          let cat = tx.description.toLowerCase();
          categories[cat] = (categories[cat] || 0) + Number(tx.amount);

          const div = document.createElement("div");
          div.className = "transaction";
          div.textContent = `${tx.date} - ${tx.description}: $${tx.amount}`;
          
          const delBtn = document.createElement("button");
          delBtn.textContent = "Delete";
          delBtn.onclick = () => deleteTransaction(index);

          div.appendChild(delBtn);
          list.appendChild(div);
        });

        monthlyBalance.textContent = `$${balance.toFixed(2)}`;

        // Render category summary
        categorySummary.innerHTML = "";
        for (let cat in categories) {
          const li = document.createElement("li");
          li.textContent = `${cat}: $${categories[cat].toFixed(2)}`;
          categorySummary.appendChild(li);
        }
      });
  }

  function deleteTransaction(index) {
    fetch(`/transactions/${index}`, { method: 'DELETE' })
      .then(() => fetchTransactions());
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const newTx = {
      description: desc.value,
      amount: parseFloat(amt.value),
      date: date.value
    };

    fetch('/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTx)
    }).then(() => {
      form.reset();
      fetchTransactions();
    });
  });

  fetchTransactions();
});
