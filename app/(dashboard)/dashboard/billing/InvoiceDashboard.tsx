'use client'

import { useState, useMemo } from 'react'
import {
    TrendingUp,
    TrendingDown,
    ShoppingCart,
    Wallet,
    ArrowUpRight,
    Calendar,
    Plus,
    FileText,
    History,
    PieChart as PieChartIcon,
    ArrowRight,
    CircleDot,
    X,
    Loader2
} from 'lucide-react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    AreaChart,
    Area
} from 'recharts'
import { useAccounts } from '@/hooks/useAccounts'
import { useCafe } from '@/hooks/useCafe'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function InvoiceDashboard() {
    const { cafe } = useCafe()
    const {
        metrics,
        trendData,
        parties,
        isMetricsLoading,
        isTrendLoading,
        isPartiesLoading,
        addInvoice,
        addExpense
    } = useAccounts(cafe?.id)

    const [activeTab, setActiveTab] = useState('Sales')
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)

    const stats = [
        {
            label: 'Total Sales',
            value: metrics?.totalSales || 0,
            change: metrics?.salesGrowth || 0,
            icon: TrendingUp,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10'
        },
        {
            label: 'Total Purchase',
            value: metrics?.totalPurchase || 0,
            change: metrics?.purchaseGrowth || 0,
            icon: ShoppingCart,
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10'
        },
        {
            label: 'Receivable',
            value: metrics?.receivables || 0,
            change: metrics?.receivableGrowth || 0,
            icon: Wallet,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10'
        },
        {
            label: 'Total Payable',
            value: metrics?.payables || 0,
            change: metrics?.payableGrowth || 0,
            icon: ArrowUpRight,
            color: 'text-rose-500',
            bgColor: 'bg-rose-500/10'
        },
    ]

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

    const currentMonth = format(new Date(), 'MMMM yyyy').toUpperCase()

    if (isMetricsLoading || isTrendLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-zinc-500 mt-4 text-sm font-medium">Syncing Ledger...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Invoices & Accounts</h1>
                    <p className="text-zinc-500 mt-1 font-medium text-sm">Comprehensive billing, purchase, and accounts intelligence.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 rounded-xl p-1.5 shadow-sm shadow-black/5 transition-all">
                        <div className="flex items-center gap-2 px-3 py-1 text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                            <Calendar className="w-3.5 h-3.5 text-orange-500" />
                            {currentMonth}
                        </div>
                    </div>
                    <button
                        onClick={() => setIsInvoiceModalOpen(true)}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg shadow-orange-600/20 transition-all flex items-center gap-2 active:scale-95 uppercase tracking-wide"
                    >
                        <Plus className="w-4 h-4" />
                        Add Invoice
                    </button>
                    <button
                        onClick={() => setIsExpenseModalOpen(true)}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 active:scale-95 uppercase tracking-widest shadow-lg shadow-black/5"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Log Expense
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 p-6 rounded-[2rem] hover:shadow-xl hover:shadow-black/5 transition-all group relative overflow-hidden shadow-sm shadow-black/5">
                        <div className="flex items-center justify-between mb-6">
                            <div className={`p-4 rounded-2xl bg-zinc-50 dark:bg-black/40 ${stat.bgColor} dark:bg-transparent`}>
                                <stat.icon className={`w-7 h-7 ${stat.color}`} />
                            </div>
                            <div className={`text-[10px] font-bold px-2 py-1 rounded-full ${stat.change >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                                {stat.change >= 0 ? '+' : ''}{stat.change}%
                            </div>
                        </div>
                        <div>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium uppercase tracking-tight">{stat.label}</p>
                            <p className="text-2xl font-bold mt-1 tracking-tight text-foreground">{formatCurrency(stat.value)}</p>
                        </div>
                        {/* Hover bar */}
                        <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent`} />
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Trend Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 p-8 rounded-[2.5rem] shadow-sm shadow-black/5 min-h-[480px] flex flex-col">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <h3 className="text-xl font-black text-foreground">Financial Trends</h3>
                            <p className="text-xs text-zinc-500 font-medium">Tracking Sales vs Purchase vs Expense</p>
                        </div>
                        <div className="flex items-center gap-1.5 p-1.5 bg-zinc-50 dark:bg-white/5 rounded-2xl border border-zinc-100 dark:border-white/10 shadow-inner">
                            {['Sales', 'Purchase', 'Expense'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                                        ? 'bg-white dark:bg-white/10 text-orange-500 shadow-sm border border-zinc-100 dark:border-white/10'
                                        : 'text-zinc-400 hover:text-orange-500'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData || []}>
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-zinc-100 dark:text-white/5" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#71717a', fontSize: 10, fontWeight: 500 }}
                                    tickFormatter={(val: string) => format(new Date(val), 'd MMM')}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#71717a', fontSize: 10, fontWeight: 500 }}
                                    tickFormatter={(val) => `₹${val / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        fontSize: '12px',
                                        color: 'white'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey={activeTab.toLowerCase()}
                                    stroke="#f97316"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#chartGradient)"
                                    dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: 'white' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Simplified Profit & Loss */}
                <div className="bg-white dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 p-8 rounded-[2.5rem] shadow-sm shadow-black/5 flex flex-col">
                    <h3 className="text-xl font-black text-foreground mb-10">Financial Summary</h3>

                    <div className="space-y-6 flex-1">
                        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-black/20 border border-zinc-100 dark:border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Gross Revenue</span>
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                            </div>
                            <p className="text-xl font-bold text-foreground">{formatCurrency(metrics?.totalSales || 0)}</p>
                        </div>

                        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-black/20 border border-zinc-100 dark:border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Expenses</span>
                                <TrendingDown className="w-4 h-4 text-rose-500" />
                            </div>
                            <p className="text-2xl font-black text-foreground">{formatCurrency(metrics?.totalPurchase || 0)}</p>
                        </div>

                        <div className="p-6 rounded-3xl bg-orange-500/5 border border-orange-500/10 mt-8 relative overflow-hidden group shadow-sm shadow-orange-500/5">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <PieChartIcon className="w-16 h-16 text-orange-500" />
                            </div>
                            <span className="text-[10px] font-black text-orange-600 dark:text-orange-500 uppercase tracking-[.2em]">Estimated Net Profit</span>
                            <p className="text-4xl font-black text-orange-600 dark:text-orange-500 mt-3 tracking-tighter">
                                {formatCurrency((metrics?.totalSales || 0) - (metrics?.totalPurchase || 0))}
                            </p>
                        </div>
                    </div>

                    <button className="w-full mt-8 py-4 rounded-2xl bg-orange-500 text-white font-black text-[10px] uppercase tracking-[.2em] hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-95">
                        Generate Detailed P&L
                    </button>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
                {/* Sales Projection Bar Chart */}
                <div className="bg-white dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 p-8 rounded-[2.5rem] shadow-sm shadow-black/5">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-black text-foreground">Sales Projection</h3>
                        <span className="text-[10px] font-black text-zinc-400 bg-zinc-50 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-zinc-100 dark:border-white/10 uppercase tracking-widest">LAST 10 DAYS</span>
                    </div>

                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData?.slice(-10) || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-zinc-100 dark:text-white/5" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 700 }} tickFormatter={(val) => format(new Date(val), 'd MMM')} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 700 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="sales" fill="#f97316" radius={[6, 6, 0, 0]} name="Actual Sales" barSize={24} />
                                <Bar dataKey="expense" fill="currentColor" className="text-zinc-100 dark:text-white/10" radius={[6, 6, 0, 0]} name="Budget" barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Receivables List */}
                <div className="bg-white dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 p-8 rounded-[2.5rem] shadow-sm shadow-black/5 flex flex-col">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-black text-foreground">Outstanding Balances</h3>
                        <button className="text-zinc-400 hover:text-orange-500 text-[10px] font-black uppercase tracking-widest transition-colors">SEE ALL</button>
                    </div>

                    <div className="space-y-4 flex-1">
                        {parties?.slice(0, 5).map((party) => (
                            <div key={party.id} className="flex items-center justify-between p-5 rounded-3xl bg-zinc-50/50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 hover:border-orange-500/20 hover:bg-white dark:hover:bg-white/10 transition-all group shadow-sm shadow-black/5 hover:shadow-orange-500/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/10 flex items-center justify-center font-black text-zinc-400 border border-zinc-100 dark:border-white/10 shadow-sm">
                                        {party.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground group-hover:text-orange-600 transition-colors">{party.name}</p>
                                        <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mt-0.5">{party.type}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-base font-black ${party.outstanding_balance < 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {formatCurrency(Math.abs(party.outstanding_balance))}
                                    </p>
                                    <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest mt-1 block">
                                        {party.outstanding_balance < 0 ? 'Receivable' : 'Payable'}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {(!parties || parties.length === 0) && (
                            <div className="flex flex-col items-center justify-center py-10 opacity-30 text-center">
                                <History className="w-12 h-12 mb-3 text-zinc-300" />
                                <p className="text-[10px] font-black uppercase tracking-[.2em] text-zinc-400">No outstanding balances</p>
                            </div>
                        )}
                    </div>

                    <button className="w-full mt-10 py-5 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-white/10 text-zinc-400 font-black text-[10px] uppercase tracking-[.2em] hover:bg-zinc-50 dark:hover:bg-white/5 hover:border-orange-500/30 hover:text-orange-500 transition-all flex items-center justify-center gap-3">
                        <History className="w-4 h-4" />
                        View Full History
                    </button>
                </div>
            </div>

            {/* Modals */}
            <ManageInvoiceModal
                isOpen={isInvoiceModalOpen}
                onClose={() => setIsInvoiceModalOpen(false)}
                onSubmit={(data) => addInvoice.mutateAsync(data)}
            />
            <ManageExpenseModal
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                onSubmit={(data) => addExpense.mutateAsync(data)}
            />
        </div>
    )
}

function ManageInvoiceModal({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: (data: any) => Promise<any> }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        type: 'sales',
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        party_name: '',
        total_amount: 0,
        invoice_date: new Date().toISOString().split('T')[0],
        status: 'unpaid'
    })

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await onSubmit(formData)
            toast.success('Invoice generated successfully')
            onClose()
        } catch (error) {
            toast.error('Failed to generate invoice')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-white/40 dark:bg-black/60 backdrop-blur-md" onClick={onClose} />
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-white/10 w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 p-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase text-foreground">New Invoice</h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-colors"><X className="w-6 h-6 text-zinc-400 hover:text-orange-500" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[.2em] ml-1">Type</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all appearance-none"
                            >
                                <option value="sales" className="bg-white dark:bg-zinc-900 text-foreground">Sales (Credit)</option>
                                <option value="purchase" className="bg-white dark:bg-zinc-900 text-foreground">Purchase (Debit)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[.2em] ml-1">Invoice #</label>
                            <input
                                required
                                value={formData.invoice_number}
                                onChange={e => setFormData({ ...formData, invoice_number: e.target.value })}
                                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-zinc-300"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[.2em] ml-1">Party / Customer Name</label>
                        <input
                            required
                            value={formData.party_name}
                            onChange={e => setFormData({ ...formData, party_name: e.target.value })}
                            className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-zinc-300"
                            placeholder="e.g. Swiggy, Zomato, John Doe"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[.2em] ml-1">Total Amount</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">₹</span>
                                <input
                                    type="number"
                                    required
                                    value={formData.total_amount}
                                    onChange={e => setFormData({ ...formData, total_amount: Number(e.target.value) })}
                                    className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl pl-10 pr-5 py-4 text-sm font-black focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[.2em] ml-1">Date</label>
                            <input
                                type="date"
                                required
                                value={formData.invoice_date}
                                onChange={e => setFormData({ ...formData, invoice_date: e.target.value })}
                                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                            />
                        </div>
                    </div>
                    <button
                        disabled={isSubmitting}
                        className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-black py-5 rounded-2xl mt-4 shadow-xl shadow-orange-600/20 active:scale-95 transition-all text-[10px] uppercase tracking-[.3em] flex items-center justify-center gap-3"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Generate Invoice</>}
                    </button>
                </form>
            </div>
        </div>
    )
}

function ManageExpenseModal({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: (data: any) => Promise<any> }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        category: 'Rent',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        description: '',
        payment_method: 'cash'
    })

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await onSubmit(formData)
            toast.success('Expense logged successfully')
            onClose()
        } catch (error) {
            toast.error('Failed to log expense')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-white/40 dark:bg-black/60 backdrop-blur-md" onClick={onClose} />
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-white/10 w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 p-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase text-foreground">Log Expense</h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-colors"><X className="w-6 h-6 text-zinc-400 hover:text-orange-500" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[.2em] ml-1">Category</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all appearance-none"
                            >
                                {['Rent', 'Electricity', 'Marketing', 'Inventory', 'Salaries', 'Other'].map(cat => (
                                    <option key={cat} value={cat} className="bg-white dark:bg-zinc-900 text-foreground">{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[.2em] ml-1">Payment</label>
                            <select
                                value={formData.payment_method}
                                onChange={e => setFormData({ ...formData, payment_method: e.target.value as any })}
                                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all appearance-none"
                            >
                                <option value="cash" className="bg-white dark:bg-zinc-900 text-foreground">Cash</option>
                                <option value="bank" className="bg-white dark:bg-zinc-900 text-foreground">Bank Transfer</option>
                                <option value="upi" className="bg-white dark:bg-zinc-900 text-foreground">UPI / Online</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[.2em] ml-1">Amount</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">₹</span>
                                <input
                                    type="number"
                                    required
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                                    className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl pl-10 pr-5 py-4 text-sm font-black focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[.2em] ml-1">Date</label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[.2em] ml-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all min-h-[100px] resize-none placeholder:text-zinc-300"
                            placeholder="What was this expense for?"
                        />
                    </div>
                    <button
                        disabled={isSubmitting}
                        className="w-full bg-zinc-900 hover:bg-black disabled:opacity-50 text-white font-black py-5 rounded-2xl mt-4 shadow-xl shadow-black/10 active:scale-95 transition-all text-[10px] uppercase tracking-[.3em] flex items-center justify-center gap-3"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShoppingCart className="w-5 h-5" /> Log Business Expense</>}
                    </button>
                </form>
            </div>
        </div>
    )
}
