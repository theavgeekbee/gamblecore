"use client";

import {useEffect, useRef} from "react";

export enum TradeType {
    BUY, SELL
}

export interface ChartDataPoint {
    label: string;
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

        // draw a vertical line
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, canvas!.height);
        ctx.stroke();

        // draw a horizontal line
        ctx.lineTo(canvas!.width, canvas!.height);
        ctx.stroke();

        // we can display max of 20 candlesticks
        const reversed = props.data.reverse();
        for (let i = 0; i < Math.max(20, reversed.length); i++) {

        }

    }, []);

    return <canvas ref={canvasRef} width={700} height={500} />;
}