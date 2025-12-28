"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Prediction {
    symbol: string;
    current_price: number;
    timestamp: string;
    indicators: {
        sma_20: number;
        sma_50: number;
        rsi: number;
        trend: string;
        volatility: number;
    };
    predictions: Array<{
        timeframe: string;
        predicted_price: number;
        change_percent: number;
        confidence: number;
    }>;
    recommendation: {
        action: string;
        strength: string;
        reason: string;
    };
}

export default function PredictionsPage() {
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCoin, setSelectedCoin] = useState<Prediction | null>(null);
    const [error, setError] = useState("");

    const coins = ["BTC", "ETH", "SOL", "BNB", "ADA", "XRP", "DOT", "AVAX"];

    useEffect(() => {
        fetchPredictions();
    }, []);

    const fetchPredictions = async () => {
        try {
            const response = await fetch("http://localhost:3005/api/predictions/");
            if (response.ok) {
                const data = await response.json();
                setPredictions(data.predictions || []);
                if (data.predictions?.length > 0) {
                    setSelectedCoin(data.predictions[0]);
                }
            } else {
                setError("Failed to fetch predictions. Is the prediction service running?");
            }
        } catch (err) {
            setError("Cannot connect to prediction service (port 3005)");
        } finally {
            setLoading(false);
        }
    };

    const fetchSinglePrediction = async (symbol: string) => {
        try {
            const response = await fetch(`http://localhost:3005/api/predictions/${symbol}`);
            if (response.ok) {
                const data = await response.json();
                setSelectedCoin(data);
            }
        } catch (err) {
            console.error("Failed to fetch prediction");
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case "BUY": return "text-green-400 bg-green-900/50 border-green-700";
            case "SELL": return "text-red-400 bg-red-900/50 border-red-700";
            default: return "text-yellow-400 bg-yellow-900/50 border-yellow-700";
        }
    };

    const getTrendColor = (trend: string) => {
        switch (trend) {
            case "bullish": return "text-green-400";
            case "bearish": return "text-red-400";
            default: return "text-yellow-400";
        }
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
                        <Link href="/alerts" className="text-gray-400 hover:text-white">Alerts</Link>
                        <Link href="/predictions" className="text-white">AI Predictions</Link>
                    </nav>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                        <span className="text-4xl">🤖</span>
                        AI Price Predictions
                    </h2>
                    <p className="text-gray-400 mt-1">Machine Learning powered cryptocurrency forecasts</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-900/30 border border-red-700 rounded-xl text-red-400">
                        {error}
                        <p className="text-sm mt-2">Start the service: cd prediction-service && pip install -r requirements.txt && python -m uvicorn app.main:app --port 3005</p>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">Loading AI predictions...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Coin Selector */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-800/50 rounded-xl border border-gray-700">
                                <div className="px-4 py-3 border-b border-gray-700">
                                    <h3 className="font-semibold">Select Coin</h3>
                                </div>
                                <div className="p-2">
                                    {coins.map((coin) => {
                                        const pred = predictions.find(p => p.symbol === coin);
                                        return (
                                            <button
                                                key={coin}
                                                onClick={() => pred && setSelectedCoin(pred)}
                                                className={`w-full p-3 rounded-lg flex items-center justify-between mb-1 transition-colors ${selectedCoin?.symbol === coin
                                                        ? "bg-blue-600/30 border border-blue-500"
                                                        : "hover:bg-gray-700/50"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center font-bold">
                                                        {coin[0]}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-medium">{coin}</p>
                                                        <p className="text-sm text-gray-400">
                                                            ${pred?.current_price?.toLocaleString() || "N/A"}
                                                        </p>
                                                    </div>
                                                </div>
                                                {pred?.recommendation && (
                                                    <span className={`px-2 py-1 text-xs rounded ${getActionColor(pred.recommendation.action)}`}>
                                                        {pred.recommendation.action}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Prediction Details */}
                        <div className="lg:col-span-2">
                            {selectedCoin ? (
                                <div className="space-y-6">
                                    {/* Recommendation Card */}
                                    <div className={`p-6 rounded-xl border ${getActionColor(selectedCoin.recommendation.action)}`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm opacity-80">AI Recommendation</p>
                                                <p className="text-3xl font-bold">{selectedCoin.recommendation.action}</p>
                                                <p className="text-sm mt-1">{selectedCoin.recommendation.reason}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm opacity-80">Strength</p>
                                                <p className="text-xl font-semibold capitalize">{selectedCoin.recommendation.strength}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price Predictions */}
                                    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
                                        <h3 className="text-xl font-semibold mb-4">Price Predictions</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {selectedCoin.predictions.map((pred) => (
                                                <div key={pred.timeframe} className="bg-gray-700/30 rounded-lg p-4">
                                                    <p className="text-gray-400 text-sm">{pred.timeframe}</p>
                                                    <p className="text-xl font-bold mt-1">${pred.predicted_price.toLocaleString()}</p>
                                                    <p className={`text-sm ${pred.change_percent >= 0 ? "text-green-400" : "text-red-400"}`}>
                                                        {pred.change_percent >= 0 ? "+" : ""}{pred.change_percent}%
                                                    </p>
                                                    <div className="mt-2">
                                                        <div className="flex justify-between text-xs text-gray-400">
                                                            <span>Confidence</span>
                                                            <span>{pred.confidence}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-600 rounded-full h-1.5 mt-1">
                                                            <div
                                                                className="bg-blue-500 h-1.5 rounded-full"
                                                                style={{ width: `${pred.confidence}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Technical Indicators */}
                                    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
                                        <h3 className="text-xl font-semibold mb-4">Technical Indicators</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <div className="bg-gray-700/30 rounded-lg p-4">
                                                <p className="text-gray-400 text-sm">Trend</p>
                                                <p className={`text-xl font-bold capitalize ${getTrendColor(selectedCoin.indicators.trend)}`}>
                                                    {selectedCoin.indicators.trend}
                                                </p>
                                            </div>
                                            <div className="bg-gray-700/30 rounded-lg p-4">
                                                <p className="text-gray-400 text-sm">RSI (14)</p>
                                                <p className={`text-xl font-bold ${selectedCoin.indicators.rsi > 70 ? "text-red-400" :
                                                        selectedCoin.indicators.rsi < 30 ? "text-green-400" : "text-white"
                                                    }`}>
                                                    {selectedCoin.indicators.rsi}
                                                </p>
                                            </div>
                                            <div className="bg-gray-700/30 rounded-lg p-4">
                                                <p className="text-gray-400 text-sm">Volatility</p>
                                                <p className="text-xl font-bold">{selectedCoin.indicators.volatility}%</p>
                                            </div>
                                            <div className="bg-gray-700/30 rounded-lg p-4">
                                                <p className="text-gray-400 text-sm">SMA (20)</p>
                                                <p className="text-xl font-bold">${selectedCoin.indicators.sma_20.toLocaleString()}</p>
                                            </div>
                                            <div className="bg-gray-700/30 rounded-lg p-4">
                                                <p className="text-gray-400 text-sm">SMA (50)</p>
                                                <p className="text-xl font-bold">${selectedCoin.indicators.sma_50.toLocaleString()}</p>
                                            </div>
                                            <div className="bg-gray-700/30 rounded-lg p-4">
                                                <p className="text-gray-400 text-sm">Current Price</p>
                                                <p className="text-xl font-bold text-blue-400">${selectedCoin.current_price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-12 text-center">
                                    <p className="text-gray-400">Select a coin to view predictions</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Disclaimer */}
                <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-xl text-yellow-400 text-sm">
                    ⚠️ <strong>Disclaimer:</strong> AI predictions are for educational purposes only.
                    Cryptocurrency trading involves significant risk. Always do your own research before making investment decisions.
                </div>
            </div>
        </main>
    );
}
