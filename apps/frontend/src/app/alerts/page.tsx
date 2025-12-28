"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Alert {
    id: string;
    symbol: string;
    targetPrice: number;
    condition: string;
    isActive: boolean;
    triggered: boolean;
    triggeredAt?: string;
    createdAt: string;
}

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [newAlert, setNewAlert] = useState({
        symbol: "BTC",
        targetPrice: "",
        condition: "above"
    });
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");

    const coins = ["BTC", "ETH", "SOL", "BNB", "ADA", "XRP", "DOT", "AVAX"];

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:3001/alerts", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAlerts(data);
            }
        } catch (err) {
            console.error("Failed to fetch alerts");
        } finally {
            setLoading(false);
        }
    };

    const createAlert = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setError("Please login first");
            return;
        }

        try {
            const response = await fetch("http://localhost:3001/alerts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    symbol: newAlert.symbol,
                    targetPrice: parseFloat(newAlert.targetPrice),
                    condition: newAlert.condition
                })
            });

            if (response.ok) {
                fetchAlerts();
                setNewAlert({ symbol: "BTC", targetPrice: "", condition: "above" });
                setShowForm(false);
                setError("");
            } else {
                setError("Failed to create alert");
            }
        } catch (err) {
            setError("Network error");
        }
    };

    const toggleAlert = async (id: string) => {
        const token = localStorage.getItem("accessToken");
        await fetch(`http://localhost:3001/alerts/${id}/toggle`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchAlerts();
    };

    const deleteAlert = async (id: string) => {
        const token = localStorage.getItem("accessToken");
        await fetch(`http://localhost:3001/alerts/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchAlerts();
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
            {/* Header */}
            <header className="border-b border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-xl font-bold">M</span>
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            MarketHub
                        </h1>
                    </Link>
                    <nav className="flex items-center gap-6">
                        <Link href="/" className="text-gray-400 hover:text-white">Dashboard</Link>
                        <Link href="/alerts" className="text-white">Alerts</Link>
                        <Link href="/booking" className="text-gray-400 hover:text-white">Booking</Link>
                    </nav>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold">Price Alerts</h2>
                        <p className="text-gray-400 mt-1">Get notified when prices hit your targets</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg flex items-center gap-2"
                    >
                        <span className="text-xl">+</span>
                        New Alert
                    </button>
                </div>

                {/* Create Alert Form */}
                {showForm && (
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-8">
                        <h3 className="text-xl font-semibold mb-4">Create Price Alert</h3>
                        {error && (
                            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-400">
                                {error}
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Coin</label>
                                <select
                                    value={newAlert.symbol}
                                    onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                                >
                                    {coins.map(coin => (
                                        <option key={coin} value={coin}>{coin}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Condition</label>
                                <select
                                    value={newAlert.condition}
                                    onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                                >
                                    <option value="above">Price goes above</option>
                                    <option value="below">Price goes below</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Target Price ($)</label>
                                <input
                                    type="number"
                                    placeholder="50000"
                                    value={newAlert.targetPrice}
                                    onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                                />
                            </div>
                        </div>
                        <button
                            onClick={createAlert}
                            className="mt-4 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-medium"
                        >
                            Create Alert
                        </button>
                    </div>
                )}

                {/* Alerts List */}
                <div className="bg-gray-800/50 rounded-xl border border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-700">
                        <h3 className="text-xl font-semibold">Your Alerts</h3>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Loading...</div>
                    ) : alerts.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <div className="text-4xl mb-4">🔔</div>
                            <p>No alerts yet. Create your first price alert!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-700">
                            {alerts.map((alert) => (
                                <div key={alert.id} className="p-6 hover:bg-gray-700/30 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-lg font-bold">
                                                {alert.symbol[0]}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-lg">{alert.symbol}</span>
                                                    <span className={`text-xs px-2 py-1 rounded ${alert.triggered
                                                            ? "bg-green-900/50 text-green-400"
                                                            : alert.isActive
                                                                ? "bg-blue-900/50 text-blue-400"
                                                                : "bg-gray-700 text-gray-400"
                                                        }`}>
                                                        {alert.triggered ? "Triggered!" : alert.isActive ? "Active" : "Paused"}
                                                    </span>
                                                </div>
                                                <p className="text-gray-400">
                                                    Alert when price goes <span className="text-white">{alert.condition}</span>{" "}
                                                    <span className="text-green-400 font-mono">${alert.targetPrice.toLocaleString()}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!alert.triggered && (
                                                <button
                                                    onClick={() => toggleAlert(alert.id)}
                                                    className={`px-3 py-1 rounded text-sm ${alert.isActive
                                                            ? "bg-yellow-600 hover:bg-yellow-700"
                                                            : "bg-green-600 hover:bg-green-700"
                                                        }`}
                                                >
                                                    {alert.isActive ? "Pause" : "Activate"}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteAlert(alert.id)}
                                                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
