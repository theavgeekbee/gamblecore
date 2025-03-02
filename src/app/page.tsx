"use client";

import { SkibidiTerminal } from "@/components/skibiditerminal";
import Randomizer from "@/components/randomizer";
import { Suspense, useState, useEffect } from "react";
import TradingPanel from "@/components/tradingpanel";

const taglines = [
  "Rizz First / Then Griddy",
  "Buy High / Sell Higher",
  "To The Moon / Or The Basement",
  "Skibidi Gains / Ohio Losses",
  "Trust The Process / Ignore The Charts",
  "Lambo Soon / Ramen Now",
];

export default function Home() {
  const [curTagline, tagline] = useState(() =>
    Math.floor(Math.random() * taglines.length)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      tagline((prevIndex) => (prevIndex + 1) % taglines.length);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main>
      <div className={"container"}>
        <div className={"title"}>
          <h1>
            SkibidiTerminal{" "}
            <span style={{ fontSize: "0.5em" }}>
              <i>{taglines[curTagline]}</i>
            </span>
          </h1>
        </div>
        <div className={"row"}>
          <Suspense fallback={<h1>Getting ready to Skibidi...</h1>}>
            <SkibidiTerminal />
          </Suspense>
          <TradingPanel />
        </div>
        <Randomizer />
      </div>
    </main>
  );
}
