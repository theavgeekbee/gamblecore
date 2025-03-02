import React, {useState, useEffect} from "react";
import {global_vars, waltuh} from "@/utils/global";
import Randomizer from "@/components/randomizer";

export const handleClose = (index: number) => {
    fetch(waltuh + "stocks/sell/" + global_vars.trades[index].id, {
        method: "POST",
        headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json"
        }
    }).then(_ => global_vars.trades[index].closed = true);
}

// opens a short position
export const handleSell = (stock: string, units: number) => {
    fetch(waltuh + "stocks/buy-short/" + stock + "?quantity=" + units, {
        method: "POST",
            headers: {
            "ngrok-skip-browser-warning": "true",
                "Content-Type": "application/json"
        }
    }).then(r => r.json()).then(data => {
        global_vars.trades.push(
            {
                id: data['id'],
                type: "Sell",
                stock,
                units,
                price: data['purchasePrice'],
                closed: false
            }
        )
    }).catch(e => {
        console.log("order rejected: insufficient funds", e)
    })
}

// open a long position
export const handleBuy = (stock: string, units: number) => {
    fetch(waltuh + "stocks/buy-stock/" + stock + "?quantity=" + units, {
        method: "POST",
        headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json"
        }
    }).then(r => r.json()).then(data => {
        global_vars.trades.push(
            {
                id: data['id'],
                type: "Buy",
                stock,
                units,
                price: data['purchasePrice'],
                closed: false
            }
        )
    }).catch(e => {
        console.log("order rejected: insufficient funds", e)
    })
};


const TradingPanel: React.FC = () => {
    const [selectedStock, setSelectedStock] = useState<string>("AAPL");
    const [price, setPrice] = useState<number>(100);
    const [units, setUnits] = useState<number>(0);
    const [refresh, setRefresh] = useState<boolean>(false);
    const [validTickers, setValidTickers] = useState<string[]>([]);
    const [balance, setBalance] = useState<number>(0);

    useEffect(() => {

        const interval = setInterval(() => {
            fetch(waltuh + "valid-tickers", {
                method: "GET",
                headers: {
                    "ngrok-skip-browser-warning": "true",
                    "Content-Type": "application/json"
                }
            })
                .then(r => r.json())
                .then(r => {
                    setValidTickers(r)
                });
            fetch(waltuh + "wallet", {
                method: "GET",
                headers: {
                    "ngrok-skip-browser-warning": "true",
                    "Content-Type": "application/json"
                }
            }).then(r => r.json()).then(data => {
                setBalance(data['wallet'])
            });
            setPrice(global_vars.current_price);
        }, 10);
        return () => clearInterval(interval);
    }, [selectedStock]);

    const changeStock = (stock: string) => {
        setSelectedStock(stock);
        global_vars.viewing = stock;
    }

    const executeBuy = () => {
        handleBuy(selectedStock, units);
        setRefresh(!refresh);
    }
    const executeSell = () => {
        handleSell(selectedStock, units);
        setRefresh(!refresh);
    }

    const executeClose = (index: number) => {
        handleClose(index);
        setRefresh(!refresh);
    }

    return (
        <div className="p-4 bg-gray-800 text-white rounded-lg">
            <h2 className="text-xl font-bold">Trade Stocks</h2>

            <label className="block">Select Stock:</label>
            <select value={selectedStock} onChange={(e) => changeStock(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 text-white mb-4">
                {
                    validTickers.map((value, index) => <option key={index} value={value}>{value}</option>)
                }

            </select>

            <p className="text-lg">Current Price: <span className="font-bold">${price.toFixed(2)}</span></p>

            <div className="mt-4">
                <label className="block">Units:</label>
                <input type="number" value={units} onChange={(e) => setUnits(parseInt(e.target.value))}
                       className="w-full p-2 rounded bg-gray-700 text-white"/>
            </div>

            <div className="flex gap-4 mt-4">
                <button onClick={executeBuy} className="p-2 bg-green-500 rounded text-white w-1/2">Buy</button>
                <button onClick={executeSell} className="p-2 bg-red-500 rounded text-white w-1/2">Sell</button>
            </div>

            <h3 className="text-lg font-semibold mt-4">Account Balance: <span
                className="font-bold">${balance.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}</span></h3>

            <Randomizer />

            <h3 className="text-lg font-semibold mt-4">Open Positions</h3>
            <ul className="mt-2">
                {
                    global_vars.trades.map((t, index) => {
                        if (t.closed) return <div key={index}></div>;
                        const price = global_vars.current_price;
                        const profitable = t.type === "Buy" ? price > t.price : price < t.price;
                        const profit = Math.abs((price - t.price) * t.units) * t.units;
                        return (
                            <div key={index}>
                                {t.type === "Buy" ? <span className={"green"}>Long</span> :
                                    <span className={"red"}>Short</span>} {t.units} share(s) of {t.stock} at
                                ${t.price.toFixed(2)} | <span
                                className={profitable ? "green" : "red"}>${profit.toFixed(2)}</span> {t.closed ? "(CLOSED)" : ""}
                                {
                                    t.closed ? <></> : <button onClick={(e) => {
                                        e.preventDefault();
                                        (e.target as HTMLButtonElement).disabled = true;
                                        executeClose(index)
                                    }}>Close</button>
                                }
                            </div>
                        )
                    })
                }
            </ul>
        </div>
    );
};

export default TradingPanel;