"use client";

import {ChartDataPoint, SkibidiTerminal} from "@/components/skibiditerminal";
import Randomizer from "@/components/randomizer";
import { Suspense } from "react";

export default function Home() {
    return (
        <main>
            <Suspense fallback={<h1>Loading SkibidiTerminal...</h1>}>
                <SkibidiTerminal trades={[]}/>
            </Suspense>
            <Randomizer/>
        </main>
    )
}
