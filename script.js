// Initialize variables
let cash = 1000;
let inventory = 0;
let storageCapacity = 100;
let storageUpgradeCost = 500;

const drugs = [
  { name: "Weed", price: randomPrice(), quantity: 0, lastPurchasePrice: 0 },
  { name: "Cocaine", price: randomPrice(), quantity: 0, lastPurchasePrice: 0 },
  { name: "Meth", price: randomPrice(), quantity: 0, lastPurchasePrice: 0 }
];

// Generate a random price for drugs
function randomPrice() {
  return Math.floor(Math.random() * 500) + 100;
}

// Upgrade Storage
function upgradeStorage() {
  if (cash >= storageUpgradeCost) {
    cash -= storageUpgradeCost;
    storageCapacity += 50;
    storageUpgradeCost += 100;
    logMessage(`Storage upgraded to ${storageCapacity} units.`);
  } else {
    logMessage("Not enough cash to upgrade storage.");
  }
  updateUI();
}

// Buy Drug
function buyDrug(drugName, quantity) {
  const drug = drugs.find(d => d.name === drugName);
  if (!drug) return;

  const totalCost = drug.price * quantity;
  const spaceAvailable = storageCapacity - inventory;

  if (cash >= totalCost && quantity <= spaceAvailable) {
    cash -= totalCost;
    drug.quantity += quantity;
    inventory += quantity;
    drug.lastPurchasePrice = drug.price;
    logMessage(`Bought ${quantity} units of ${drugName} for $${totalCost}.`);
  } else {
    logMessage("Not enough cash or storage space.");
  }
  updateUI();
}

// Sell Drug
function sellDrug(drugName, quantity) {
  const drug = drugs.find(d => d.name === drugName);
  if (!drug) return;

  if (drug.quantity >= quantity) {
    const revenue = drug.price * quantity;
    cash += revenue;
    drug.quantity -= quantity;
    inventory -= quantity;
    logMessage(`Sold ${quantity} units of ${drugName} for $${revenue}.`);
  } else {
    logMessage(`Not enough ${drugName} to sell.`);
  }
  updateUI();
}

// Sell All Drugs
function sellAllDrug(drugName) {
  const drug = drugs.find(d => d.name === drugName);
  if (!drug) return;

  if (drug.quantity > 0) {
    const revenue = drug.price * drug.quantity;
    cash += revenue;
    inventory -= drug.quantity;
    logMessage(`Sold all ${drug.quantity} units of ${drugName} for $${revenue}.`);
    drug.quantity = 0;
  } else {
    logMessage(`No ${drugName} available to sell.`);
  }
  updateUI();
}

// Render Tables
function renderTables() {
  const drugTable = document.querySelector("#drug-table tbody");
  drugTable.innerHTML = "";

  drugs.forEach(drug => {
    const drugRow = `
      <tr>
        <td>${drug.name}</td>
        <td>$${drug.price}</td>
        <td>${drug.quantity} units</td>
        <td>
          <button onclick="buyDrug('${drug.name}', 1)">Buy 1</button>
          <button onclick="sellDrug('${drug.name}', 1)">Sell 1</button>
          <button onclick="sellAllDrug('${drug.name}')">Sell All</button>
        </td>
      </tr>
    `;
    drugTable.innerHTML += drugRow;
  });
}

// Log Message
function logMessage(message) {
  const log = document.getElementById("log");
  log.innerHTML += `<p>${message}</p>`;
  log.scrollTop = log.scrollHeight;
}

// Update UI
function updateUI() {
  document.getElementById("cash").textContent = `$${cash}`;
  document.getElementById("inventory").textContent = `${inventory} / ${storageCapacity}`;
  document.querySelector("button[onclick='upgradeStorage()']").textContent = `Upgrade Storage ($${storageUpgradeCost})`;
  renderTables();
}

// Initialize Game
updateUI();
