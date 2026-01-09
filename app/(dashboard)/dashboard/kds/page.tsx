'use client'

import { useState, useEffect } from 'react'
import { useCafe } from '@/hooks/useCafe'
import { useOrders } from '@/hooks/useOrders'
import {
    ChefHat,
    Clock,
    CheckCircle2,
    ArrowRight,
    AlertCircle,
    Maximize2,
    Minimize2
} from 'lucide-react'

// Helper to format time elapsed
function TimeElapsed({ startTime }: { startTime: string }) {
    const [elapsed, setElapsed] = useState('')
    const [isLate, setIsLate] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => {
            const start = new Date(startTime).getTime()
            const now = new Date().getTime()
            const diff = Math.floor((now - start) / 1000)

            const mins = Math.floor(diff / 60)
            const secs = diff % 60

            setElapsed(`${mins}m ${secs}s`)
            setIsLate(mins > 15) // Warning if over 15 mins
        }, 1000)
        return () => clearInterval(interval)
    }, [startTime])

    return (
        <span className={`font-mono font-bold ${isLate ? 'text-red-500 animate-pulse' : 'text-zinc-500'}`}>
            {elapsed}
        </span>
    )
}

export default function KDSPage() {
    const { cafe } = useCafe()
    const { orders, updateStatus } = useOrders(cafe?.id)
    const [isFullscreen, setIsFullscreen] = useState(false)

    const pendingOrders = orders?.filter(o => o.status === 'pending') || []
    const preparingOrders = orders?.filter(o => o.status === 'preparing') || []
    const completedOrders = orders?.filter(o => o.status === 'completed').slice(0, 10) || [] // Show last 10

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
            setIsFullscreen(true)
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen()
                setIsFullscreen(false)
            }
        }
    }

    // Sound effect for new pending orders
    useEffect(() => {
        if (pendingOrders.length > 0) {
            // Logic to play sound only on *new* arrivals could be complex, 
            // for now we trust the realtime hook in layout to handle the "Ding".
        }
    }, [pendingOrders.length])

    return (
        <div className={`space-y-6 ${isFullscreen ? 'p-8 bg-black fixed inset-0 z-[100] overflow-hidden' : ''}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <ChefHat className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Kitchen Display</h1>
                        <p className="text-zinc-400 font-medium">Live Order Management System</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-zinc-900 border border-white/5 rounded-xl px-4 py-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm font-bold text-zinc-400">Live Feed</span>
                    </div>
                    <button
                        onClick={toggleFullscreen}
                        className="p-3 bg-zinc-900 border border-white/5 hover:border-white/20 rounded-xl text-zinc-400 hover:text-white transition-all"
                    >
                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">

                {/* Pending Column */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl flex flex-col overflow-hidden backdrop-blur-sm">
                    <div className="p-4 border-b border-white/5 bg-red-500/10 flex items-center justify-between">
                        <h2 className="text-lg font-black text-red-500 uppercase tracking-wide flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" /> Pending
                        </h2>
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">{pendingOrders.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {pendingOrders.map(order => (
                            <div key={order.id} className="bg-zinc-900 border border-white/10 rounded-2xl p-5 shadow-xl animate-in fade-in slide-in-from-left-4 duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <span className="text-orange-500 font-black text-xl">Table {order.table_number}</span>
                                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{order.customer_name || 'Guest'}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <TimeElapsed startTime={order.created_at} />
                                    </div>
                                </div>
                                <div className="space-y-2 mb-4">
                                    {order.order_items.map((item: any) => (
                                        <div key={item.id} className="flex justify-between text-sm font-medium text-zinc-300 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                            <span>{item.quantity}x {item.menu_items.name}</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => updateStatus.mutate({ id: order.id, status: 'preparing' })}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    Start Preparing <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {pendingOrders.length === 0 && (
                            <div className="h-40 flex flex-col items-center justify-center text-zinc-600">
                                <CheckCircle2 className="w-8 h-8 opacity-20 mb-2" />
                                <p className="text-sm font-medium">All caught up!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Preparing Column */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl flex flex-col overflow-hidden backdrop-blur-sm">
                    <div className="p-4 border-b border-white/5 bg-orange-500/10 flex items-center justify-between">
                        <h2 className="text-lg font-black text-orange-500 uppercase tracking-wide flex items-center gap-2">
                            <ChefHat className="w-5 h-5" /> Preparing
                        </h2>
                        <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-lg">{preparingOrders.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {preparingOrders.map(order => (
                            <div key={order.id} className="bg-zinc-900 border border-orange-500/20 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-50">
                                    <ChefHat className="w-12 h-12 text-orange-500/10" />
                                </div>
                                <div className="flex items-start justify-between mb-4 relative z-10">
                                    <div>
                                        <span className="text-white font-black text-xl">Table {order.table_number}</span>
                                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Preparing...</p>
                                    </div>
                                    <TimeElapsed startTime={order.created_at} />
                                </div>
                                <div className="space-y-2 mb-4 relative z-10">
                                    {order.order_items.map((item: any) => (
                                        <div key={item.id} className="flex justify-between text-sm font-medium text-zinc-300">
                                            <span>{item.quantity}x {item.menu_items.name}</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => updateStatus.mutate({ id: order.id, status: 'completed' })}
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 relative z-10 shadow-lg shadow-emerald-500/20"
                                >
                                    Mark Ready <CheckCircle2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Completed Column */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl flex flex-col overflow-hidden backdrop-blur-sm opacity-60 hover:opacity-100 transition-opacity">
                    <div className="p-4 border-b border-white/5 bg-emerald-500/10 flex items-center justify-between">
                        <h2 className="text-lg font-black text-emerald-500 uppercase tracking-wide flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" /> Completed
                        </h2>
                        <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-lg">{completedOrders.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {completedOrders.map(order => (
                            <div key={order.id} className="bg-zinc-900 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                                <div>
                                    <span className="text-zinc-500 font-bold">Table {order.table_number}</span>
                                    <p className="text-zinc-600 text-xs uppercase">{order.customer_name}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-emerald-500 font-bold text-sm block">Served</span>
                                    <span className="text-zinc-600 text-xs">${order.total_amount}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}
