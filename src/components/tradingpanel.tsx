import React, {useState, useEffect} from "react";

interface Trade {
    type: string,
    stock: string,
    units: number,
    price: number
}

const TradingPanel: React.FC = () => {
    const [selectedStock, setSelectedStock] = useState<string>("AAPL");
    const [price, setPrice] = useState<number>(100);
    const [units, setUnits] = useState<number>(0);
    const [balance, setBalance] = useState<number>(10000);
    const [portfolio, setPortfolio] = useState<{[key: string]: number}>({});
    const [transactions, setTransactions] = useState<Trade[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setPrice((prevPrice) => parseFloat((prevPrice*(0.98+Math.random()*0.04)).toFixed(2)));
        }, 3000);
        return () => clearInterval(interval);
    }, [selectedStock]);

    const handleBuy = () => {
        const nUnits = portfolio[selectedStock] || 0;
        console.log(nUnits);
        if (nUnits  < 0) {
            // buy back shorted stocks and return the leverage, and then buy the rest
            const leverage = nUnits * price;
            setBalance(balance - leverage);
            // we still have to buy the rest
            const remaining = units + nUnits;
            setBalance(balance - leverage - remaining * price);
        } else {
            setBalance(balance - units * price);
        }
        setPortfolio({
            ...portfolio,
            [selectedStock]: (portfolio[selectedStock] || 0) + units
        })
        setTransactions([...transactions, {
            type: "Buy",
            stock: selectedStock,
            units,
            price,
        }])
    };
    const handleSell = () => {
        const nUnits = portfolio[selectedStock] || 0;
        if (units > nUnits) {
            // liquidate nUnits stocks and short units - nUnits stocks
            setBalance(balance + units * price);
            // short units - nUnits stocks
            const short = units - nUnits;
            const leverage = short * price;
            setBalance(balance + units * price - leverage);
        } else {
            // sell stock
            setBalance(balance + units * price);
        }
        setPortfolio({
            ...portfolio,
            [selectedStock]: (portfolio[selectedStock] || 0) - units
        })
        setTransactions([
            ...transactions, {
                type: "Sell",
                stock: selectedStock,
                units,
                price
            }
        ])
    };

    return(
        <div className="p-4 bg-gray-800 text-white rounded-lg">
            <h2 className="text-xl font-bold">Trade Stocks</h2>

            <label className="block">Select Stock:</label>
            <select value={selectedStock} onChange={(e) => setSelectedStock(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white mb-4">
                <option value="APPL">Apple (AAPL)</option>
                <option value="TSLA">Tesla (TSLA)</option>
                <option value="GOOG">Google (GOOG)</option>
                <option value="AMZN">Amazon (AMZN)</option>
            </select>

            <p className="text-lg">Current Price: <span className="font-bold">${price.toFixed(2)}</span></p>

            <div className="mt-4">
                <label className="block">Units:</label>
                <input type="number" value={units} onChange={(e) => setUnits(parseInt(e.target.value))} className="w-full p-2 rounded bg-gray-700 text-white"/>
            </div>

            <div className="flex gap-4 mt-4">
                <button onClick={handleBuy} className="p-2 bg-green-500 rounded text-white w-1/2">Buy</button>
                <button onClick={handleSell} className="p-2 bg-red-500 rounded text-white w-1/2">Sell</button>
            </div>

            <h3 className="text-lg font-semibold mt-4">Account Balance: <span className="font-bold">${balance.toFixed(2)}</span></h3>

            <h3 className="text-lg font-semibold mt-4">Your Holdings</h3>
            <ul>
                {Object.entries(portfolio).map(([stock, amount]) => (
                    <li key={stock}>{stock}: {amount} shares</li>
                ))}
            </ul>

            <h3 className="text-lg font-semibold mt-4">Transaction History</h3>
            <ul className="mt-2">
                {transactions.map((t, index) => (
                    <li key={index} className="text-sm">{t.type} {t.units} share(s) of {t.stock} at ${t.price.toFixed(2)}</li>
                ))}
            </ul>
        </div>
    );
};

export default TradingPanel;