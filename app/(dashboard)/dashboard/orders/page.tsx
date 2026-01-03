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
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Orders</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Monitor and manage incoming orders from your tables.</p>
                </div>

                <div className="flex items-center gap-2 bg-zinc-100 dark:bg-white/5 p-1 rounded-xl border border-zinc-200 dark:border-white/10">
                    {['all', 'pending', 'preparing', 'completed'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${filter === f
                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                : 'text-zinc-500 hover:text-foreground dark:hover:text-white'
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
                                <div className="w-14 h-14 bg-zinc-100 dark:bg-black/40 rounded-2xl flex items-center justify-center text-xl font-black text-foreground dark:text-white border border-zinc-200 dark:border-white/10 shadow-sm dark:shadow-lg group-hover:scale-105 transition-transform">
                                    T{order.table_number}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-none text-foreground">
                                        Order #{order.id.slice(0, 4).toUpperCase()}
                                        {order.customer_name && <span className="text-zinc-500 dark:text-zinc-400 font-medium text-sm ml-2">by {order.customer_name}</span>}
                                    </h3>
                                    <p className="text-zinc-500 text-sm mt-1">
                                        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                            <div className={`px-4 py-2 rounded-full border text-xs font-black uppercase tracking-widest ${statusColors[order.status as keyof typeof statusColors]}`}>
                                {order.status}
                            </div>
                        </div>

                        <div className="bg-zinc-50 dark:bg-black/20 rounded-2xl p-4 space-y-3">
                            {order.order_items?.map((item: any) => (
                                <div key={item.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 bg-zinc-200 dark:bg-white/5 rounded flex items-center justify-center text-xs font-bold text-orange-600 dark:text-orange-500">
                                            {item.quantity}x
                                        </span>
                                        <span className="text-foreground dark:text-zinc-300 font-medium">{item.menu_items?.name}</span>
                                    </div>
                                    <span className="text-zinc-600 dark:text-zinc-500 text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="pt-3 border-t border-zinc-200 dark:border-white/5 flex items-center justify-between">
                                <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Total Amount</span>
                                <span className="text-lg font-black text-emerald-600 dark:text-emerald-500">${order.total_amount.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-auto">
                            {order.status === 'pending' && (
                                <button
                                    onClick={() => handleStatusUpdate(order.id, 'preparing')}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg shadow-blue-500/20"
                                >
                                    <Utensils className="w-4 h-4" /> Start Preparing
                                </button>
                            )}
                            {order.status === 'preparing' && (
                                <button
                                    onClick={() => handleStatusUpdate(order.id, 'completed')}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg shadow-emerald-500/20"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Served / Paid
                                </button>
                            )}
                            {['pending', 'preparing'].includes(order.status) && (
                                <button
                                    onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                                    className="px-4 py-3 bg-zinc-100 dark:bg-white/5 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 dark:hover:text-red-400 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {filteredOrders?.length === 0 && (
                    <div className="col-span-full py-40 flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-600 border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-[3rem]">
                        <ShoppingBag className="w-16 h-16 mb-6 opacity-10" />
                        <p className="text-xl font-medium">No {filter !== 'all' ? filter : ''} orders yet</p>
                        <p className="text-sm mt-2">Active orders will appear here in real-time.</p>
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
