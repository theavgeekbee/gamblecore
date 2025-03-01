import express from 'express';
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3000;

app.use(express.json());

// item shop

type BaseItem = {
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
}

type Item = StockItem;

type DataStore = {
  inventory: Item[],
};

const dataFilePath = path.join(__dirname, 'db.json');

const loadData = (): any => {
  if (fs.existsSync(dataFilePath)) {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(data);
  }
  return [];
};

const saveData = (data: any): void => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

const db: DataStore = loadData();

app.get("/inventory", (req, res) => {
  res.json(db.inventory);
});

app.get("")

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
