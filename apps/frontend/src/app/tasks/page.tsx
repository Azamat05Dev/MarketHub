"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Task {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    assigned_to: string;
    created_at: string;
}

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium" });
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await fetch("http://localhost:3004/api/tasks/");
            if (response.ok) {
                const data = await response.json();
                setTasks(data);
            }
        } catch (err) {
            console.error("Failed to fetch tasks");
        } finally {
            setLoading(false);
        }
    };

    const createTask = async () => {
        try {
            const response = await fetch("http://localhost:3004/api/tasks/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newTask,
                    created_by: "demo-user",
                }),
            });

            if (response.ok) {
                fetchTasks();
                setNewTask({ title: "", description: "", priority: "medium" });
                setShowForm(false);
            }
        } catch (err) {
            console.error("Failed to create task");
        }
    };

    const updateStatus = async (taskId: string, newStatus: string) => {
        try {
            await fetch(`http://localhost:3004/api/tasks/${taskId}/update_status/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            fetchTasks();
        } catch (err) {
            console.error("Failed to update status");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "bg-green-900/50 text-green-400";
            case "in_progress": return "bg-blue-900/50 text-blue-400";
            case "cancelled": return "bg-red-900/50 text-red-400";
            default: return "bg-yellow-900/50 text-yellow-400";
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "urgent": return "text-red-400";
            case "high": return "text-orange-400";
            case "medium": return "text-yellow-400";
            default: return "text-gray-400";
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
                        <Link href="/booking" className="text-gray-400 hover:text-white">Booking</Link>
                        <Link href="/tasks" className="text-white">Tasks</Link>
                        <Link href="/auth" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">Sign In</Link>
                    </nav>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold">Task Management</h2>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
                    >
                        <span className="text-xl">+</span>
                        New Task
                    </button>
                </div>

                {/* New Task Form */}
                {showForm && (
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-8">
                        <h3 className="text-xl font-semibold mb-4">Create New Task</h3>
                        <div className="grid gap-4">
                            <input
                                type="text"
                                placeholder="Task title"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                            />
                            <textarea
                                placeholder="Description"
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                                rows={3}
                            />
                            <select
                                value={newTask.priority}
                                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                            >
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                                <option value="urgent">Urgent</option>
                            </select>
                            <button
                                onClick={createTask}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium"
                            >
                                Create Task
                            </button>
                        </div>
                    </div>
                )}

                {/* Task Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Total", count: tasks.length, color: "text-white" },
                        { label: "Pending", count: tasks.filter(t => t.status === "pending").length, color: "text-yellow-400" },
                        { label: "In Progress", count: tasks.filter(t => t.status === "in_progress").length, color: "text-blue-400" },
                        { label: "Completed", count: tasks.filter(t => t.status === "completed").length, color: "text-green-400" },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                            <p className="text-gray-400 text-sm">{stat.label}</p>
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
                        </div>
                    ))}
                </div>

                {/* Task List */}
                <div className="bg-gray-800/50 rounded-xl border border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-700">
                        <h3 className="text-xl font-semibold">All Tasks</h3>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Loading...</div>
                    ) : tasks.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            No tasks yet. Click "New Task" to create one.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-700">
                            {tasks.map((task) => (
                                <div key={task.id} className="p-6 hover:bg-gray-700/30 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="font-semibold text-lg">{task.title}</h4>
                                                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                                                    {task.status.replace("_", " ")}
                                                </span>
                                                <span className={`text-sm ${getPriorityColor(task.priority)}`}>
                                                    ● {task.priority}
                                                </span>
                                            </div>
                                            <p className="text-gray-400 text-sm">{task.description}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {task.status === "pending" && (
                                                <button
                                                    onClick={() => updateStatus(task.id, "in_progress")}
                                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                                                >
                                                    Start
                                                </button>
                                            )}
                                            {task.status === "in_progress" && (
                                                <button
                                                    onClick={() => updateStatus(task.id, "completed")}
                                                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                                                >
                                                    Complete
                                                </button>
                                            )}
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
