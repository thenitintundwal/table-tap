'use client'

import { useState } from 'react'
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
    CircleDot
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

export default function InvoiceDashboard() {
    const { cafe } = useCafe()
    const { metrics, trendData, isMetricsLoading, isTrendLoading } = useAccounts(cafe?.id)
    const [activeTab, setActiveTab] = useState('Sales')

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

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Invoices & Accounts</h1>
                    <p className="text-zinc-500 mt-1 font-medium text-sm">Comprehensive billing, purchase, and accounts intelligence.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl p-1 shadow-sm">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-zinc-500">
                            <Calendar className="w-3 h-3" />
                            OCTOBER 2024
                        </div>
                    </div>
                    <button className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg shadow-orange-600/20 transition-all flex items-center gap-2 active:scale-95 uppercase tracking-wide">
                        <Plus className="w-4 h-4" />
                        Add Invoice
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl hover:bg-zinc-50 dark:hover:bg-white/[0.07] transition-all group relative overflow-hidden shadow-sm dark:shadow-none">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-zinc-100 dark:bg-black/40 ${stat.bgColor} dark:bg-transparent`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trend Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-sm dark:shadow-none min-h-[450px] flex flex-col">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">Financial Trends</h3>
                            <p className="text-xs text-zinc-500">Tracking Sales vs Purchase vs Expense</p>
                        </div>
                        <div className="flex items-center gap-2 p-1 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/10">
                            {['Sales', 'Purchase', 'Expense'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab
                                            ? 'bg-white dark:bg-white/10 text-orange-500 shadow-sm border border-zinc-200 dark:border-white/10'
                                            : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
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
                                        backgroundColor: 'var(--background)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border)',
                                        fontSize: '12px'
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
                <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-sm dark:shadow-none flex flex-col">
                    <h3 className="text-lg font-semibold text-foreground mb-6">Financial Summary</h3>

                    <div className="space-y-4 flex-1">
                        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-black/20 border border-zinc-100 dark:border-white/5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-zinc-500 uppercase">Gross Revenue</span>
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                            </div>
                            <p className="text-xl font-bold text-foreground">{formatCurrency(metrics?.totalSales || 0)}</p>
                        </div>

                        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-black/20 border border-zinc-100 dark:border-white/5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-zinc-500 uppercase">Total Expenses</span>
                                <TrendingDown className="w-4 h-4 text-rose-500" />
                            </div>
                            <p className="text-xl font-bold text-foreground">{formatCurrency(metrics?.totalPurchase || 0)}</p>
                        </div>

                        <div className="p-5 rounded-2xl bg-orange-500/5 border border-orange-500/10 mt-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                <PieChartIcon className="w-12 h-12 text-orange-500" />
                            </div>
                            <span className="text-xs font-bold text-orange-600 dark:text-orange-500 uppercase tracking-wider">Estimated Net Profit</span>
                            <p className="text-3xl font-bold text-orange-600 dark:text-orange-500 mt-2 tracking-tighter">
                                {formatCurrency((metrics?.totalSales || 0) - (metrics?.totalPurchase || 0))}
                            </p>
                        </div>
                    </div>

                    <button className="w-full mt-6 py-3 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-500 font-bold text-xs uppercase tracking-widest hover:bg-orange-500/20 transition-all">
                        Generate Detailed P&L
                    </button>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
                {/* Sales Conversion Bar Chart */}
                <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-sm dark:shadow-none">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-semibold">Sales Projection</h3>
                        <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 dark:bg-white/5 px-2 py-1 rounded-lg">LAST 10 DAYS</span>
                    </div>

                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData?.slice(-10) || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-zinc-100 dark:text-white/5" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10, fontWeight: 500 }} tickFormatter={(val) => format(new Date(val), 'd MMM')} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10, fontWeight: 500 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)' }} />
                                <Bar dataKey="sales" fill="#f97316" radius={[6, 6, 0, 0]} name="Actual Sales" barSize={30} />
                                <Bar dataKey="expense" fill="currentColor" className="text-zinc-200 dark:text-white/10" radius={[6, 6, 0, 0]} name="Budget" barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Receivables List */}
                <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-sm dark:shadow-none flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-semibold">Outstanding Balances</h3>
                        <button className="text-zinc-500 hover:text-orange-500 text-xs font-bold transition-colors">SEE ALL</button>
                    </div>

                    <div className="space-y-3 flex-1">
                        {[
                            { name: 'Swiggy/Zomato Returns', amount: 12560, status: 'pending', color: 'text-orange-500' },
                            { name: 'Organic Produce (Vendor)', amount: 4500, status: 'payable', color: 'text-rose-500' },
                            { name: 'Corporate Events (HDFC)', amount: 35000, status: 'received', color: 'text-emerald-500' },
                        ].map((party, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-white/5 hover:border-zinc-200 dark:hover:border-white/10 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-white/5 flex items-center justify-center font-bold text-zinc-500">
                                        {party.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{party.name}</p>
                                        <p className="text-[10px] text-zinc-500 uppercase font-black">{party.status}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-bold ${party.color}`}>
                                        {party.status === 'received' ? '+' : '-'} {formatCurrency(party.amount)}
                                    </p>
                                    <ArrowRight className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-6 py-4 rounded-xl border-2 border-dashed border-zinc-200 dark:border-white/10 text-zinc-500 font-bold text-xs uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                        <History className="w-4 h-4" />
                        View Archive
                    </button>
                </div>
            </div>
        </div>
    )
}
