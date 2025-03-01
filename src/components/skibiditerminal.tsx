"use client";

import {useEffect, useRef} from "react";

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

export function SkibidiTerminal (
    props: {
        data: ChartDataPoint[],
        trades: Trade[]
    }
) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas!.getContext("2d")!;

        ctx.fillStyle = "black";

        let lowerPrice = 0, higherPrice = 0;
        for (const data of props.data) {
            lowerPrice = Math.min(lowerPrice, data.low);
            higherPrice = Math.max(higherPrice, data.high)
        }

        function convertPriceToY(price: number) {
            const range = higherPrice - lowerPrice;
            const priceDiff = price - lowerPrice;
            return (priceDiff / range) * canvas!.height;
        }

        const lp = Math.trunc(lowerPrice * 100) / 100;
        const hp = Math.trunc(higherPrice * 100) / 100;
        // write the low price at the bottom
        ctx.font = "15px Arial";
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
        const numCandles = Math.floor((canvas!.width - 65) / 20);

        for (let i = Math.max(props.data.length - numCandles, 0); i < props.data.length ; i++) {
            const data = props.data[i];
            console.log(data);
             const candleWidth = 10;

            const bodyTop = Math.max(data.open, data.close);
            const bodyBottom = Math.min(data.close, data.open);
            const topWick = data.high;
            const bottomWick = data.low;

            // set color
            ctx.fillStyle = data.close > data.open ? "green" : "red";

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

    }, []);

    return <canvas ref={canvasRef} width={700} height={500} />;
}