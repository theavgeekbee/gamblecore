"use client";

import {useState, useEffect} from "react";

export default function Randomizer() {
    const [progress, setProgress] = useState(0);
    const [trade, setTrade] = useState("No trade yet!");

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(0);

            const buy_or_sell = Math.random() < 0.5 ? "BUY" : "SELL";

            setTrade(`${buy_or_sell} MKT`)
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