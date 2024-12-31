// Initialize variables
let cash = 1000;
let inventory = 0;
let storageCapacity = 100;
let storageUpgradeCost = 500;
let daysLeft = 30;

const drugs = [
  { name: "Weed", price: randomPrice(), quantity: 0, lastPurchasePrice: 0 },
  { name: "Cocaine", price: randomPrice(), quantity: 0, lastPurchasePrice: 0 },
  { name: "Meth", price: randomPrice(), quantity: 0, lastPurchasePrice: 0 }
];

const labs = {
  Weed: { count: 0, rate: 5, upgradeCost: 1000 },
  Cocaine: { count: 0, rate: 2, upgradeCost: 2000 },
  Meth: { count: 0, rate: 3, upgradeCost: 1500 }
};

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

// End Day
function endDay() {
  if (daysLeft <= 0) {
    logMessage("Game over! No more days left.");
    return;
  }

  // Update drug prices
  drugs.forEach(drug => {
    drug.price = randomPrice();
  });

  // Produce drugs in labs
  Object.keys(labs).forEach(drugName => {
    const lab = labs[drugName];
    const production = lab.count * lab.rate;

    if (inventory + production <= storageCapacity) {
      inventory += production;
      const drug = drugs.find(d => d.name === drugName);
      if (drug) drug.quantity += production;
      logMessage(`Produced ${production} units of ${drugName}.`);
    }
  });

  // Decrease days remaining
  daysLeft--;
  logMessage(`Day ended. ${daysLeft} days remaining.`);
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

// Render Tables
function renderTables() {
  const drugTable = document.querySelector("#drug-table tbody");
  const labTable = document.querySelector("#lab-table tbody");

  drugTable.innerHTML = "";
  labTable.innerHTML = "";

  drugs.forEach(drug => {
    const profitLoss = drug.lastPurchasePrice
      ? ((drug.price - drug.lastPurchasePrice) / drug.lastPurchasePrice) * 100
      : 0;

    const profitLossText = drug.lastPurchasePrice
      ? `${profitLoss > 0 ? '+' : ''}${profitLoss.toFixed(2)}%`
      : 'N/A';

    const drugRow = `
      <tr>
        <td>${drug.name}</td>
        <td>$${drug.price}</td>
        <td>${drug.quantity} units</td>
        <td>$${drug.lastPurchasePrice || 'N/A'}</td>
        <td>${profitLossText}</td>
        <td>
          <button onclick="buyDrug('${drug.name}', 1)">Buy 1</button>
          <button onclick="sellDrug('${drug.name}', 1)">Sell 1</button>
          <button onclick="sellAllDrug('${drug.name}')">Sell All</button>
        </td>
      </tr>
    `;
    drugTable.innerHTML += drugRow;

    const lab = labs[drug.name];
    if (lab) {
      const labRow = `
        <tr>
          <td>${drug.name}</td>
          <td>${lab.count}</td>
          <td>${lab.count * lab.rate} units/day</td>
          <td>
            <button onclick="buildLab('${drug.name}')">Build Lab ($${lab.upgradeCost})</button>
            <button onclick="upgradeLab('${drug.name}')">Upgrade Lab ($${lab.upgradeCost})</button>
          </td>
        </tr>
      `;
      labTable.innerHTML += labRow;
    }
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
  document.getElementById("days-left").textContent = daysLeft;
  document.querySelector("button[onclick='upgradeStorage()']").textContent = `Upgrade Storage ($${storageUpgradeCost})`;
  renderTables();
}

// Initialize Game
updateUI();
