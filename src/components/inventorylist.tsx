"use client";

import React, {useState, useEffect} from "react";

interface InventoryItem {
    type: string;
    quantity: number;
    purchasedAt: string;
    expiresAt: string | null;
    purchasePrice?: number;
    ticker?: string;
}

const InventoryList: React.FC = () => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                console.log("Fetching inventory...");
                
                const response = await fetch("https://42d9-12-7-77-162.ngrok-free.app/inventory", {
                    method: "GET",
                    headers: {
                        "ngrok-skip-browser-warning": "true",
                        "Content-Type": "application/json"
                    }
                });
            
                console.log("Response status:", response.status);
                console.log("Response headers:", response.headers);
            
                if (!response.ok) {
                    throw new Error(`Failed to fetch inventory: ${response.status} ${response.statusText}`);
                }
            
                const text = await response.text();  // First, get the raw response to inspect
                console.log("Raw response:", text);
            
                // Attempt to parse JSON
                const data: InventoryItem[] = JSON.parse(text);
                setInventory(data);
            } catch (err) {
                console.error("Error fetching inventory:", err);
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }            
        };
        fetchInventory();
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