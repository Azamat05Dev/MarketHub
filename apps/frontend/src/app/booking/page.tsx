"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface TimeSlot {
    time: string;
    available: boolean;
}

interface Analyst {
    id: string;
    name: string;
    specialty: string;
    rating: number;
    price: number;
}

export default function BookingPage() {
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedSlot, setSelectedSlot] = useState<string>("");
    const [selectedAnalyst, setSelectedAnalyst] = useState<Analyst | null>(null);
    const [loading, setLoading] = useState(false);

    const analysts: Analyst[] = [
        { id: "1", name: "Alex Johnson", specialty: "Bitcoin Analysis", rating: 4.9, price: 150 },
        { id: "2", name: "Maria Garcia", specialty: "DeFi Expert", rating: 4.8, price: 120 },
        { id: "3", name: "John Smith", specialty: "Altcoin Trading", rating: 4.7, price: 100 },
    ];

    const timeSlots: TimeSlot[] = [
        { time: "09:00", available: true },
        { time: "10:00", available: true },
        { time: "11:00", available: false },
        { time: "14:00", available: true },
        { time: "15:00", available: true },
        { time: "16:00", available: false },
    ];

    const handleBooking = async () => {
        if (!selectedAnalyst || !selectedDate || !selectedSlot) return;

        setLoading(true);
        try {
            const response = await fetch("http://localhost:3003/api/booking/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: "demo-user",
                    analyst_id: selectedAnalyst.id,
                    slot_time: `${selectedDate}T${selectedSlot}:00`,
                    duration_minutes: 30,
                }),
            });

            if (response.ok) {
                alert("Booking confirmed!");
                setSelectedSlot("");
            } else {
                alert("Slot already booked!");
            }
        } catch (err) {
            alert("Booking service unavailable");
        } finally {
            setLoading(false);
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
                        <Link href="/booking" className="text-white">Booking</Link>
                        <Link href="/auth" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">Sign In</Link>
                    </nav>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <h2 className="text-3xl font-bold mb-8">Book a VIP Analyst Session</h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Analysts */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-xl font-semibold text-gray-300">Select Analyst</h3>
                        <div className="grid gap-4">
                            {analysts.map((analyst) => (
                                <div
                                    key={analyst.id}
                                    onClick={() => setSelectedAnalyst(analyst)}
                                    className={`p-6 rounded-xl border cursor-pointer transition-all ${selectedAnalyst?.id === analyst.id
                                            ? "bg-blue-900/30 border-blue-500"
                                            : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xl font-bold">
                                                {analyst.name[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-lg">{analyst.name}</h4>
                                                <p className="text-gray-400">{analyst.specialty}</p>
                                                <div className="flex items-center gap-1 text-yellow-400 text-sm mt-1">
                                                    ⭐ {analyst.rating}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-green-400">${analyst.price}</p>
                                            <p className="text-gray-400 text-sm">per session</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Date & Time */}
                        {selectedAnalyst && (
                            <div className="mt-8 space-y-4">
                                <h3 className="text-xl font-semibold text-gray-300">Select Date & Time</h3>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    min={new Date().toISOString().split("T")[0]}
                                    className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                                />

                                {selectedDate && (
                                    <div className="grid grid-cols-3 gap-3 mt-4">
                                        {timeSlots.map((slot) => (
                                            <button
                                                key={slot.time}
                                                onClick={() => slot.available && setSelectedSlot(slot.time)}
                                                disabled={!slot.available}
                                                className={`py-3 rounded-lg font-medium transition-all ${selectedSlot === slot.time
                                                        ? "bg-blue-600 text-white"
                                                        : slot.available
                                                            ? "bg-gray-700 hover:bg-gray-600 text-white"
                                                            : "bg-gray-800 text-gray-500 cursor-not-allowed line-through"
                                                    }`}
                                            >
                                                {slot.time}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 h-fit sticky top-8">
                        <h3 className="text-xl font-semibold mb-6">Booking Summary</h3>

                        {selectedAnalyst ? (
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Analyst</span>
                                    <span>{selectedAnalyst.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Date</span>
                                    <span>{selectedDate || "-"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Time</span>
                                    <span>{selectedSlot || "-"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Duration</span>
                                    <span>30 minutes</span>
                                </div>
                                <hr className="border-gray-700" />
                                <div className="flex justify-between text-xl font-bold">
                                    <span>Total</span>
                                    <span className="text-green-400">${selectedAnalyst.price}</span>
                                </div>

                                <button
                                    onClick={handleBooking}
                                    disabled={!selectedDate || !selectedSlot || loading}
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Processing..." : "Confirm Booking"}
                                </button>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-8">Select an analyst to continue</p>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
