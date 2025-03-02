import express from 'express';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import axios from 'axios';
import cors from 'cors';

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
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
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
  ticker: string
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

const lootboxAdjectives = [
  "shitty",
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
  "virgin",
  "sus",
  "lit",
  "dope",
  "lame",
  "epic",
  "trash",
  "fire",
  "busted",
  "pog",
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
  "cracked"
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

function makeTickerTicketItem(ticker: string): TickerTicketItem {
  const id = generateUniqueId();
  const quantity = 1;
  const purchasedAt = new Date();
  const expiresAt = null;

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
function rollLootbox(lootboxClass: string): Item[] {
  // first, what can be in a lootbox?
  // each lootbox contains 5 items

  const weightingTable = {
    "junk": 5,
    "random_stock": 1,
    "ticker_ticket": 1,
  }

  const items: Item[] = [];

  for (let i=0; i<5; i++) {
    const roll = rollWeightedValue(weightingTable);

    switch (roll) {
      case "junk":
        items.push(makeJunkItem());
        break;
      case "random_stock":
        const randomTicker = pickRandomItems(getLootboxClassByName(lootboxClass).rollInfo.commonTickers, 1)[0];
        // TODO: come back here
        //items.push(makeStockItem(randomTicker, ));
        break;
      case "ticker_ticket":
        items.push(makeTickerTicketItem(pickRandomItems(getLootboxClassByName(lootboxClass).rollInfo.commonTickers, 1)[0]));
        break;
    }
  }

  return [];
}

console.log(makeNewLootboxClass());

setInterval(filterExpiredItems, 5000);

app.use(cors());

app.get("/inventory", (req, res) => {
  res.json(db.inventory);
});

app.get("/valid-tickers", (req, res) => {
  res.json(
    db.inventory
      .filter((item) => item.type === ItemType.TickerTicket)
      .map((item) => (item as TickerTicketItem).ticker)
  );
});

app.get("/items/:id", (req, res) => {
  const item = getItemById(req.params.id);
  if (item) {
    res.json(item);
  }
  res.status(404).send("Item not found");
});

app.delete("/items/:id", (req, res) => {
  deleteItemById(req.params.id);
  saveDatabase();
  res.status(204).send();
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Server is running on http://127.0.0.1:${port}`);
});
