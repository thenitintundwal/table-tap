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
        <div className={`space-y-8 ${isFullscreen ? 'p-10 bg-white dark:bg-black fixed inset-0 z-[100] overflow-hidden' : 'animate-in fade-in duration-700'}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-orange-500 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-orange-500/20 italic font-black text-white text-2xl">
                        K
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-foreground dark:text-white italic tracking-tighter uppercase">Kitchen Display</h1>
                        <p className="text-zinc-500 font-medium text-lg">Live Order Management System</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl px-5 py-2.5 shadow-sm shadow-black/5">
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                        <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Live Feed</span>
                    </div>
                    <button
                        onClick={toggleFullscreen}
                        className="p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 hover:border-orange-500/30 rounded-2xl text-zinc-400 hover:text-orange-500 transition-all shadow-sm shadow-black/5"
                    >
                        {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-[calc(100vh-220px)]">

                {/* Pending Column */}
                <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-zinc-200 dark:border-white/5 bg-rose-500/5 flex items-center justify-between">
                        <h2 className="text-lg font-black text-rose-500 uppercase tracking-widest flex items-center gap-3 italic">
                            <AlertCircle className="w-6 h-6" /> Pending
                        </h2>
                        <span className="bg-rose-500 text-white text-xs font-black px-3 py-1 rounded-xl shadow-lg shadow-rose-500/20">{pendingOrders.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {pendingOrders.map(order => (
                            <div key={order.id} className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-white/10 rounded-[2rem] p-6 shadow-sm shadow-black/5 animate-in fade-in slide-in-from-left-4 duration-300 group hover:border-orange-500/30 transition-all">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <span className="text-orange-500 font-black text-2xl italic">Table {order.table_number}</span>
                                        <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{order.customer_name || 'Guest'}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <TimeElapsed startTime={order.created_at} />
                                    </div>
                                </div>
                                <div className="space-y-3 mb-8">
                                    {order.order_items.map((item: any) => (
                                        <div key={item.id} className="flex justify-between text-sm font-bold text-zinc-600 dark:text-zinc-300 border-b border-zinc-50 dark:border-white/5 pb-3 last:border-0 last:pb-0">
                                            <span>{item.quantity}x {item.menu_items.name}</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => updateStatus.mutate({ id: order.id, status: 'preparing' })}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-orange-500/20 italic italic text-xs"
                                >
                                    Start Preparing <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {pendingOrders.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700 py-20 px-10 text-center">
                                <CheckCircle2 className="w-16 h-16 opacity-20 mb-6" />
                                <p className="text-sm font-black uppercase tracking-widest opacity-40">All orders are cleared</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Preparing Column */}
                <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-zinc-200 dark:border-white/5 bg-orange-500/5 flex items-center justify-between">
                        <h2 className="text-lg font-black text-orange-500 uppercase tracking-widest flex items-center gap-3 italic">
                            <ChefHat className="w-6 h-6" /> Processing
                        </h2>
                        <span className="bg-orange-500 text-white text-xs font-black px-3 py-1 rounded-xl shadow-lg shadow-orange-500/20">{preparingOrders.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {preparingOrders.map(order => (
                            <div key={order.id} className="bg-white dark:bg-zinc-900 border-2 border-orange-500/20 rounded-[2rem] p-6 shadow-xl shadow-orange-500/5 relative overflow-hidden group hover:border-orange-500/40 transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <ChefHat className="w-16 h-16 text-orange-500" />
                                </div>
                                <div className="flex items-start justify-between mb-6 relative z-10">
                                    <div>
                                        <span className="text-foreground dark:text-white font-black text-2xl italic">Table {order.table_number}</span>
                                        <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">In Progress</p>
                                    </div>
                                    <TimeElapsed startTime={order.created_at} />
                                </div>
                                <div className="space-y-3 mb-8 relative z-10">
                                    {order.order_items.map((item: any) => (
                                        <div key={item.id} className="flex justify-between text-sm font-bold text-zinc-600 dark:text-zinc-300 border-b border-zinc-50 dark:border-white/5 pb-3 last:border-0 last:pb-0">
                                            <span>{item.quantity}x {item.menu_items.name}</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => updateStatus.mutate({ id: order.id, status: 'completed' })}
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 relative z-10 shadow-lg shadow-emerald-500/20 italic text-xs"
                                >
                                    Mark as Ready <CheckCircle2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Completed Column */}
                <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden shadow-sm opacity-60 hover:opacity-100 transition-all duration-500">
                    <div className="p-6 border-b border-zinc-200 dark:border-white/5 bg-emerald-500/5 flex items-center justify-between">
                        <h2 className="text-lg font-black text-emerald-500 uppercase tracking-widest flex items-center gap-3 italic">
                            <CheckCircle2 className="w-6 h-6" /> Recently Ready
                        </h2>
                        <span className="bg-emerald-500 text-white text-xs font-black px-3 py-1 rounded-xl shadow-lg shadow-emerald-500/20">{completedOrders.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        {completedOrders.map(order => (
                            <div key={order.id} className="bg-white dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                                <div>
                                    <span className="text-zinc-600 dark:text-zinc-300 font-black italic">Table {order.table_number}</span>
                                    <p className="text-zinc-400 text-[10px] font-black uppercase mt-0.5">{order.customer_name}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-emerald-500 font-black text-[10px] block uppercase tracking-widest">Served</span>
                                    <span className="text-zinc-400 font-mono text-xs">₹{order.total_amount}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}
