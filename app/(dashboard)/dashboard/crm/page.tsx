'use client'

import { useCafe } from '@/hooks/useCafe'
import { useCRM } from '@/hooks/useCRM'
import { Customer } from '@/types'
import {
    Users,
    Search,
    Trophy,
    Calendar,
    Sparkles,
    Wallet,
    Loader2,
    RefreshCw,
    Gift,
    X,
    Check
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import CustomerDetail from './CustomerDetail'
import { formatDistanceToNow } from 'date-fns'

export default function CRMPage() {
    const { cafe } = useCafe()
    const { customers, isLoading, syncCustomers, redeemPoints } = useCRM(cafe?.id)
    const [searchQuery, setSearchQuery] = useState('')
    const [redeemModalOpen, setRedeemModalOpen] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null)
    const [redeemPointsAmount, setRedeemPointsAmount] = useState<string>('')
    const [redeemDiscountValue, setRedeemDiscountValue] = useState<string>('')
    const [isRedeeming, setIsRedeeming] = useState(false)

    const filteredCustomers = customers.filter(c =>
        (c.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getCustomerTier = (spend: number) => {
        if (spend > 500) return { label: 'VIP', color: 'text-purple-500', bg: 'bg-purple-500/10' }
        if (spend > 100) return { label: 'Regular', color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
        return { label: 'New', color: 'text-blue-500', bg: 'bg-blue-500/10' }
    }

    const handleSync = async () => {
        await syncCustomers()
    }

    const openRedeemModal = (customer: Customer) => {
        setSelectedCustomer(customer)
        setRedeemPointsAmount('')
        setRedeemDiscountValue('')
        setRedeemModalOpen(true)
    }

    const handleRedeemSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedCustomer) return

        const points = parseInt(redeemPointsAmount)
        const value = parseFloat(redeemDiscountValue)

        if (isNaN(points) || points <= 0) return toast.error('Invalid points amount')
        if (points > (selectedCustomer.loyalty_points || 0)) return toast.error('Insufficient points')
        if (isNaN(value) || value <= 0) return toast.error('Invalid discount value')

        setIsRedeeming(true)
        try {
            await redeemPoints(selectedCustomer.id, points, value)
            toast.success('Points redeemed successfully!')
            setRedeemModalOpen(false)
        } catch (error: any) {
            toast.error('Redemption failed: ' + error.message)
        } finally {
            setIsRedeeming(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                <p className="text-zinc-500 mt-4 text-sm font-medium">Analyzing customer data...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground italic tracking-tighter uppercase flex items-center gap-3">
                        <Users className="w-8 h-8 text-orange-500" />
                        CRM & Loyalty
                    </h1>
                    <p className="text-zinc-500 font-medium mt-1">
                        Turn guests into regulars. {customers.length} profiles active.
                    </p>
                </div>
                <button
                    onClick={handleSync}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                >
                    <RefreshCw className="w-4 h-4" />
                    Sync from Orders
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 p-6 rounded-2xl shadow-sm shadow-black/5 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-orange-500/10 rounded-xl"><Users className="w-5 h-5 text-orange-500" /></div>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Total Customers</p>
                    </div>
                    <p className="text-3xl font-black text-foreground">{customers.length}</p>
                </div>
                <div className="bg-white dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 p-6 rounded-2xl shadow-sm shadow-black/5 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-emerald-500/10 rounded-xl"><Wallet className="w-5 h-5 text-emerald-500" /></div>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Avg. Spend</p>
                    </div>
                    <p className="text-3xl font-black text-foreground">
                        ${customers.length > 0 ? (customers.reduce((acc, c) => acc + c.total_spend, 0) / customers.length).toFixed(2) : '0.00'}
                    </p>
                </div>
                <div className="bg-white dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 p-6 rounded-2xl shadow-sm shadow-black/5 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-purple-500/10 rounded-xl"><Trophy className="w-5 h-5 text-purple-500" /></div>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Total Points Issued</p>
                    </div>
                    <p className="text-3xl font-black text-foreground">
                        {customers.reduce((acc, c) => acc + (c.loyalty_points || 0), 0).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Customer List */}
            <div className="bg-white dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-sm shadow-black/5 transition-all">
                <div className="p-6 border-b border-zinc-100 dark:border-white/5">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search customer name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-black/5 dark:bg-black/20 text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-left">
                            <tr>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Loyalty Tier</th>
                                <th className="px-6 py-4">Points Balance</th>
                                <th className="px-6 py-4">Total Spend</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 dark:divide-white/5">
                            {filteredCustomers.map((customer, i) => {
                                const tier = getCustomerTier(customer.total_spend)
                                return (
                                    <tr key={i} className="group hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setViewingCustomer(customer)}>
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-orange-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/20">
                                                    {(customer.customer_name || '?')[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-foreground block group-hover:text-orange-600 transition-colors">{customer.customer_name}</span>
                                                    <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">
                                                        Last visit {customer.last_visit ? formatDistanceToNow(new Date(customer.last_visit)) + ' ago' : 'never'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border border-current/10 ${tier.color} ${tier.bg}`}>
                                                <Sparkles className="w-3 h-3" />
                                                {tier.label}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-purple-400 font-bold">
                                            {customer.loyalty_points || 0} pts
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-foreground">
                                            ${customer.total_spend.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => setViewingCustomer(customer)}
                                                    className="text-[10px] font-black uppercase text-zinc-500 hover:text-orange-500 px-4 py-2 rounded-xl border border-transparent hover:border-orange-500/10 transition-all"
                                                >
                                                    History
                                                </button>
                                                <button
                                                    onClick={() => openRedeemModal(customer)}
                                                    className="text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-5 py-2 rounded-xl transition-all shadow-lg shadow-orange-500/10 active:scale-95"
                                                >
                                                    Redeem
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {filteredCustomers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                        <p className="font-medium">No customers found.</p>
                                        <p className="text-xs mt-1">Try syncing from orders.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Redeem Modal */}
            {redeemModalOpen && selectedCustomer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setRedeemModalOpen(false)} />
                    <div className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-3xl p-6 relative z-10 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Gift className="w-5 h-5 text-pink-500" />
                                Redeem Points
                            </h3>
                            <button onClick={() => setRedeemModalOpen(false)} className="text-zinc-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-6 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                            <p className="text-xs text-purple-300 font-bold uppercase tracking-wider mb-1">Customer Balance</p>
                            <p className="text-3xl font-black text-white">{selectedCustomer.loyalty_points || 0} <span className="text-sm font-medium text-purple-400">pts</span></p>
                        </div>

                        <form onSubmit={handleRedeemSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Points to Redeem</label>
                                <input
                                    type="number"
                                    value={redeemPointsAmount}
                                    onChange={(e) => setRedeemPointsAmount(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                                    placeholder="e.g. 100"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Discount Value ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={redeemDiscountValue}
                                    onChange={(e) => setRedeemDiscountValue(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    placeholder="e.g. 10.00"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isRedeeming}
                                className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-xl py-4 font-bold shadow-lg shadow-pink-500/20 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                            >
                                {isRedeeming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                Confirm Redemption
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Customer Detail Slider */}
            {viewingCustomer && (
                <CustomerDetail
                    customer={viewingCustomer}
                    onClose={() => setViewingCustomer(null)}
                />
            )}
        </div>
    )
}
