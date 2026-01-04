'use client'

import { useState } from 'react'
import { TrendingUp, ShoppingCart, Users, DollarSign, Loader2, ChevronLeft, ChevronRight, Calendar, Activity } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import CafeGuard from '@/components/dashboard/CafeGuard'
import FeatureGuard from '@/components/dashboard/FeatureGuard'
import { useStats } from '@/hooks/useStats'
import { useCafe } from '@/hooks/useCafe'
import { useAnalytics, ViewMode } from '@/hooks/useAnalytics'
import { format, addDays, subDays, addMonths, subMonths, addYears, subYears } from 'date-fns'

function AnalyticsContent() {
    const { cafe } = useCafe()
    const [viewMode, setViewMode] = useState<ViewMode>('month')
    const [currentDate, setCurrentDate] = useState(new Date())

    const { data: statsData, isLoading: isStatsLoading } = useStats(cafe?.id)
    const { data: analyticsData, isLoading: isAnalyticsLoading } = useAnalytics(cafe?.id, viewMode, currentDate)

    const isLoading = isStatsLoading || isAnalyticsLoading

    if (isLoading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-zinc-500 text-sm animate-pulse">Analyzing your cafe's performance...</p>
            </div>
        )
    }

    const avgOrder = analyticsData?.totalOrders ? (analyticsData.totalRevenue / analyticsData.totalOrders) : 0

    const stats = [
        { label: 'Revenue', value: `$${analyticsData?.totalRevenue.toFixed(2) || '0.00'}`, icon: DollarSign, color: 'text-emerald-500', trend: 'Period' },
        { label: 'Total Orders', value: analyticsData?.totalOrders.toString() || '0', icon: ShoppingCart, color: 'text-orange-500', trend: 'Period' },
        { label: 'Active Orders', value: statsData?.activeOrders.toString() || '0', icon: Users, color: 'text-blue-500', trend: 'Live' },
        { label: 'Avg Order', value: `$${avgOrder.toFixed(2)}`, icon: TrendingUp, color: 'text-purple-500', trend: 'Calculated' },
    ]

    const handlePrev = () => {
        if (viewMode === 'day') setCurrentDate(d => subDays(d, 1))
        if (viewMode === 'month') setCurrentDate(d => subMonths(d, 1))
        if (viewMode === 'year') setCurrentDate(d => subYears(d, 1))
    }

    const handleNext = () => {
        if (viewMode === 'day') setCurrentDate(d => addDays(d, 1))
        if (viewMode === 'month') setCurrentDate(d => addMonths(d, 1))
        if (viewMode === 'year') setCurrentDate(d => addYears(d, 1))
    }

    const getDateLabel = () => {
        if (viewMode === 'day') return format(currentDate, 'MMMM d, yyyy')
        if (viewMode === 'month') return format(currentDate, 'MMMM yyyy')
        if (viewMode === 'year') return format(currentDate, 'yyyy')
        return ''
    }

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics</h1>
                    <p className="text-zinc-500 mt-1">Discover insights about your cafe's performance.</p>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-1.5 rounded-xl border border-zinc-200 dark:border-white/10 shadow-sm">
                    <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                        {(['day', 'month', 'year'] as ViewMode[]).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${viewMode === mode
                                    ? 'bg-white dark:bg-black text-foreground shadow-sm'
                                    : 'text-zinc-500 hover:text-foreground'
                                    }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-white/10">
                        <button
                            onClick={handlePrev}
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4 text-zinc-500" />
                        </button>
                        <div className="flex items-center gap-2 min-w-[140px] justify-center">
                            <Calendar className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium text-foreground">{getDateLabel()}</span>
                        </div>
                        <button
                            onClick={handleNext}
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                        >
                            <ChevronRight className="w-4 h-4 text-zinc-500" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl hover:bg-zinc-50 dark:hover:bg-white/[0.07] transition-all shadow-sm dark:shadow-none">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-zinc-100 dark:bg-black/40 ${stat.color.replace('text-', 'bg-').replace('500', '500/10')} dark:bg-transparent`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">{stat.label}</p>
                        <p className="text-2xl font-bold mt-1 tracking-tight text-foreground">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-8 rounded-3xl h-[450px] flex flex-col shadow-sm dark:shadow-none">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-foreground">Revenue Trend</h3>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest">
                            {viewMode === 'day' ? 'Hourly' : viewMode === 'month' ? 'Daily' : 'Monthly'}
                        </span>
                    </div>
                    <div className="flex-1 -ml-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analyticsData?.chartData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }}
                                    itemStyle={{ color: '#f97316' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#f97316" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Selling Items */}
                <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-8 rounded-3xl h-[450px] flex flex-col shadow-sm dark:shadow-none">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-foreground">Top Selling Items</h3>
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <TrendingUp className="w-4 h-4 text-purple-500" />
                        </div>
                    </div>
                    <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                        {analyticsData?.topItems?.map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-black/20 rounded-2xl border border-zinc-100 dark:border-white/5 hover:border-orange-500/20 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold">
                                        #{i + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground group-hover:text-orange-500 transition-colors uppercase text-sm">{item.name}</p>
                                        <p className="text-xs text-zinc-500">{item.quantity} units sold</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-foreground">${item.revenue.toFixed(2)}</p>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">Revenue</p>
                                </div>
                            </div>
                        ))}
                        {(!analyticsData?.topItems || analyticsData.topItems.length === 0) && (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2 opacity-50">
                                <ShoppingCart className="w-8 h-8" />
                                <p className="text-sm font-medium">No sales data yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Status Distribution */}
                <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-8 rounded-3xl h-[450px] flex flex-col shadow-sm dark:shadow-none">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-foreground">Order Status</h3>
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Activity className="w-4 h-4 text-blue-500" />
                        </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analyticsData?.statusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {analyticsData?.statusDistribution?.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#18181b',
                                        border: '1px solid #ffffff10',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        padding: '8px 12px'
                                    }}
                                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-4xl font-black text-foreground">{analyticsData?.totalOrders}</span>
                            <span className="text-[10px] uppercase font-black text-orange-500 tracking-[0.2em] -mt-1">Orders</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        {analyticsData?.statusDistribution?.map((item: any, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">{item.name}: {item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Table Performance */}
                <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-8 rounded-3xl h-[450px] flex flex-col shadow-sm dark:shadow-none">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-foreground">Table Performance</h3>
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Users className="w-4 h-4 text-emerald-500" />
                        </div>
                    </div>
                    <div className="flex-1 -ml-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analyticsData?.tablePerformance}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                                <XAxis dataKey="table" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }}
                                    cursor={{ fill: '#ffffff05' }}
                                />
                                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function AnalyticsPage() {
    return (
        <CafeGuard>
            <FeatureGuard requiredPlan="pro" featureName="Analytics" mode="blur">
                <AnalyticsContent />
            </FeatureGuard>
        </CafeGuard>
    )
}
