"use client";

import {useEffect, useRef} from "react";
import {global_vars, waltuh2} from "@/utils/global";

export interface ChartDataPoint {
    high: number;
    low: number;
    open: number;
    close: number;
}

function serializeHistoricalData(data: {high: number, low: number, open: number, close: number}[]): ChartDataPoint[] {
    return data.map((d) => {
        return {
            high: d['high'],
            low: d['low'],
            open: d['open'],
            close: d['close']
        }
    })
}

export function SigmaTerminal() {
    const canvasRef = useRef<HTMLCanvasElement>(null);


    useEffect(() => {
        let data: ChartDataPoint[] = [];
        const fetchData = async () => {
            try {
                const response = await fetch(waltuh2 + "stock?ticker=" + global_vars.viewing); // Replace with actual API endpoint
                const normal_data = await response.json();
                const historical_data = normal_data['historical_data'];
                data = serializeHistoricalData(historical_data);
                global_vars.current_price = data[data.length - 1].close;
                console.log("Candlestick data fetched");
            } catch (error) {
                console.error("Error fetching candlestick data:", error);
            }
        };

        fetchData().then(e => e);


        const canvas = canvasRef.current;
        const ctx = canvas!.getContext("2d")!;
        function draw() {
            fetchData().then(e => e);
            ctx.clearRect(0, 0, canvas!.width, canvas!.height);
            const numCandles = Math.floor((canvas!.width - 65) / 20);

            ctx.fillStyle = "black";

            let lowerPrice = Infinity, higherPrice = -Infinity;
            for (let i = Math.max(data.length - numCandles, 0); i < data.length; i++) {
                lowerPrice = Math.min(lowerPrice, data[i].low);
                higherPrice = Math.max(higherPrice, data[i].high)
            }

            function convertPriceToY(price: number) {
                return canvas!.height * (1 - (price - lowerPrice) / (higherPrice - lowerPrice))
            }

            const lp = Math.trunc(lowerPrice * 100) / 100;
            const hp = Math.trunc(higherPrice * 100) / 100;
            // write the low price at the bottom
            ctx.font = "13px Arial";
            ctx.fillText("$" + lp, 0, canvas!.height);
            ctx.fillText("$" + hp, 0, 20);
            // draw a vertical line
            ctx.beginPath();
            ctx.moveTo(60, 0);
            ctx.lineTo(60, canvas!.height);
            ctx.stroke();

            // draw a horizontal line
            ctx.lineTo(canvas!.width, canvas!.height);
            ctx.stroke();

            let initialX = 65;

            for (let i = Math.max(data.length - numCandles, 0); i < data.length; i++) {
                const din = data[i];
                const candleWidth = 10;

                const bodyTop = Math.max(din.open, din.close);
                const bodyBottom = Math.min(din.close, din.open);
                const topWick = din.high;
                const bottomWick = din.low;

                // set color
                ctx.fillStyle = din.close > din.open ? "green" : "red";

                // candle body
                ctx.fillRect(
                    initialX,
                    convertPriceToY(bodyTop),
                    candleWidth,
                    convertPriceToY(bodyBottom) - convertPriceToY(bodyTop)
                )

                // wicks
                ctx.fillRect(initialX + 4, convertPriceToY(topWick), 2, convertPriceToY(bodyTop) - convertPriceToY(topWick));
                ctx.fillRect(initialX + 4, convertPriceToY(bodyBottom), 2, convertPriceToY(bottomWick) - convertPriceToY(bodyBottom));

                initialX += 20;
            }
            // draw a line at the current close
            ctx.fillStyle = "purple";
            ctx.fillRect(60, convertPriceToY(data[data.length - 1].close), 5000, 2);
            for (let i = 0; i < global_vars.trades.length; i++) {
                const trade = global_vars.trades[i];
                if (trade.closed) continue;
                const location = convertPriceToY(trade.price);
                ctx.fillStyle = trade.type === "Buy" ? "blue" : "red";
                ctx.fillRect(60, location, 5000, 2)
                // write text above it
                ctx.font = "13px Arial";

                const currentPrice = data[data.length - 1].close;
                const isProfitable = trade.type === "Buy" ? currentPrice > trade.price
                    : currentPrice < trade.price;
                const profit = trade.type === "Buy" ? currentPrice - trade.price
                    : trade.price - currentPrice;

                const totalProfit = Math.abs(profit * trade.units);
                ctx.fillStyle = isProfitable ? "green" : "red";
                ctx.fillText(
                    `${trade.units} | $${trade.price.toFixed(2)} | ${isProfitable ? "" : "-"}$${totalProfit.toFixed(2)}`,
                    65,
                    location - 8
                )
            }
        }

        setTimeout(() => {
            draw();
            setInterval(draw, 2000);
        }, 5000);
    }, []);

    return <canvas ref={canvasRef} width={700} height={500}/>;
}