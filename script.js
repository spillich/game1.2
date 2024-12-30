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

// Other functions (upgradeStorage, buyDrug, sellDrug, etc.) remain unchanged

// Initialize the game
updateUI();
