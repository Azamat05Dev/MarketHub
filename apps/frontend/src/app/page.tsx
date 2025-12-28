"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Price {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  timestamp: string;
}

interface User {
  email: string;
  role: string;
}

export default function Home() {
  const [prices, setPrices] = useState<Price[]>([]);
  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for auth token
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      // Fetch user profile
      fetch("http://localhost:3001/auth/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
          }
        })
        .catch(() => {
          // Token invalid, clear it
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }

    // Connect to WebSocket for real-time prices
    const ws = new WebSocket("ws://localhost:3002/ws");

    ws.onopen = () => {
      setConnected(true);
      console.log("Connected to Market Stream");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPrices(data.prices);
    };

    ws.onclose = () => {
      setConnected(false);
      console.log("Disconnected from Market Stream");
    };

    return () => ws.close();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(2)}M`;
    }
    return `$${(volume / 1000).toFixed(2)}K`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold">M</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              MarketHub
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${connected ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"
              }`}>
              <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`} />
              {connected ? "Live" : "Disconnected"}
            </div>
            {isLoading ? (
              <div className="w-20 h-10 bg-gray-700 animate-pulse rounded-lg" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                    {user.email[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-300">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/auth" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm">Total Active Coins</h3>
            <p className="text-3xl font-bold mt-2">{prices.length}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm">Top Gainer</h3>
            <p className="text-3xl font-bold mt-2 text-green-400">
              {prices.length > 0
                ? prices.reduce((a, b) => a.change24h > b.change24h ? a : b).symbol
                : "-"}
            </p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm">WebSocket Status</h3>
            <p className="text-3xl font-bold mt-2 text-blue-400">
              {connected ? "Connected" : "Reconnecting..."}
            </p>
          </div>
        </div>

        {/* Prices Table */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold">Real-Time Prices</h2>
            <p className="text-gray-400 text-sm">Live crypto prices updated every second</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    24h Change
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Volume
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {prices.map((price) => (
                  <tr key={price.symbol} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
                          {price.symbol[0]}
                        </div>
                        <span className="font-medium">{price.symbol}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono">
                      {formatPrice(price.price)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right font-mono ${price.change24h >= 0 ? "text-green-400" : "text-red-400"
                      }`}>
                      {price.change24h >= 0 ? "+" : ""}{price.change24h.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-400">
                      {formatVolume(price.volume)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Services Status */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { name: "Auth Service", port: 3001, status: "running" },
            { name: "Market Stream", port: 3002, status: "running" },
            { name: "Booking Service", port: 3003, status: "pending" },
            { name: "Task Service", port: 3004, status: "pending" },
          ].map((service) => (
            <div key={service.name} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{service.name}</span>
                <span className={`text-xs px-2 py-1 rounded ${service.status === "running"
                  ? "bg-green-900/50 text-green-400"
                  : "bg-yellow-900/50 text-yellow-400"
                  }`}>
                  {service.status}
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-1">Port: {service.port}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-700 px-6 py-4 mt-auto">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
          MarketHub - Enterprise Microservices Platform © 2025
        </div>
      </footer>
    </main>
  );
}
