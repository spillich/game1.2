let cash = 1000;
let inventory = 0;
let storageCapacity = 100;

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

// Update UI
function updateUI() {
  document.getElementById("cash").textContent = `$${cash}`;
  document.getElementById("inventory").textContent = `${inventory} / ${storageCapacity}`;
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

// Buy drug
function buyDrug(drugName, quantity) {
  const drug = drugs.find(d => d.name === drugName);
  const cost = drug.price * quantity;

  if (cash >= cost && inventory + quantity <= storageCapacity) {
    cash -= cost;
    drug.quantity += quantity;
    inventory += quantity;
    drug.lastPurchasePrice = drug.price;
    logMessage(`Bought ${quantity} units of ${drugName} for $${cost}.`);
  } else {
    logMessage("Not enough cash or storage.");
  }
  updateUI();
}

// Sell drug
function sellDrug(drugName, quantity) {
  const drug = drugs.find(d => d.name === drugName);

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

// Build lab
function buildLab(drugName) {
  const lab = labs[drugName];

  if (cash >= lab.upgradeCost) {
    cash -= lab.upgradeCost;
    lab.count++;
    lab.upgradeCost += 500; // Increase cost for next build
    logMessage(`Built a lab for ${drugName}.`);
  } else {
    logMessage("Not enough cash to build a lab.");
  }
  updateUI();
}

// Upgrade lab
function upgradeLab(drugName) {
  const lab = labs[drugName];

  if (cash >= lab.upgradeCost) {
    cash -= lab.upgradeCost;
    lab.rate += 2; // Increase production rate
    lab.upgradeCost += 1000; // Increase cost for next upgrade
    logMessage(`Upgraded lab for ${drugName}.`);
  } else {
    logMessage("Not enough cash to upgrade the lab.");
  }
  updateUI();
}

// End day
function endDay() {
  drugs.forEach(drug => (drug.price = randomPrice())); // Update prices

  Object.keys(labs).forEach(drugName => {
    const lab = labs[drugName];
    const production = lab.count * lab.rate;

    if (inventory + production <= storageCapacity) {
      inventory += production;
      const drug = drugs.find(d => d.name === drugName);
      drug.quantity += production;
      logMessage(`Produced ${production} units of ${drugName}.`);
    }
  });

  updateUI();
}

// Log messages
function logMessage(message) {
  const log = document.getElementById("log");
  log.innerHTML += `<p>${message}</p>`;
  log.scrollTop = log.scrollHeight; // Scroll to the bottom
}

// Initialize
updateUI();
