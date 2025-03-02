import {useEffect, useState} from "react";

interface LootBox {
    id: string;
    name: string;
    type: string;
    description: string;
    quantity: number;
    purchasedAt: string;
    expiresAt: string;
    class: string;
    price: number;
}
interface TickerTicket {
    id: string;
    name: string;
    type: string;
    description: string;
    quantity: number;
    purchasedAt: string;
    expiresAt: string;
    ticker: string;
    price: number;
}

export default function ItemShop() {
    const [lootBox, setLootBox] = useState<LootBox>();
    const [tickerTicket, setTickerTicket] = useState<TickerTicket>();

    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetch("https://42d9-12-7-77-162.ngrok-free.app/shop", {
            method: "GET",
            headers: {
                "ngrok-skip-browser-warning": "true",
                "Content-Type": "application/json"
            }
        })
            .then(r => r.json())
            .then((data) => {
                setLootBox(data['lootboxItem']);
                setTickerTicket(data['tickerTicketItem']);
                setLoading(false);
            })
            .catch(e => console.error(e));
    }, []);

    function buyLootBox() {
        fetch("https://42d9-12-7-77-162.ngrok-free.app/shop/buy-lootbox", {
            method: "POST",
            headers: {
                "ngrok-skip-browser-warning": "true",
                "Content-Type": "application/json"
            }
        })
            .then(r => r)
            .catch(e => console.error(e));
    }
    function buyTickerTicket() {
        fetch("https://42d9-12-7-77-162.ngrok-free.app/shop/buy-ticker-ticket", {
            method: "POST",
            headers: {
                "ngrok-skip-browser-warning": "true",
                "Content-Type": "application/json"
            }
        })
            .then(r => r)
            .catch(e => console.error(e));
    }

    if (loading) {
        return <div>Loading...</div>;
    } else {
        return <div>
            <h1>Item Shop</h1>
            <button onClick={(e) => {
                e.preventDefault();
                (e.target as HTMLButtonElement).disabled = true;
                buyLootBox();
            }}>
                <div>
                    <h3>{lootBox?.name} - ${lootBox?.price}</h3>
                    <p>{lootBox?.description}</p>
                </div>
            </button>
            <button onClick={(e) => {
                e.preventDefault();
                (e.target as HTMLButtonElement).disabled = true;
                buyTickerTicket();
            }}>
                <div>
                    <h3>{tickerTicket?.name} - ${tickerTicket?.price}</h3>
                    <p>{tickerTicket?.description}</p>
                </div>
            </button>
        </div>
    }
}