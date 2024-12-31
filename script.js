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
  Weed: { count: 0, rate: 5, upgradeCost: 1000, baseBuildCost: 1000 },
  Cocaine: { count: 0, rate: 2, upgradeCost: 2000, baseBuildCost: 2000 },
  Meth: { count: 0, rate: 3, upgradeCost: 1500, baseBuildCost: 1500 }
};

// Generate a random price for drugs
function randomPrice() {
  return Math.floor(Math.random() * 500) + 100;
}

// Upgrade Storage
function upgradeStorage() {
  if (cash >= storageUpgradeCost) {
    cash -= storageUpgradeCost;
    storageCapacity += 100;
    storageUpgradeCost += 500;
    logMessage(`Storage upgraded to ${storageCapacity} units.`);
  } else {
    logMessage("Not enough cash to upgrade storage.");
  }
  updateUI();
}

// Build Lab
function buildLab(drugName) {
  const lab = labs[drugName];
  if (!lab) return;

  if (cash >= lab.baseBuildCost && lab.count === 0) {
    cash -= lab.baseBuildCost;
    lab.count = 1;
    logMessage(`Built a lab for ${drugName}. Production starts at ${lab.rate} units/day.`);
  } else if (lab.count > 0) {
    logMessage(`Lab for ${drugName} already exists.`);
  } else {
    logMessage("Not enough cash to build the lab.");
  }
  updateUI();
}

// Upgrade Lab
function upgradeLab(drugName) {
  const lab = labs[drugName];
  if (!lab) return;

  if (cash >= lab.upgradeCost) {
    cash -= lab.upgradeCost;
    lab.upgradeCost += 1000;
    lab.rate += 5;
    logMessage(`Upgraded lab for ${drugName}. New production rate: ${lab.rate} units/day.`);
  } else {
    logMessage("Not enough cash to upgrade the lab.");
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
  } else if (quantity > spaceAvailable) {
    logMessage("Not enough storage space for this purchase.");
  } else {
    logMessage("Not enough cash to buy this quantity.");
  }
  updateUI();
}

// Buy Max Drug
function buyMaxDrug(drugName) {
  const drug = drugs.find(d => d.name === drugName);
  if (!drug) return;

  const maxAffordable = Math.floor(cash / drug.price);
  const maxStorable = storageCapacity - inventory;
  const maxQuantity = Math.min(maxAffordable, maxStorable);

  if (maxQuantity > 0) {
    const totalCost = maxQuantity * drug.price;
    cash -= totalCost;
    drug.quantity += maxQuantity;
    inventory += maxQuantity;
    drug.lastPurchasePrice = drug.price;
    logMessage(`Bought ${maxQuantity} units of ${drugName} for $${totalCost}.`);
  } else if (maxStorable <= 0) {
    logMessage("Not enough storage space for any purchase.");
  } else {
    logMessage("Not enough cash to buy any units.");
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

// End Day
function endDay() {
  daysLeft--;
  if (daysLeft <= 0) {
    logMessage("Game Over! Your final cash is: $" + cash);
    document.getElementById("end-day-button").disabled = true;
    return;
  }

  // Update drug prices
  drugs.forEach(drug => {
    drug.price = randomPrice();
  });

  // Add lab production
  Object.keys(labs).forEach(drugName => {
    const lab = labs[drugName];
    const drug = drugs.find(d => d.name === drugName);
    if (!lab || !drug) return;

    const production = lab.count * lab.rate;
    const spaceAvailable = storageCapacity - inventory;

    if (spaceAvailable >= production) {
      drug.quantity += production;
      inventory += production;
      logMessage(`Produced ${production} units of ${drugName} from labs.`);
    } else if (spaceAvailable > 0) {
      drug.quantity += spaceAvailable;
      inventory += spaceAvailable;
      logMessage(`Produced only ${spaceAvailable} units of ${drugName} due to storage limits.`);
    } else {
      logMessage(`No storage available to produce ${drugName}.`);
    }
  });

  logMessage("Day ended. Prices updated.");
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
          <button onclick="buyDrug('${drug.name}', 10)">Buy 10</button>
          <button onclick="buyMaxDrug('${drug.name}')">Buy Max</button>
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
            ${lab.count === 0
              ? `<button onclick="buildLab('${drug.name}')">Build Lab ($${lab.baseBuildCost})</button>`
              : `<button onclick="upgradeLab('${drug.name}')">Upgrade Lab ($${lab.upgradeCost})</button>`}
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
  renderTables();
}

// Initialize Game
updateUI();
