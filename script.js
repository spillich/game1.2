let cash = 1000;
let inventory = 0;
let storageCapacity = 100;
let storageUpgradeCost = 500;

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

// Random price generator
function randomPrice() {
  return Math.floor(Math.random() * 500) + 100;
}

// Upgrade storage
function upgradeStorage() {
  if (cash >= storageUpgradeCost) {
    cash -= storageUpgradeCost;
    storageCapacity += 50; // Increase storage by 50 units
    storageUpgradeCost += 100; // Increment the cost for the next upgrade
    logMessage(`Storage upgraded! New capacity: ${storageCapacity} units.`);
  } else {
    logMessage("Not enough cash to upgrade storage.");
  }
  updateUI();
}

// Update UI
function updateUI() {
  document.getElementById("cash").textContent = `$${cash}`;
  document.getElementById("inventory").textContent = `${inventory} / ${storageCapacity}`;
  document.querySelector("button[onclick='upgradeStorage()']").textContent = `Upgrade Storage ($${storageUpgradeCost})`;
  renderTables();
}

// Render tables
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
          <button onclick="buyDrug('${drug.name}', 10)">Buy 10</button>
          <button onclick="sellDrug('${drug.name}', 1)">Sell 1</button>
          <button onclick="sellDrug('${drug.name}', 10)">Sell 10</button>
        </td>
      </tr>
    `;
    drugTable.innerHTML += drugRow;

    const labRow = `
      <tr>
        <td>${drug.name}</td>
        <td>${labs[drug.name].count}</td>
        <td>${labs[drug.name].count * labs[drug.name].rate} units/day</td>
        <td>
          <button onclick="buildLab('${drug.name}')">Build Lab ($${labs[drug.name].upgradeCost})</button>
          <button onclick="upgradeLab('${drug.name}')">Upgrade Lab ($${labs[drug.name].upgradeCost})</button>
        </td>
      </tr>
    `;
    labTable.innerHTML += labRow;
  });
}

// Other functions (buyDrug, sellDrug, buildLab, upgradeLab, endDay, etc.)
// remain unchanged from the previous version.

// Initialize the game
updateUI();
