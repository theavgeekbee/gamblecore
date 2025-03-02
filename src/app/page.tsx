"use client";

import {SigmaTerminal} from "@/components/sigmaTerminal";
import Randomizer from "@/components/randomizer";
import {Suspense} from "react";
import TradingPanel from "@/components/tradingpanel";
import InventoryList from "@/components/inventorylist";

export default function Home() {
    return (
        <main>
            <div className={"container"}>
                <div className={"title"}>
                    <h1>SigmaTerminal</h1>
                    <h2>Rizz First / Then Griddy</h2>
                </div>
                <div className={"row"}>
                    <Suspense fallback={<h1>Loading SkibidiTerminal...</h1>}>
                        <SigmaTerminal/>
                    </Suspense>
                    <TradingPanel/>
                </div>
                <div className={"row"}>
                    <Randomizer/>
                    <InventoryList />
                </div>
            </div>
        </main>
    )
}
