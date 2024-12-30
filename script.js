let cash = 1000;
let inventory = 0;
let storageCapacity = 100; // Initial storage capacity
let labs = 0;
let labLevel = 1;
let pricePerUnit = Math.floor(Math.random() * 500) + 500; // Initial price range
let fluctuationCounter = 0;

// Update UI
function updateUI() {
  document.getElementById('cash').textContent = `$${cash}`;
  document.getElementById('inventory').textContent = `${inventory} / ${storageCapacity}`;
}

// Price Fluctuations
function fluctuatePrice() {
  fluctuationCounter++;
  const trend = fluctuationCounter % 5 === 0 ? -1 : 1; // Random trends
  pricePerUnit += trend * Math.floor(Math.random() * 300);
  pricePerUnit = Math.max(1, Math.min(pricePerUnit, 2000)); // Clamp between $1 and $2000
}

// Buy Drug
function buyDrug(quantity) {
  const totalCost = pricePerUnit * quantity;
  if (cash >= totalCost && inventory + quantity <= storageCapacity) {
    cash -= totalCost;
    inventory += quantity;
    logMessage(`Bought ${quantity} units for $${totalCost}`);
  } else if (inventory + quantity > storageCapacity) {
    logMessage("Not enough storage capacity.");
  } else {
    logMessage("Not enough cash.");
  }
  updateUI();
}

// Sell Drug
function sellDrug() {
  if (inventory > 0) {
    const sellingPrice = Math.floor(Math.random() * 1200) + 500; // Higher fluctuation
    cash += sellingPrice * inventory;
    logMessage(`Sold ${inventory} units for $${sellingPrice * inventory}`);
    inventory = 0;
  } else {
    logMessage("No inventory to sell.");
  }
  updateUI();
}

// Upgrade Storage
function upgradeStorage() {
  const upgradeCost = Math.floor(storageCapacity / 10) * 500;
  if (cash >= upgradeCost) {
    cash -= upgradeCost;
    storageCapacity += 1000; // Upgrade adds 1000 units of capacity
    logMessage(`Storage upgraded to ${storageCapacity}`);
  } else {
    logMessage("Not enough cash to upgrade storage.");
  }
  updateUI();
}

// Build Lab
function buildLab() {
  const labCost = 5000 * (labs + 1); // Incremental cost for labs
  if (cash >= labCost) {
    cash -= labCost;
    labs++;
    logMessage(`Built a new lab. Total labs: ${labs}`);
  } else {
    logMessage("Not enough cash to build a lab.");
  }
  updateUI();
}

// Upgrade Lab
function upgradeLab() {
  const upgradeCost = 10000 * labLevel;
  if (cash >= upgradeCost) {
    cash -= upgradeCost;
    labLevel++;
    logMessage(`Lab upgraded to Level ${labLevel}`);
  } else {
    logMessage("Not enough cash to upgrade labs.");
  }
  updateUI();
}

// End Day
function endDay() {
  fluctuatePrice();
  const production = labs * labLevel * 10; // Production based on labs and levels
  if (inventory + production <= storageCapacity) {
    inventory += production;
    logMessage(`Labs produced ${production} units.`);
  } else {
    logMessage("Not enough storage for lab production.");
  }
  logMessage(`Price updated: $${pricePerUnit} per unit`);
  updateUI();
}

// Log messages
function logMessage(message) {
  const log = document.getElementById('log');
  log.innerHTML += `<p>${message}</p>`;
  log.scrollTop = log.scrollHeight; // Scroll to the bottom
}
