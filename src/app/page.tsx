"use client";

import {ChartDataPoint, SkibidiTerminal, TradeType} from "@/components/skibiditerminal";
import Randomizer from "@/components/randomizer";
import {Suspense} from "react";

export default function Home() {
    return (
        <main>
            <Suspense fallback={<h1>Loading SkibidiTerminal...</h1>}>
                <SkibidiTerminal trades={[{
                    entry_price: 240,
                    type: TradeType.BUY,
                    units: 32
                }, {
                    entry_price: 240.3,
                    type: TradeType.SELL,
                    units: 64
                }]}/>
            </Suspense>
            <Randomizer/>
        </main>
    )
}
