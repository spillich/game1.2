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

// Buy Max
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
    logMessage(`Bought ${maxQuantity} units of ${drugName} for $${totalCost}.`);
  } else {
    logMessage("Not enough cash or storage space to buy more.");
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

// Build Lab
function buildLab(drugName) {
  const lab = labs[drugName];
  if (!lab) return;

  if (cash >= lab.upgradeCost) {
    cash -= lab.upgradeCost;
    lab.count++;
    lab.upgradeCost += 500; // Increment future cost
    logMessage(`Built a lab for ${drugName}. Total labs: ${lab.count}`);
  } else {
    logMessage("Not enough cash to build a lab.");
  }
  updateUI();
}

// Upgrade Lab
function upgradeLab(drugName) {
  const lab = labs[drugName];
  if (!lab) return;

  if (cash >= lab.upgradeCost) {
    cash -= lab.upgradeCost;
    lab.rate += 2; // Increase production rate
    lab.upgradeCost += 1000; // Increment future cost
    logMessage(`Upgraded lab for ${drugName}. New rate: ${lab.rate} units/day.`);
  } else {
    logMessage("Not enough cash to upgrade the lab.");
  }
  updateUI();
}

// End Day
function endDay() {
  // Update drug prices
  drugs.forEach(drug => {
    drug.price = randomPrice();
  });

  // Produce from labs
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

  updateUI();
}

// Render Tables
function renderTables() {
  const drugTable = document.querySelector("#drug-table tbody");
  const labTable = document.querySelector("#lab-table tbody");

  drugTable.innerHTML = "";
  labTable.innerHTML = "";

  drugs.forEach(drug => {
    const drugRow = `
      <tr>
        <td>${drug.name}</td>
        <td>$${drug.price}</td>
        <td>${drug.quantity} units</td>
        <td>
          <button onclick="buyDrug('${drug.name}', 1)">Buy 1</button>
          <button onclick="buyDrug('${drug.name}', 10)">Buy 10</button>
          <button onclick="buyMaxDrug('${drug.name}')">Buy Max</button>
          <button onclick="sellDrug('${drug.name}', 1)">Sell 1</button>
          <button onclick="sellDrug('${drug.name}', 10)">Sell 10</button>
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
  document.querySelector("button[onclick='upgradeStorage()']").textContent = `Upgrade Storage ($${storageUpgradeCost})`;
  renderTables();
}

// Initialize Game
updateUI();
