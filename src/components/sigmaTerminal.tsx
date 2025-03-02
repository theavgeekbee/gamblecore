"use client";

import { useEffect, useRef, useState } from "react";
import { global_vars } from "@/utils/global";

export interface ChartDataPoint {
  high: number;
  low: number;
  open: number;
  close: number;
}

function serializeHistoricalData(data: any[]): ChartDataPoint[] {
  return data.map((d: any) => {
    return {
      high: d["high"],
      low: d["low"],
      open: d["open"],
      close: d["close"],
    };
  });
}

export function SigmaTerminal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let data: ChartDataPoint[] = [];
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/stock?ticker=" + global_vars.viewing
        ); // Replace with actual API endpoint
        let normal_data = await response.json();
        console.log(normal_data);
        let historical_data = normal_data["historical_data"];
        let offset_data = historical_data.slice(
          0,
          historical_data.length - global_vars.offset--
        );
        data = serializeHistoricalData(offset_data);
        console.log(data);
        global_vars.current_price = data[data.length - 1].close;
      } catch (error) {
        console.error("Error fetching candlestick data:", error);
      }
    };

    fetchData().then((e) => e);

    const canvas = canvasRef.current;
    const ctx = canvas!.getContext("2d")!;
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Please wait while your data loads!", 0, 50);

    function draw() {
      fetchData().then((e) => e);
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      const numCandles = Math.floor((canvas!.width - 65) / 20);

      ctx.fillStyle = "white";

      let lowerPrice = Infinity,
        higherPrice = -Infinity;
      for (
        let i = Math.max(data.length - numCandles, 0);
        i < data.length;
        i++
      ) {
        lowerPrice = Math.min(lowerPrice, data[i].low);
        higherPrice = Math.max(higherPrice, data[i].high);
      }

      function convertPriceToY(price: number) {
        return (
          canvas!.height *
          (1 - (price - lowerPrice) / (higherPrice - lowerPrice))
        );
      }

      const lp = Math.trunc(lowerPrice * 100) / 100;
      const hp = Math.trunc(higherPrice * 100) / 100;
      // write the low price at the bottom
      ctx.fillStyle = "white";
      ctx.font = "13px Arial";
      ctx.fillText("$" + lp, 0, canvas!.height);
      ctx.fillText("$" + hp, 0, 20);
      // draw a vertical line
      ctx.strokeStyle = "white";
      ctx.beginPath();
      ctx.moveTo(60, 0);
      ctx.lineTo(60, canvas!.height);
      ctx.stroke();

      // draw a horizontal line
      ctx.lineTo(canvas!.width, canvas!.height);
      ctx.stroke();

      let initialX = 65;

      for (
        let i = Math.max(data.length - numCandles, 0);
        i < data.length;
        i++
      ) {
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
        );

        // wicks
        ctx.fillRect(
          initialX + 4,
          convertPriceToY(topWick),
          2,
          convertPriceToY(bodyTop) - convertPriceToY(topWick)
        );
        ctx.fillRect(
          initialX + 4,
          convertPriceToY(bodyBottom),
          2,
          convertPriceToY(bottomWick) - convertPriceToY(bodyBottom)
        );

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
        ctx.fillRect(60, location, 5000, 2);
        // write text above it
        ctx.font = "13px Arial";

        const currentPrice = data[data.length - 1].close;
        const isProfitable =
          trade.type === "Buy"
            ? currentPrice > trade.price
            : currentPrice < trade.price;
        const profit =
          trade.type === "Buy"
            ? currentPrice - trade.price
            : trade.price - currentPrice;

        const totalProfit = Math.abs(profit * trade.units);
        ctx.fillStyle = isProfitable ? "green" : "red";
        ctx.fillText(
          `${trade.units} | $${trade.price.toFixed(2)} | ${
            isProfitable ? "" : "-"
          }$${totalProfit.toFixed(2)}`,
          65,
          location - 8
        );
      }
    }

    setTimeout(() => {
      draw();
      setInterval(draw, 2000);
    }, 2000);
  }, []);

  return <canvas ref={canvasRef} width={700} height={500} />;
}
