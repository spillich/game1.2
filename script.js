let cash = 1000;
let inventory = 0;
let storageCapacity = 100;
let storageUpgradeCost = 500;
let daysLeft = 30; // Total number of days

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
    storageCapacity += 50;
    storageUpgradeCost += 100;
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

  drugs.forEach(drug => (drug.price = randomPrice()));

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
  const finalStats = {
    cash,
    inventory,
    storageCapacity,
    drugs: drugs.map(drug => ({
      name: drug.name,
      quantity: drug.quantity
    }))
  };

  saveToLeaderboard(finalStats);

  displayFinalStats(finalStats);
}

// Display final stats
function displayFinalStats(finalStats) {
  document.getElementById("game-container").style.display =
