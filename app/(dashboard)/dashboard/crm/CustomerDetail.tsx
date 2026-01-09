'use client'

import { useState, useEffect } from 'react'
import {
    X,
    History as HistoryIcon,
    ArrowUpRight,
    ArrowDownLeft,
    Gift,
    Clock,
    Trophy,
    User,
    Calendar,
    Loader2
} from 'lucide-react'
import { Customer } from '@/types'
import { format } from 'date-fns'
import { useCRM } from '@/hooks/useCRM'

interface CustomerDetailProps {
    customer: Customer
    onClose: () => void
}

export default function CustomerDetail({ customer, onClose }: CustomerDetailProps) {
    const { fetchCustomerHistory } = useCRM(customer.cafe_id)
    const [history, setHistory] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadHistory = async () => {
            setIsLoading(true)
            const data = await fetchCustomerHistory(customer.id)
            setHistory(data)
            setIsLoading(false)
        }
        loadHistory()
    }, [customer.id])

    return (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-white/10 z-[110] shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-orange-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/20">
                        {(customer.customer_name || '?')[0].toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-foreground">{customer.customer_name}</h2>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[.2em] flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-orange-500" />
                            Active Since {format(new Date(customer.created_at), 'MMM yyyy')}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-all"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="p-6 space-y-8 overflow-y-auto h-[calc(100vh-100px)] custom-scrollbar">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[.2em] mb-1">Total Spend</p>
                        <p className="text-2xl font-black text-foreground">${customer.total_spend.toFixed(2)}</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[.2em] mb-1">Points Balance</p>
                        <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{customer.loyalty_points || 0} pts</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[.2em] mb-1">Visit Count</p>
                        <p className="text-2xl font-black text-foreground">{customer.visit_count} visits</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[.2em] mb-1">Last Visit</p>
                        <p className="text-sm font-black text-zinc-500 mt-2 italic">
                            {customer.last_visit ? format(new Date(customer.last_visit), 'MMM dd, yyyy') : 'Never'}
                        </p>
                    </div>
                </div>

                {/* Transaction History */}
                <div>
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[.2em] flex items-center gap-2 mb-6">
                        <HistoryIcon className="w-4 h-4 text-orange-500" />
                        Loyalty History
                    </h3>

                    <div className="space-y-3">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                            </div>
                        ) : history.length > 0 ? (
                            history.map((tx) => (
                                <div key={tx.id} className="bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-orange-500/20 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'earn' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'
                                            }`}>
                                            {tx.type === 'earn' ? <ArrowUpRight className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">{tx.description || (tx.type === 'earn' ? 'Manual Reward' : 'Redemption')}</p>
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                                {format(new Date(tx.created_at), 'MMM dd, HH:mm')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`text-sm font-black ${tx.type === 'earn' ? 'text-emerald-500' : 'text-pink-500'
                                        }`}>
                                        {tx.points > 0 ? '+' : ''}{tx.points} pts
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
                                <Trophy className="w-12 h-12 text-zinc-800 mx-auto mb-3 opacity-20" />
                                <p className="text-zinc-500 text-sm font-medium">No transactions found.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions (Future) */}
                <div className="pt-6 border-t border-white/5">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3">Quick Actions</p>
                    <button
                        disabled
                        className="w-full bg-zinc-900 text-zinc-500 border border-white/5 rounded-xl py-3 text-xs font-bold transition-all opacity-50 cursor-not-allowed uppercase tracking-widest"
                    >
                        Send Reward Notification
                    </button>
                </div>
            </div>
        </div>
    )
}
