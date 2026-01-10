'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, Clock, CheckCircle2, XCircle, ChevronDown, Loader2, Utensils } from 'lucide-react'
import { useOrders } from '@/hooks/useOrders'
import { useCafe } from '@/hooks/useCafe'
import { formatDistanceToNow } from 'date-fns'
import CafeGuard from '@/components/dashboard/CafeGuard'
import { toast } from 'sonner'

function OrdersContent() {
    const { cafe } = useCafe()
    const [filter, setFilter] = useState<string>('all')

    const { orders, isLoading: isOrdersLoading, updateStatus } = useOrders(cafe?.id)

    const filteredOrders = orders?.filter(o => filter === 'all' || o.status === filter)

    const statusColors = {
        pending: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
        preparing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
    }

    const handleStatusUpdate = async (id: string, status: any) => {
        toast.promise(updateStatus.mutateAsync({ id, status }), {
            loading: `Moving order to ${status}...`,
            success: `Order marked as ${status}`,
            error: 'Failed to update order status'
        })
    }

    if (isOrdersLoading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-zinc-500 text-sm animate-pulse">Monitoring your kitchen...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white italic tracking-tighter uppercase flex items-center gap-3">
                        <ShoppingBag className="w-8 h-8 text-orange-600 dark:text-orange-500" />
                        Orders Live
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Monitor and manage incoming orders from your tables.</p>
                </div>

                <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-black/40 p-1.5 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-inner">
                    {['all', 'pending', 'preparing', 'completed'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${filter === f
                                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-lg'
                                : 'text-zinc-400 hover:text-orange-600 dark:hover:text-orange-500'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {filteredOrders?.map((order) => (
                    <div key={order.id} className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-3xl p-6 flex flex-col gap-6 hover:bg-zinc-50 dark:hover:bg-white/[0.07] transition-all group border-l-4 border-l-orange-500 shadow-sm dark:shadow-none">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex flex-col items-center justify-center border border-zinc-200 dark:border-white/5 shadow-sm group-hover:scale-105 transition-transform">
                                        <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter">TABLE</span>
                                        <span className="text-2xl font-black text-zinc-900 dark:text-white italic leading-tight">{order.table_number}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg leading-none text-zinc-900 dark:text-white uppercase italic tracking-tight">
                                            Order #{order.id.slice(0, 4).toUpperCase()}
                                            {order.customer_name && <span className="text-orange-600 dark:text-orange-500 font-black text-sm ml-2">/ {order.customer_name}</span>}
                                        </h3>
                                        <p className="text-zinc-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className={`px-4 py-2 rounded-full border text-xs font-black uppercase tracking-widest ${statusColors[order.status as keyof typeof statusColors]}`}>
                                {order.status}
                            </div>
                        </div>

                        <div className="bg-zinc-100 dark:bg-black/40 rounded-[2rem] p-6 space-y-4 border border-zinc-200/50 dark:border-white/5">
                            {order.order_items?.map((item: any) => (
                                <div key={item.id} className="flex items-center justify-between group/item">
                                    <div className="flex items-center gap-4">
                                        <span className="w-8 h-8 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center text-xs font-black text-orange-600 dark:text-orange-500 border border-zinc-200 dark:border-white/5 shadow-sm group-hover/item:scale-110 transition-transform">
                                            {item.quantity}
                                        </span>
                                        <span className="text-zinc-900 dark:text-zinc-200 font-black italic uppercase tracking-tight">{item.menu_items?.name}</span>
                                    </div>
                                    <span className="text-zinc-500 dark:text-zinc-400 font-black text-xs italic">₹{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="pt-4 mt-2 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between">
                                <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Gross Total</span>
                                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-500 italic tracking-tighter">₹{order.total_amount.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {order.status === 'pending' && (
                                <button
                                    onClick={() => handleStatusUpdate(order.id, 'preparing')}
                                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl shadow-orange-600/20 active:scale-95 italic"
                                >
                                    <Utensils className="w-4 h-4" /> Start Preparing
                                </button>
                            )}
                            {order.status === 'preparing' && (
                                <button
                                    onClick={() => handleStatusUpdate(order.id, 'completed')}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/20 active:scale-95 italic"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Served / Paid
                                </button>
                            )}
                            {['pending', 'preparing', 'completed'].includes(order.status) && (
                                <button
                                    onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                                    className="p-4 bg-zinc-100 dark:bg-white/5 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-500 rounded-2xl transition-all border border-zinc-200 dark:border-white/10 active:scale-95"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {filteredOrders?.length === 0 && (
                    <div className="col-span-full py-40 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-[3rem] bg-zinc-50/50 dark:bg-white/[0.02]">
                        <ShoppingBag className="w-16 h-16 mb-6 opacity-20" />
                        <p className="text-XL font-black italic uppercase tracking-widest">No orders discovered</p>
                        <p className="text-zinc-400 text-sm mt-2 font-medium">Active orders will appear here in real-time.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function OrdersPage() {
    return (
        <CafeGuard>
            <OrdersContent />
        </CafeGuard>
    )
}
