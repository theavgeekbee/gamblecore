import express from 'express';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Function to get AI response
async function getAIResponse(prompt: string): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    });
    console.log("AI prompt:", prompt);
    console.log("AI response:", response.choices[0].message.content);
    return JSON.parse(response.choices[0].message.content!);
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw error;
  }
}

type StockPoolStructure = {
  good: string[],
  bad: string[],
  spicy: string[],
};

// import data from new_pool.json

const poolData = fs.readFileSync('new_pool.json', 'utf8');
const stockPool: StockPoolStructure = JSON.parse(poolData);

type SymbolsDataStructure = Record<string, {
  symbol: string,
  name: string,
  sector: string,
  industry: string,
}>;

// import data from symbols_data.json

const symbolsData = fs.readFileSync('symbols_data.json', 'utf8');
const symbols: SymbolsDataStructure = JSON.parse(symbolsData);

// pick n random unique strings from a list
function pickRandomUniqueStrings(list: string[], n: number): string[] {
  const result: string[] = [];
  const indices: number[] = [];
  while (result.length < n) {
    const index = Math.floor(Math.random() * list.length);
    if (!indices.includes(index)) {
      result.push(list[index]);
      indices.push(index);
    }
  }
  return result;
}

// pick n random items from a list
function pickRandomItems<T>(list: T[], n: number): T[] {
  const result: T[] = [];
  while (result.length < n) {
    const index = Math.floor(Math.random() * list.length);
    result.push(list[index]);
  }
  return result;
}

// a function to pick n random symbols from the symbols data
const symbolsList = Object.keys(symbols);

function pickRandomTickers(n: number): string[] {
  return pickRandomUniqueStrings(symbolsList, n);
}

// Function to get the current price of a ticker from the Python server
async function getNathansStockPrice(ticker: string): Promise<number> {
  try {
    const response = await axios.get(`http://127.0.0.1:5000/stock-info`, {
      params: { ticker }
    });
    const stockData = response.data;
    return stockData.current_price;
  } catch (error) {
    console.error('Error getting stock price from nathans fucking server:', error);
    throw error;
  }
}

getNathansStockPrice("AAPL")
  .then((price) => console.log("Price of AAPL:", price))
  .catch((error) => console.error("Error getting price of AAPL:", error));

const app = express();
const port = 3500;

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});

type BaseItem = {
  id: string,
  name: string,
  type: ItemType,
  description: string
  quantity: number,
  purchasedAt: Date,
  expiresAt: Date | null,
  purchasePrice?: number,
};

enum ItemType {
  Stock = "stock",
  Short = "short",
  TickerTicket = "tickerTicket",
  Lootbox = "lootbox",
  Reroller = "reroller",
  Junk = "junk",
}

type StockItem = BaseItem & {
  type: ItemType.Stock,
  purchasePrice: number,
  ticker: string,
}

type ShortItem = BaseItem & {
  type: ItemType.Short,
  purchasePrice: number,
  ticker: string,
}

type TickerTicketItem = BaseItem & {
  type: ItemType.TickerTicket,
  ticker: string
}

type LootboxItem = BaseItem & {
  type: ItemType.Lootbox,
  class: string,
}

type RerollerItem = BaseItem & {
  type: ItemType.Reroller,
}

type JunkItem = BaseItem & {
  type: ItemType.Junk,
};

type Item = StockItem
  | ShortItem
  | TickerTicketItem
  | LootboxItem
  | RerollerItem
  | JunkItem;

type LootboxClass = {
  name: string,
  rollInfo: {
    commonTickers: string[],
    uncommonTickers: string[],
    rareTickers: string[],
  }
}

type DataStore = {
  inventory: Item[],
  lootboxClasses: Record<string, LootboxClass>,
  wallet: number,
  currentShop: Shop | null,
};

const dataFilePath = path.join(__dirname, 'db.json');

const loadData = (): any => {
  if (fs.existsSync(dataFilePath)) {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(data);
  }
  return [];
};

const db: DataStore = loadData();

function saveDatabase() {
  fs.writeFileSync(dataFilePath, JSON.stringify(db, null, 2));
};

function generateUniqueId(): string {
  return Math.random().toString(36).substring(2);
}

function getItemById(id: string): Item | undefined {
  return db.inventory.find((item) => item.id === id);
}

function deleteItemById(id: string): void {
  db.inventory = db.inventory.filter((item) => item.id !== id);
  saveDatabase();
}

function filterExpiredItems(): void {
  db.inventory = db.inventory.filter((item) => {
    if (item.expiresAt && item.expiresAt < new Date()) {
      return false;
    }
    return true;
  });
  saveDatabase();
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const lootboxAdjectives = [
  "goated",
  "crappy",
  "amazing",
  "sigma",
  "based",
  "cringe",
  "ohio",
  "skibidi",
  "beta",
  "mogging",
  "chad",
  "sus",
  "lit",
  "poggers",
  "lame",
  "epic",
  "trash",
  "fire",
  "busted",
  "pog",
  "cracked",
  "noob",
  "pro",
  "sussy",
  "drip",
  "hype",
  "gamer",
  "meta",
  "clutch",
  "toxic",
  "tryhard",
  "sweaty",
  "bot",
  "nerfed",
  "buffed",
];

function makeStockItem(ticker: string, quantity: number, purchasePrice: number): StockItem {
  const id = generateUniqueId();
  const purchasedAt = new Date();
  const expiresAt = null;

  return {
    id,
    name: `${ticker} stocks`,
    type: ItemType.Stock,
    description: `shares of ${ticker}, purchased at $${purchasePrice.toFixed(2)}`,
    quantity,
    purchasedAt,
    expiresAt,
    purchasePrice,
    ticker,
  };
}

function makeShortItem(ticker: string, quantity: number, purchasePrice: number): ShortItem {
  const id = generateUniqueId();
  const purchasedAt = new Date();
  const expiresAt = null;

  return {
    id,
    name: `${ticker} shorts`,
    type: ItemType.Short,
    description: `shorts of ${ticker}, purchased at $${purchasePrice.toFixed(2)}`,
    quantity,
    purchasedAt,
    expiresAt,
    purchasePrice,
    ticker,
  };
}

function makeNewLootboxClass(): LootboxClass {
  const name = Array.from({ length: 3 }, () => lootboxAdjectives[Math.floor(Math.random() * lootboxAdjectives.length)]).join(' ') + ' lootbox';

  // pick common tickers from the symbols data
  const commonTickers = pickRandomTickers(20);
  // pick uncommon tickers from the spicy and bad pools
  const uncommonTickers = pickRandomItems(stockPool.spicy.concat(stockPool.bad), 10);
  // pick rare tickers from the good pool
  const rareTickers = pickRandomItems(stockPool.good, 5);

  return {
    name,
    rollInfo: {
      commonTickers,
      uncommonTickers,
      rareTickers,
    }
  };
}

function getLootboxClassByName(name: string): LootboxClass {
  return db.lootboxClasses[name]!;
}

function makeRerollerItem(): RerollerItem {
  const id = generateUniqueId();
  const quantity = 1;
  const purchasedAt = new Date();
  const expiresAt = null;

  return {
    id,
    name: "reroller",
    type: ItemType.Reroller,
    description: "allows you to re-roll a ticker ticket with a random stock",
    quantity,
    purchasedAt,
    expiresAt,
  };
}

function makeTickerTicketItem(ticker: string): TickerTicketItem {
  const id = generateUniqueId();
  const quantity = 1;
  const purchasedAt = new Date();
  const expiresAt = new Date(purchasedAt.getTime() + 15 * 60 * 1000); // 15 minutes from now

  return {
    id,
    name: "ticker ticket",
    type: ItemType.TickerTicket,
    description: `allows you to buy and sell ${ticker} stocks`,
    quantity,
    purchasedAt,
    expiresAt,
    ticker,
  };
}

function rollWeightedValue(weights: Record<string, number>): string {
  const totalWeight = Object.values(weights).reduce((acc, weight) => acc + weight, 0);
  const randomValue = Math.random() * totalWeight;
  let currentWeight = 0;
  for (const [key, weight] of Object.entries(weights)) {
    currentWeight += weight;
    if (randomValue <= currentWeight) {
      return key;
    }
  }
  return Object.keys(weights)[0];
}

// make a new lootbox item given a class
function makeLootboxFromClass(lootboxClass: string): LootboxItem {
  const id = generateUniqueId();
  const quantity = 1;
  const purchasedAt = new Date();
  const expiresAt = null;

  return {
    id,
    name: getLootboxClassByName(lootboxClass).name,
    type: ItemType.Lootbox,
    description: `a very cool lootbox full of surprises`,
    quantity,
    purchasedAt,
    expiresAt,
    class: lootboxClass,
  };
}

function makeJunkItem(): JunkItem {
  const id = generateUniqueId();
  const quantity = 1;
  const purchasedAt = new Date();
  const expiresAt = null;

  return {
    id,
    name: "junk",
    type: ItemType.Junk,
    description: "it's worthless... (unless?)",
    quantity,
    purchasedAt,
    expiresAt,
  };
}

// roll a lootbox and return the items
async function rollLootbox(lootboxClass: string): Promise<Item[]> {
  // first, what can be in a lootbox?
  // each lootbox contains 5 items, picked according to a weighting table

  const weightingTable = {
    "junk": 5,
    "random_stock": 1,
    "ticker_ticket": 2,
    "reroller": 1
  }

  const items: Item[] = [];

  for (let i=0; i<5; i++) {
    const roll = rollWeightedValue(weightingTable);

    switch (roll) {
      case "junk":{
        items.push(makeJunkItem());
        break;
      }
      case "random_stock":{
        const ticker = pickRandomTickers(1)[0];
        const price = await getNathansStockPrice(ticker);
        items.push(makeStockItem(ticker, 1, price));
        break;
      }
      case "ticker_ticket":{
        const tickerWeightingTable = {
          "common": 3,
          "uncommon": 2,
          "rare": 1
        }

        const tickerRoll = rollWeightedValue(tickerWeightingTable);
        let ticker: string = "";

        switch (tickerRoll) {
          case "common":
            ticker = pickRandomItems(getLootboxClassByName(lootboxClass).rollInfo.commonTickers, 1)[0];
            break;
          case "uncommon":
            ticker = pickRandomItems(getLootboxClassByName(lootboxClass).rollInfo.uncommonTickers, 1)[0];
            break;
          case "rare":
            ticker = pickRandomItems(getLootboxClassByName(lootboxClass).rollInfo.rareTickers, 1)[0];
            break;
        }

        const price = await getNathansStockPrice(ticker);
        items.push(makeTickerTicketItem(ticker));
        break;
      }
      case "reroller": {
        items.push(makeRerollerItem());
        break;
      }
    }
  }

  return items;
}

type Shop = {
  lootbox: {
    lootboxClass: string,
    price: number
  },
  tickerTicket: {
    ticker: string,
    price: number
  },
  fillerItems: Item[]
}

async function buildItemShop(): Promise<Shop> {
  // each time the item shop is rolled, it should contain the following items:
  // 100% of the time: a lootbox with a unique class (store it in lootboxClasses in the db)
  // 100% of the time: a random ticker ticket

  const lootboxClass = makeNewLootboxClass();
  // write to db
  db.lootboxClasses[lootboxClass.name] = lootboxClass;
  saveDatabase();
  const lootboxPrice = randInt(500, 1000);

  const ticker = pickRandomTickers(1)[0];
  const tickerTicketPrice = randInt(100, 500);

  const fillerWeights = {
    "randomStock": 1,
    "reroller": 1,
    "trash": 3
  };

  const fillerItems: Item[] = [];

  for (let i = 0; i < 4; i++) {
    const roll = rollWeightedValue(fillerWeights);

    switch (roll) {
      case "randomStock": {
        const ticker = pickRandomTickers(1)[0];
        const price = await getNathansStockPrice(ticker);
        const item = makeStockItem(ticker, 1, price);
        item.purchasePrice = randInt(50, 200);
        fillerItems.push(item);
        break;
      }
      case "reroller": {
        const item = makeRerollerItem();
        item.purchasePrice = randInt(10, 50);
        fillerItems.push(item);
        break;
      }
      case "trash": {
        const item = makeJunkItem();
        item.purchasePrice = randInt(1, 10);
        fillerItems.push(item);
        break;
      }
    }
  }

  return {
    lootbox: {
      lootboxClass: lootboxClass.name,
      price: lootboxPrice
    },
    tickerTicket: {
      ticker,
      price: tickerTicketPrice
    },
    fillerItems
  };
}

(async () => {
  if (db.currentShop === null) {
    db.currentShop = await buildItemShop();
    saveDatabase();
  }

  ensureTickerTicket("AAPL");
})();

setInterval(filterExpiredItems, 5000);

app.get("/inventory", (req, res) => {
  res.json(db.inventory);
});

function getValidTickers(): string[] {
  return db.inventory
    .filter((item) => item.type === ItemType.TickerTicket)
    .map((item) => (item as TickerTicketItem).ticker);
}

app.get("/valid-tickers", (req, res) => {
  const validTickers = Array.from(new Set([...getValidTickers()]));
  res.json(validTickers);
});

app.get("/shop", (req, res) => {
  res.json({
    lootboxItem: {...makeLootboxFromClass(db.currentShop!.lootbox.lootboxClass),
      price: db.currentShop!.lootbox.price},
    tickerTicketItem: {...makeTickerTicketItem(db.currentShop!.tickerTicket.ticker),
      price: db.currentShop!.tickerTicket.price},
    fillerItems: db.currentShop!.fillerItems
  })
});

app.post("/shop/buy-lootbox", async (req, res) => {
  const lootboxItem = makeLootboxFromClass(db.currentShop!.lootbox.lootboxClass);
  const price = db.currentShop!.lootbox.price;

  if (db.wallet < price) {
    res.status(400).send("you broke as fuck");
    return;
  }

  db.wallet -= price;

  const items = await rollLootbox(db.currentShop!.lootbox.lootboxClass);
  db.inventory.push(lootboxItem, ...items);
  saveDatabase();
  res.json({ lootboxItem, items });
});

app.post("/shop/buy-ticker-ticket", async (req, res) => {
  const tickerTicketItem = makeTickerTicketItem(db.currentShop!.tickerTicket.ticker);
  const price = db.currentShop!.tickerTicket.price;

  if (db.wallet < price) {
    res.status(400).send("you broke as fuck");
    return;
  }

  db.wallet -= price;
  db.inventory.push(tickerTicketItem);
  saveDatabase();
  res.json(tickerTicketItem);
});

app.post("/shop/buy-filler/:id", (req, res) => {
  const fillerItem = db.currentShop!.fillerItems.find(item => item.id === req.params.id);
  if (!fillerItem) {
    res.status(404).send("Item not found");
    return;
  }

  if (db.wallet < fillerItem.purchasePrice!) {
    res.status(400).send("you broke as fuck");
    return;
  }

  db.wallet -= fillerItem.purchasePrice!;
  db.inventory.push(fillerItem);
  db.currentShop!.fillerItems = db.currentShop!.fillerItems.filter(item => item.id !== req.params.id);
  saveDatabase();
  res.json(fillerItem);
});

app.get("/items/:id", (req, res) => {
  const item = getItemById(req.params.id);
  if (item) {
    res.json(item);
  } else {
    res.status(404).send("Item not found");
  }
});

app.delete("/items/:id", (req, res) => {
  deleteItemById(req.params.id);
  saveDatabase();
  res.status(204).send();
});

async function ensureTickerTicket(ticker: string): Promise<void> {
  if (!db.inventory.find((item) => item.type === ItemType.TickerTicket && item.ticker === ticker)) {
    const tickerTicketItem = makeTickerTicketItem(ticker);
    db.inventory.push(tickerTicketItem);
    saveDatabase();
  }
}

app.post("/stocks/buy-stock/:ticker", async (req, res) => {
  const ticker = req.params.ticker;
  let quantity: any = req.query.quantity;
  if (quantity === undefined) {
    res.status(400).send("Quantity is required");
    return;
  }
  quantity = parseInt(quantity as string);
  if (isNaN(quantity) || quantity <= 0) {
    res.status(400).send("Quantity must be a positive number");
    return;
  }

  const price = await getNathansStockPrice(ticker);
  const totalPrice = price * quantity;
  if (db.wallet < totalPrice) {
    res.status(400).send("you broke as fuck");
    return;
  }
  const stockItem = makeStockItem(ticker, quantity, price);

  db.wallet -= totalPrice;
  db.inventory.push(stockItem);
  saveDatabase();

  res.json(stockItem);
});

app.post("/stocks/buy-short/:ticker", async (req, res) => {
  const ticker = req.params.ticker;
  let quantity: any = req.query.quantity;
  if (quantity === undefined) {
    res.status(400).send("Quantity is required");
    return;
  }
  quantity = parseInt(quantity as string);
  if (isNaN(quantity) || quantity <= 0) {
    res.status(400).send("Quantity must be a positive number");
    return;
  }

  const price = await getNathansStockPrice(ticker);
  const totalPrice = price * quantity;
  if (db.wallet < totalPrice) {
    res.status(400).send("you broke as fuck");
    return;
  }

  const shortItem = makeShortItem(ticker, quantity, price);
  db.wallet -= totalPrice;
  db.inventory.push(shortItem);
  saveDatabase();

  res.json(shortItem);
});

app.post("/stocks/sell/:id", async (req, res) => {
  const item = getItemById(req.params.id);
  if (!item) {
    res.status(404).send("Item not found");
    return;
  }

  if (item.type !== ItemType.Stock && item.type !== ItemType.Short) {
    res.status(400).send("Item is not a stock or short");
    return;
  }

  const price = await getNathansStockPrice(item.ticker);
  let totalPrice = price * item.quantity;

  if (item.type === ItemType.Short) {
    const purchasePrice = item.purchasePrice;
    totalPrice = (purchasePrice - price) * item.quantity;
  }

  db.wallet += totalPrice;
  deleteItemById(req.params.id);
  saveDatabase();

  res.json({ ...item, totalPrice });
});

app.get("/wallet", (req, res) => {
  res.json({ wallet: db.wallet });
});

app.get("/net-worth", async (req, res) => {
  try {
    const netWorth = db.wallet + await db.inventory.reduce(async (accPromise, item) => {
      const acc = await accPromise;
      if (item.type === ItemType.Stock || item.type === ItemType.Short) {
        const currentPrice = await getNathansStockPrice(item.ticker);
        if (item.type === ItemType.Stock) {
          return acc + (item.quantity * currentPrice);
        } else if (item.type === ItemType.Short) {
          const purchasePrice = item.purchasePrice!;
          return acc + (item.quantity * (purchasePrice - currentPrice));
        }
      }
      return acc;
    }, Promise.resolve(0));
    res.json({ netWorth });
  } catch (error) {
    console.error('Error calculating net worth:', error);
    res.status(500).send('Error calculating net worth');
  }
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Server is running on http://127.0.0.1:${port}`);
});
