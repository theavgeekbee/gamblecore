import React, { useState, useEffect } from "react";
import { global_vars } from "@/utils/global";

export const handleClose = (index: number, price: number) => {
  global_vars.trades[index].closed = true;
  7;
  global_vars.balance += price * global_vars.trades[index].units;
  56;
};

// opens a short position
export const handleSell = (stock: string, units: number, price: number) => {
  const leverage = units * price;
  if (leverage > global_vars.balance) {
    alert("Order rejected: failed to provide leverage");
    return;
  }
  global_vars.balance -= leverage;
  global_vars.trades = [
    ...global_vars.trades,
    {
      type: "Sell",
      stock,
      units,
      price,
      closed: false,
    },
  ];
};

// open a long position
export const handleBuy = (stock: string, units: number, price: number) => {
  const cost = units * price;
  if (cost > global_vars.balance) {
    alert("Order rejected: insufficient funds");
    return;
  }
  global_vars.balance -= cost;
  global_vars.trades = [
    ...global_vars.trades,
    {
      type: "Buy",
      stock,
      units,
      price,
      closed: false,
    },
  ];
};

const TradingPanel: React.FC = () => {
  const [selectedStock, setSelectedStock] = useState<string>("AAPL");
  const [price, setPrice] = useState<number>(100);
  const [units, setUnits] = useState<number>(0);
  const [refresh, setRefresh] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrice(global_vars.current_price);
    }, 10);
    return () => clearInterval(interval);
  }, [selectedStock]);

  const changeStock = (stock: string) => {
    setSelectedStock(stock);
    global_vars.viewing = stock;
  };

  const executeBuy = () => {
    handleBuy(selectedStock, units, price);
    setRefresh(!refresh);
  };
  const executeSell = () => {
    handleSell(selectedStock, units, price);
    setRefresh(!refresh);
  };

  const executeClose = (index: number) => {
    handleClose(index, price);
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg">
      <h2 className="text-xl font-bold">Trade Stocks</h2>

      <label className="block">Select Stock:</label>
      <select
        value={selectedStock}
        onChange={(e) => changeStock(e.target.value)}
        className="w-full p-2 rounded bg-gray-700 text-white mb-4"
      >
        <option value="APPL">Apple (AAPL)</option>
        <option value="TSLA">Tesla (TSLA)</option>
        <option value="GOOG">Google (GOOG)</option>
        <option value="AMZN">Amazon (AMZN)</option>
      </select>

      <p className="text-lg">
        Current Price: <span className="font-bold">${price.toFixed(2)}</span>
      </p>

      <div className="mt-4">
        <label className="block">Units:</label>
        <input
          type="number"
          value={units}
          onChange={(e) => setUnits(parseInt(e.target.value))}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
      </div>

      <div className="flex gap-4 mt-4">
        <button
          onClick={executeBuy}
          className="p-2 bg-green-500 rounded text-white w-1/2"
        >
          Buy
        </button>
        <button
          onClick={executeSell}
          className="p-2 bg-red-500 rounded text-white w-1/2"
        >
          Sell
        </button>
      </div>

      <h3 className="text-lg font-semibold mt-4">
        Account Balance:{" "}
        <span className="font-bold">
          $
          {global_vars.balance.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </h3>

      <h3 className="text-lg font-semibold mt-4">Open Positions</h3>
      <ul className="mt-2">
        {global_vars.trades.map((t, index) => {
          if (t.closed) return <div key={index}></div>;
          const price = global_vars.current_price;
          const profitable =
            t.type === "Buy" ? price > t.price : price < t.price;
          const profit = Math.abs((price - t.price) * t.units) * t.units;
          return (
            <div key={index}>
              {t.type === "Buy" ? (
                <span className={"green"}>Long</span>
              ) : (
                <span className={"red"}>Short</span>
              )}{" "}
              {t.units} share(s) of {t.stock} at ${t.price.toFixed(2)} |{" "}
              <span className={profitable ? "green" : "red"}>
                ${profit.toFixed(2)}
              </span>{" "}
              {t.closed ? "(CLOSED)" : ""}
              {t.closed ? (
                <></>
              ) : (
                <button onClick={(_) => executeClose(index)}>Close</button>
              )}
            </div>
          );
        })}
      </ul>
    </div>
  );
};

export default TradingPanel;
