"use client";

import {SkibidiTerminal} from "@/components/skibiditerminal";
import Randomizer from "@/components/randomizer";

function generateRandomData() {
    const data = [];
    for (let i = 0; i < 50; i++) {
        const close = Math.abs(Math.random()) * 100;
        const open = Math.abs(Math.random()) * 100;

        const high = Math.max(close, open) + Math.abs(Math.random()) * 10;
        const low = Math.max(Math.min(close, open) - Math.abs(Math.random()) * 10, 0);
        data.push({
            high,
            low,
            close,
            open
        })
    }
    return data;
}

export default function Home() {
  return (
      <main>
          <SkibidiTerminal data={generateRandomData()} trades={[]} />
          <Randomizer />
      </main>
  )
}
