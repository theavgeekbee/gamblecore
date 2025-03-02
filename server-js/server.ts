import express from 'express';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

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
}

type StockItem = BaseItem & {
  type: ItemType.Stock,
  purchasePrice: number,
}

type ShortItem = BaseItem & {
  type: ItemType.Short,
  purchasePrice: number,
}

type TickerTicketItem = BaseItem & {
  type: ItemType.TickerTicket,
  ticker: string
}

type LootboxItem = BaseItem & {
  type: ItemType.Lootbox,
  class: string,
}

//type RerollerItem

type Item = StockItem | ShortItem | TickerTicketItem | LootboxItem;

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
  lootboxClasses: Record<string, LootboxClass>
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

function makeStockItem(): StockItem {
  const id = generateUniqueId();
  const name = "Stock";
  const type = ItemType.Stock;
  const description = "some shares of a company";
  const quantity = 1;
  const purchasePrice = Math.floor(Math.random() * 1000);
  const purchasedAt = new Date();
  const expiresAt = null;

  return {
    id,
    name,
    type,
    description,
    quantity,
    purchasePrice,
    purchasedAt,
    expiresAt,
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

// roll a lootbox and return the items
function rollLootbox(lootboxClass: string): Item[] {
  // first, what can be in a lootbox?

  return [];
}

console.log(makeNewLootboxClass());

setInterval(filterExpiredItems, 5000);

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
