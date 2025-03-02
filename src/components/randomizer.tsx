"use client";

import {useState, useEffect} from "react";
import {handleBuy, handleSell} from "@/components/tradingpanel";
import {global_vars} from "@/utils/global";

export default function Randomizer() {
    const [progress, setProgress] = useState(0);
    const [trade, setTrade] = useState("No trade yet!");

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(0);

            const buy_or_sell = Math.random() < 0.5 ? "BUY" : "SELL";
            const numShares = Math.floor(Math.random() * 10) + 1;

            setTrade(`${buy_or_sell} ${numShares} MKT`)

            if (numShares * global_vars.current_price > global_vars.balance) {
                console.log("rejected auto-trade: insufficient funds");
                return;
            }

            if (buy_or_sell === "BUY") {
                handleBuy(global_vars.viewing, numShares, global_vars.current_price)
            } else {
                handleSell(global_vars.viewing, numShares, global_vars.current_price)
            }
        }, 5000);

        const progressInterval = setInterval(() => {
            setProgress((prev) => (prev < 100 ? prev + 1 : 100));
        }, 50);

        return () => {
            clearInterval(interval);
            clearInterval(progressInterval);
        };
    }, []);

    return (
        <div>
            <h1>Auto-Trader</h1>
            <progress max={100} value={progress}/>
            <h3 className={"trade"} style={{
                color: trade.includes("BUY") ? "green" : "red",
                fontSize: "20pt"
            }}>{trade}</h3>
        </div>
    );
};