"use client";

import {SkibidiTerminal} from "@/components/skibiditerminal";
import Randomizer from "@/components/randomizer";
import {Suspense} from "react";
import TradingPanel from "@/components/tradingpanel";

export default function Home() {
    return (
        <main>
            <div className={"container"}>
                <div className={"title"}>
                    <h1>SkibidiTerminal</h1>
                    <h2>Rizz First / Then Griddy</h2>
                </div>
                <div className={"row"}>
                    <Suspense fallback={<h1>Loading SkibidiTerminal...</h1>}>
                        <SkibidiTerminal/>
                    </Suspense>
                    <TradingPanel/>
                </div>
                <Randomizer/>
            </div>
        </main>
    )
}
