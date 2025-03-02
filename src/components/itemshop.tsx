import {waltuh} from "@/utils/global";
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

interface FillerItem {
    id: string;
    name: string;
    type: string;
    description: string;
    quantity: number;
    purchasedAt: string;
    expiresAt: string | null;
    purchasePrice: number;
}

export default function ItemShop() {
    const [lootBox, setLootBox] = useState<LootBox>();
    const [tickerTicket, setTickerTicket] = useState<TickerTicket>();
    const [fillerItems, setFillerItems] = useState<FillerItem[]>([]);

    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const f = () => (fetch(waltuh + "shop", {
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
                setFillerItems(data['fillerItems']);
                setLoading(false);
            })
            .catch(e => console.error(e)));

        setInterval(f, 10000);
    }, []);

    function buyLootBox() {
        fetch(waltuh + "shop/buy-lootbox", {
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
        fetch(waltuh + "shop/buy-ticker-ticket", {
            method: "POST",
            headers: {
                "ngrok-skip-browser-warning": "true",
                "Content-Type": "application/json"
            }
        })
            .then(r => r)
            .catch(e => console.error(e));
    }

    function buyFiller(id: string) {
        fetch(waltuh + "shop/buy-filler/" + id, {
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
        return <div className={"shop"}>
            <h1>Item Shop</h1>
            <button className={"shopButton"} onClick={(e) => {
                e.preventDefault();
                buyLootBox();
            }}>
                <div>
                    <h3>{lootBox?.name} - ${lootBox?.price}</h3>
                    <p>{lootBox?.description}</p>
                </div>
            </button>
            <button className={"shopButton"} onClick={(e) => {
                e.preventDefault();
                buyTickerTicket();
            }}>
                <div>
                    <h3>{tickerTicket?.name} - ${tickerTicket?.price}</h3>
                    <p>{tickerTicket?.description}</p>
                </div>
            </button>
            {fillerItems.map((item, index) => <button className={"shopButton"} key={index} onClick={(e) => {
                e.preventDefault();
                buyFiller(item.id);
            }}>
                <div>
                    <h3>{item.name} - ${item.purchasePrice}</h3>
                    <p>{item.description}</p>
                </div>
            </button>)}
        </div>
    }
}
