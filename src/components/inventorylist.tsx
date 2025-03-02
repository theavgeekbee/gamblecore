"use client";

import React, {useState, useEffect} from "react";
import {global_vars, waltuh} from "@/utils/global";

interface InventoryItem {
    type: string;
    quantity: number;
    purchasedAt: string;
    expiresAt: string | null;
    purchasePrice?: number;
    ticker?: string;
    id: string;
    description: string;
}

const InventoryList: React.FC = () => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                
                const response = await fetch(waltuh + "inventory", {
                    method: "GET",
                    headers: {
                        "ngrok-skip-browser-warning": "true",
                        "Content-Type": "application/json"
                    }
                });
            
                if (!response.ok) {
                    throw new Error(`Failed to fetch inventory: ${response.status} ${response.statusText}`);
                }
            
                const text = await response.text();  // First, get the raw response to inspect
            
                // Attempt to parse JSON
                const data: InventoryItem[] = JSON.parse(text);
                setInventory(data);

                for (const item of data) {
                    if (item.type === "stock" || item.type === "short") {
                        const itemId = item.id;

                        if (!global_vars.trades.some(x => x.id === itemId)) {
                            global_vars.trades.push(
                                {
                                    id: itemId,
                                    type: item.type === "stock" ? "Buy" : "Sell",
                                    stock: item.ticker!,
                                    units: item.quantity,
                                    price: item.purchasePrice!,
                                    closed: false
                                }
                            )
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching inventory:", err);
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }            
        };

        setInterval(fetchInventory, 1000);
    }, []);

    if(loading) return <p className="text-white">Loading inventory...</p>;
    if(error) return <p className="text-red-500">Error: {error}</p>;
    
    return (
        <div className="p-4 bg-gray-800 text-white rounded-lg">
            <h2 className="text-xl font-bold">Inventory</h2>
            {inventory.length === 0 ? (
                <p>No items in inventory</p>
            ) : (
                <ul className="mt-2">
                    {inventory.map((item, index) => (
                        <li key={index} className="border-b border-gray-600 py-2">
                            <p className="font-semibold capitalize">{item.type} - {item.quantity}x</p>
                            <p>{item.description}</p>
                            {item.purchasePrice && <p>Purchase Price: ${item.purchasePrice.toFixed(2)}</p>}
                            {item.ticker && <p>Ticker: {item.ticker}</p>}
                            <p>Purchased At: {new Date(item.purchasedAt).toLocaleString()}</p>
                            {item.expiresAt && <p>Expires At: {new Date(item.expiresAt).toLocaleString()}</p>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default InventoryList;