let cash = 1000;
let inventory = 0;
let storageCapacity = 100;
let storageUpgradeCost = 500;
let daysLeft = 30; // Set the total number of days
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || []; // Load leaderboard

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

// End day logic
function endDay() {
  if (daysLeft <= 0) {
    logMessage("Game over! No more days left.");
    endGame();
    return;
  }

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

  daysLeft--;
  if (daysLeft === 0) {
    endGame();
  } else {
    logMessage(`Day ended. ${daysLeft} days left.`);
  }
  updateUI();
}

// End game logic
function endGame() {
  // Calculate stats
  const totalInventory = drugs.reduce((sum, drug) => sum + drug.quantity, 0);
  const totalLabs = Object.values(labs).reduce((sum, lab) => sum + lab.count, 0);

  // Add to leaderboard
  leaderboard.push({
    cash,
    totalInventory,
    totalLabs
  });

  // Sort leaderboard by cash (descending)
  leaderboard.sort((a, b) => b.cash - a.cash);

  // Save leaderboard to localStorage
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

  // Show final stats
  document.getElementById("game-container").style.display = "none";
  const summary = document.getElementById("summary");
  summary.innerHTML = `
    <p>Final Cash: $${cash}</p>
    <p>Total Inventory: ${totalInventory} units</p>
    <p>Labs Built: ${totalLabs}</p>
  `;

  // Show leaderboard
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

// Restart game
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
    labs[drugName].upgradeCost = 1000; // Reset upgrade costs
  });

  document.getElementById("final-stats").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  updateUI();
}

// Log messages
function logMessage(message) {
  const log = document.getElementById("log");
  log.innerHTML += `<p>${message}</p>`;
  log.scrollTop = log.scrollHeight; // Scroll to the bottom
}

// Update UI
function updateUI() {
  document.getElementById("cash").textContent = `$${cash}`;
  document.getElementById("inventory").textContent = `${inventory} / ${storageCapacity}`;
  document.getElementById("days-left").textContent = daysLeft;
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

// Other functions (buyDrug, sellDrug, buildLab, upgradeLab, etc.) remain unchanged

// Initialize the game
updateUI();
