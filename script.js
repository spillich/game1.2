// Game Variables
let cash = 1000;
let inventory = 0;
let storageCapacity = 100;
let storageUpgradeCost = 500;
let daysLeft = 30;
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

// Drugs and Labs
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

// Random Price Generator
function randomPrice() {
  return Math.floor(Math.random() * 500) + 100;
}

// Build Lab
function buildLab(drugName) {
  const lab = labs[drugName];
  if (!lab) {
    console.error(`Lab not found for ${drugName}`);
    return;
  }

  if (cash >= lab.upgradeCost) {
    cash -= lab.upgradeCost;
    lab.count++;
    lab.upgradeCost += 500;
    logMessage(`Built a lab for ${drugName}. Total labs: ${lab.count}`);
  } else {
    logMessage("Not enough cash to build a lab.");
  }
  updateUI();
}

// Upgrade Lab
function upgradeLab(drugName) {
  const lab = labs[drugName];
  if (!lab) {
    console.error(`Lab not found for ${drugName}`);
    return;
  }

  if (cash >= lab.upgradeCost) {
    cash -= lab.upgradeCost;
    lab.rate += 2;
    lab.upgradeCost += 1000;
    logMessage(`Upgraded lab for ${drugName}. New production rate: ${lab.rate} units/day.`);
  } else {
    logMessage("Not enough cash to upgrade the lab.");
  }
  updateUI();
}

// Buy Drug
function buyDrug(drugName, quantity) {
  const drug = drugs.find(d => d.name === drugName);
  if (!drug) {
    console.error(`Drug not found: ${drugName}`);
    return;
  }

  const totalCost = drug.price * quantity;

  if (cash >= totalCost && inventory + quantity <= storageCapacity) {
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
  if (!drug) {
    console.error(`Drug not found: ${drugName}`);
    return;
  }

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
    endGame();
    return;
  }

  drugs.forEach(drug => (drug.price = randomPrice()));

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

  daysLeft--;
  if (daysLeft === 0) {
    endGame();
  }
  updateUI();
}

// End Game
function endGame() {
  const totalInventory = drugs.reduce((sum, drug) => sum + drug.quantity, 0);
  const totalLabs = Object.values(labs).reduce((sum, lab) => sum + lab.count, 0);

  leaderboard.push({ cash, totalInventory, totalLabs });
  leaderboard.sort((a, b) => b.cash - a.cash);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

  document.getElementById("game-container").style.display = "none";
  const summary = document.getElementById("summary");
  summary.innerHTML = `
    <p>Final Cash: $${cash}</p>
    <p>Total Inventory: ${totalInventory} units</p>
    <p>Labs Built: ${totalLabs}</p>
  `;

  const leaderboardTable = document.querySelector("#leaderboard tbody");
  leaderboardTable.innerHTML = leaderboard
    .slice(0, 10)
    .map(
      (entry, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>$${entry.cash}</td>
        <td>${entry.totalInventory} units</td>
        <td>${entry.totalLabs}</td>
      </tr>
    `
    )
    .join("");

  document.getElementById("final-stats").style.display = "block";
}

// Restart Game
function restartGame() {
  cash = 1000;
  inventory = 0;
  storageCapacity = 100;
  storageUpgradeCost = 500;
  daysLeft = 30;

  drugs.forEach(drug => {
    drug.quantity = 0;
    drug.lastPurchasePrice = 0;
    drug.price = randomPrice();
  });

  Object.keys(labs).forEach(drugName => {
    labs[drugName].count = 0;
    labs[drugName].upgradeCost = 1000;
  });

  document.getElementById("final-stats").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  updateUI();
}

// Log Messages
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

updateUI();
