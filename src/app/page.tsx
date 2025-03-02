"use client";

import {SigmaTerminal} from "@/components/sigmaTerminal";
import Image from "next/image";
import {Suspense} from "react";
import TradingPanel from "@/components/tradingpanel";
import InventoryList from "@/components/inventorylist";
import ItemShop from "@/components/itemshop";
import logo from "@/../public/logo.png";

export default function Home() {
    return (
        <main>
            <div className={"container"}>
                <div className={"title"}>

                    <h1><Image src={logo} alt={"Logo"} height={50} width={50} /> SigmaTerminal</h1>
                    <h2>Rizz First / Then Griddy</h2>
                </div>
                <div className={"row"}>
                    <Suspense fallback={<h1>Loading SigmaTerminal...</h1>}>
                        <SigmaTerminal/>
                    </Suspense>
                    <TradingPanel/>
                </div>
                <div className={"row"}>
                    <InventoryList/>
                    <ItemShop/>
                </div>
            </div>
        </main>
    )
}
