const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const list = document.getElementById("list");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Add Transaction
function addTransaction() {
    const text = document.getElementById("text").value.trim();
    const amount = +document.getElementById("amount").value;
    const category = document.getElementById("category").value;

    if (!text || !amount) return;

    const transaction = {
        id: Date.now(),
        text,
        amount,
        category
    };

    transactions.push(transaction);
    updateLocalStorage();
    init();

    document.getElementById("text").value = "";
    document.getElementById("amount").value = "";
}

// Remove Transaction
function removeTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    updateLocalStorage();
    init();
}

// Add to DOM
function addTransactionDOM(t) {
    const sign = t.amount < 0 ? "-" : "+";
    const li = document.createElement("li");

    li.classList.add(t.amount < 0 ? "minus" : "plus");

    li.innerHTML = `
        <div>
            <strong>${t.text}</strong><br>
            <span>${t.category}</span>
        </div>
        <div>
            ${sign}₹${Math.abs(t.amount)}
            <button onclick="removeTransaction(${t.id})">❌</button>
        </div>
    `;

    list.appendChild(li);
}

// Update values
function updateValues() {
    const amounts = transactions.map(t => t.amount);
    const total = amounts.reduce((a, b) => a + b, 0);
    const income = amounts.filter(a => a > 0).reduce((a, b) => a + b, 0);
    const expense = amounts.filter(a => a < 0).reduce((a, b) => a + b, 0);

    balanceEl.innerText = `₹${total}`;
    incomeEl.innerText = `₹${income}`;
    expenseEl.innerText = `₹${Math.abs(expense)}`;
}

// Storage
function updateLocalStorage() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Init
function init() {
    list.innerHTML = "";
    transactions.forEach(addTransactionDOM);
    updateValues();
}

init();
