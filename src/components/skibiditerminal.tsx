"use client";

import {useEffect, useRef, useState} from "react";

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
                data = serializeHistoricalData((await response.json())['historical_data']);

            } catch (error) {
                console.error("Error fetching candlestick data:", error);
            }
        };

        fetchData().then(e => e);

        setTimeout(() => {
                const canvas = canvasRef.current;
                const ctx = canvas!.getContext("2d")!;


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
            }, 2000);
    }, []);

    return <canvas ref={canvasRef} width={700} height={500}/>;
}