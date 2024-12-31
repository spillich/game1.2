let cash = 1000;
let inventory = 0;
let storageCapacity = 100;
let storageUpgradeCost = 500;
let daysLeft = 30;
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

const products = [
  { name: "Cocaine", price: randomPrice(), quantity: 0, lastPurchasePrice: 0 },
  { name: "Colombian Cocaine", price: randomPrice(), quantity: 0, lastPurchasePrice: 0 },
  { name: "Designer Drugs", price: randomPrice(), quantity: 0, lastPurchasePrice: 0 }
];

const factories = {
  Cocaine: { count: 0, rate: 5, upgradeCost: 1000 },
  "Colombian Cocaine": { count: 0, rate: 2, upgradeCost: 2000 },
  "Designer Drugs": { count: 0, rate: 3, upgradeCost: 1500 }
};

function randomPrice() {
  return Math.floor(Math.random() * 500) + 100;
}

function buildFactory(productName) {
  const factory = factories[productName];
  if (cash >= factory.upgradeCost) {
    cash -= factory.upgradeCost;
    factory.count++;
    factory.upgradeCost += 500;
    logMessage(`"You got a new factory for ${productName}. Total: ${factory.count}"`);
  } else {
    logMessage(`"You don't have enough cash to build this factory, man."`);
  }
  updateUI();
}

function upgradeFactory(productName) {
  const factory = factories[productName];
  if (cash >= factory.upgradeCost) {
    cash -= factory.upgradeCost;
    factory.rate += 2;
    factory.upgradeCost += 1000;
    logMessage(`"Say hello to more production! ${productName} rate: ${factory.rate}/day."`);
  } else {
    logMessage(`"You can't afford this upgrade. Come back with more cash!"`);
  }
  updateUI();
}

function buyProduct(productName, quantity) {
  const product = products.find(p => p.name === productName);
  const totalCost = product.price * quantity;

  if (cash >= totalCost && inventory + quantity <= storageCapacity) {
    cash -= totalCost;
    product.quantity += quantity;
    inventory += quantity;
    product.lastPurchasePrice = product.price;
    logMessage(`"Bought ${quantity} units of ${productName} for $${totalCost}."`);
  } else {
    logMessage(`"You don't have enough cash or space, man."`);
  }
  updateUI();
}

function sellProduct(productName, quantity) {
  const product = products.find(p => p.name === productName);

  if (product.quantity >= quantity) {
    const revenue = product.price * quantity;
    cash += revenue;
    product.quantity -= quantity;
    inventory -= quantity;
    logMessage(`"Sold ${quantity} units of ${productName} for $${revenue}."`);
  } else {
    logMessage(`"You don't have enough ${productName} to sell, man."`);
  }
  updateUI();
}

function upgradeStorage() {
  if (cash >= storageUpgradeCost) {
    cash -= storageUpgradeCost;
    storageCapacity += 50;
    storageUpgradeCost += 100;
    logMessage(`"Warehouse upgraded to ${storageCapacity} units. The empire grows!"`);
  } else {
    logMessage(`"Not enough cash to upgrade the warehouse, boss."`);
  }
  updateUI();
}

function endDay() {
  if (daysLeft <= 0) {
    endGame();
    return;
  }

  products.forEach(product => (product.price = randomPrice()));

  Object.keys(factories).forEach(productName => {
    const factory = factories[productName];
    const production = factory.count * factory.rate;

    if (inventory + production <= storageCapacity) {
      inventory += production;
      const product = products.find(p => p.name === productName);
      product.quantity += production;
      logMessage(`"Factories produced ${production} units of ${productName}."`);
    }
  });

  daysLeft--;
  if (daysLeft === 0) {
    endGame();
  }
  updateUI();
}

function endGame() {
  const totalInventory = products.reduce((sum, product) => sum + product.quantity, 0);
  const totalFactories = Object.values(factories).reduce((sum, factory) => sum + factory.count, 0);

  leaderboard.push({ cash, totalInventory, totalFactories });
  leaderboard.sort((a, b) => b.cash - a.cash);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

  document.getElementById("game-container").style.display = "none";
  const summary = document.getElementById("summary");
  summary.innerHTML = `
    <p>Final Cash: $${cash}</p>
    <p>Total Inventory: ${totalInventory} units</p>
    <p>Factories Built: ${totalFactories}</p>
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
        <td>${entry.totalFactories}</td>
      </tr>
    `
    )
    .join("");

  document.getElementById("final-stats").style.display = "block";
}

function restartGame() {
  cash = 1000;
  inventory = 0;
  storageCapacity = 100;
  storageUpgradeCost = 500;
  daysLeft = 30;

  products.forEach(product => {
    product.quantity = 0;
    product.lastPurchasePrice = 0;
    product.price = randomPrice();
  });

  Object.keys(factories).forEach(productName => {
    factories[productName].count = 0;
    factories[productName].upgradeCost = 1000;
  });

  document.getElementById("final-stats").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  updateUI();
}

function logMessage(message) {
  const log = document.getElementById("log");
  log.innerHTML += `<p>${message}</p>`;
  log.scrollTop = log.scrollHeight;
}

function updateUI() {
  document.getElementById("cash").textContent = `$${cash}`;
  document.getElementById("inventory").textContent = `${inventory} / ${storageCapacity}`;
  document.getElementById("days-left").textContent = daysLeft;
  document.querySelector("button[onclick='upgradeStorage()']").textContent = `Upgrade Warehouse ($${storageUpgradeCost})`;
  renderTables();
}

function renderTables() {
  const productTable = document.querySelector("#drug-table tbody");
  const factoryTable = document.querySelector("#lab-table tbody");

  productTable.innerHTML = "";
  factoryTable.innerHTML = "";

  products.forEach(product => {
    const profitLoss = product.lastPurchasePrice
      ? ((product.price - product.lastPurchasePrice) / product.lastPurchasePrice) * 100
      : 0;

    const profitLossText = product.lastPurchasePrice
      ? `${profitLoss > 0 ? '+' : ''}${profitLoss.toFixed(2)}%`
      : 'N/A';

    const productRow = `
      <tr>
        <td>${product.name}</td>
        <td>$${product.price}</td>
        <td>${product.quantity} units</td>
        <td>$${product.lastPurchasePrice || 'N/A'}</td>
        <td>${profitLossText}</td>
        <td>
          <button onclick="buyProduct('${product.name}', 1)">Buy 1</button>
          <button onclick="buyProduct('${product.name}', 10)">Buy 10</button>
          <button onclick="sellProduct('${product.name}', 1)">Sell 1</button>
          <button onclick="sellProduct('${product.name}', 10)">Sell 10</button>
        </td>
      </tr>
    `;
    productTable.innerHTML += productRow;

    const factoryRow = `
      <tr>
        <td>${product.name}</td>
        <td>${factories[product.name].count}</td>
        <td>${factories[product.name].count * factories[product.name].rate} units/day</td>
        <td>
          <button onclick="buildFactory('${product.name}')">Build Factory ($${factories[product.name].upgradeCost})</button>
          <button onclick="upgradeFactory('${product.name}')">Upgrade Factory ($${factories[product.name].upgradeCost})</button>
        </td>
      </tr>
    `;
    factoryTable.innerHTML += factoryRow;
  });
}

updateUI();
