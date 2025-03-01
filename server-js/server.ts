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

(async () => {
  console.log(await getAIResponse("What color is the sky? Format your response as plain JSON NO markdown, like { \"color\": \"blue\" }"));
  process.exit();
})();

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
  name: string
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
