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

const app = express();
const port = 3500;

app.use(express.json());

type BaseItem = {
  id: string,
  type: ItemType,
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

function makeNewLootboxClass(): LootboxClass {
  const name = Array.from({ length: 3 }, () => lootboxAdjectives[Math.floor(Math.random() * lootboxAdjectives.length)]).join(' ') + ' lootbox';

  return {
    name,
    rollInfo: {
      commonTickers: [],
      uncommonTickers: [],
      rareTickers: [],
    }
  };
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
