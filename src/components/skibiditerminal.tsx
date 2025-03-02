"use client";

import {useEffect, useRef, useState} from "react";
import {global_vars} from "@/utils/global";

export enum TradeType {
    BUY, SELL
}

export interface ChartDataPoint {
    high: number;
    low: number;
    open: number;
    close: number;
}

export interface Trade {
    entry_price: number;
    type: TradeType,
    units: number;
}

function serializeHistoricalData(data: any[]): ChartDataPoint[] {
    return data.map((d: any) => {
        return {
            high: d['high'],
            low: d['low'],
            open: d['open'],
            close: d['close']
        }
    })
}

export function SkibidiTerminal(
    props: {
        trades: Trade[]
    }
) {
    const canvasRef = useRef<HTMLCanvasElement>(null);


    useEffect(() => {
        let data: ChartDataPoint[] = [];
        const fetchData = async () => {
            try {
                const response = await fetch("http://localhost:5000/stock?ticker=AAPL"); // Replace with actual API endpoint
                let normal_data = await response.json();
                let historical_data = normal_data['historical_data'];
                let offset_data = historical_data.slice(0, historical_data.length - global_vars.offset--);
                data = serializeHistoricalData(offset_data);
                global_vars.current_price = data[data.length - 1].close;
            } catch (error) {
                console.error("Error fetching candlestick data:", error);
            }
        };

        fetchData().then(e => e);


        const canvas = canvasRef.current;
        const ctx = canvas!.getContext("2d")!;
        ctx.fillStyle = "black";
        ctx.font="30px Arial";
        ctx.fillText("Please wait while your data loads!", 0, 50);

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
                console.log(data);
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

            initialX = 65;
            for (let i = 0; i < props.trades.length; i++) {
                const trade = props.trades[i];
                const location = convertPriceToY(trade.entry_price);
                ctx.fillStyle = trade.type === TradeType.BUY ? "blue" : "red";
                ctx.fillRect(60, location, 5000, 2)
                // write text above it
                ctx.font = "13px Arial";

                const currentPrice = data[data.length - 1].close;
                const isProfitable = trade.type === TradeType.BUY ? currentPrice > trade.entry_price
                    : currentPrice < trade.entry_price;
                const profit = trade.type === TradeType.BUY ? currentPrice - trade.entry_price
                    : trade.entry_price - currentPrice;

                const truncated = Math.trunc(profit * 100) / 100;
                ctx.fillStyle = isProfitable ? "green" : "red";
                ctx.fillText(
                    `${trade.units} | $${trade.entry_price} | ${isProfitable ? "" : "-"}$${Math.abs(truncated)}`,
                    65,
                    location - 8
                )
            }
        }

        setTimeout(() => {
            draw();
            setInterval(draw, 1000);
        }, 5000);
    }, []);

    return <canvas ref={canvasRef} width={700} height={500}/>;
}