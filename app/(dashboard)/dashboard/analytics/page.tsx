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
import { useTheme } from 'next-themes'

function AnalyticsContent() {
    const { cafe } = useCafe()
    const [viewMode, setViewMode] = useState<ViewMode>('month')
    const [currentDate, setCurrentDate] = useState(new Date())
    const { theme } = useTheme()
    const isDark = theme === 'dark'

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
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white italic tracking-tighter uppercase flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-500" />
                        Analytics
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Discover insights about your cafe's performance.</p>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-zinc-900/50 p-2 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm">
                    <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
                        {(['day', 'month', 'year'] as ViewMode[]).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === mode
                                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-lg'
                                    : 'text-zinc-500 hover:text-orange-500'
                                    }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 pl-4 border-l border-zinc-200 dark:border-white/10">
                        <button
                            onClick={handlePrev}
                            className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all text-zinc-400 hover:text-orange-500"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-3 min-w-[160px] justify-center">
                            <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-500" />
                            <span className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">{getDateLabel()}</span>
                        </div>
                        <button
                            onClick={handleNext}
                            className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all text-zinc-400 hover:text-orange-500"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 p-6 rounded-3xl hover:bg-zinc-50 dark:hover:bg-white/[0.07] transition-all shadow-sm dark:shadow-none relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-orange-500/10 transition-all"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className={`p-3 rounded-2xl ${stat.color.replace('text-', 'bg-').replace('500', '500/10')} border border-current/10`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest relative z-10">{stat.label}</p>
                        <p className="text-3xl font-black mt-1 tracking-tighter text-zinc-900 dark:text-white relative z-10">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 p-8 rounded-[2.5rem] h-[450px] flex flex-col shadow-sm dark:shadow-none">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase italic">Revenue Trend</h3>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest">
                            {viewMode === 'day' ? 'Hourly' : viewMode === 'month' ? 'Daily' : 'Monthly'}
                        </span>
                    </div>
                    <div className="flex-1 -ml-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analyticsData?.chartData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isDark ? "#f97316" : "#ea580c"} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={isDark ? "#f97316" : "#ea580c"} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#ffffff05" : "#00000005"} />
                                <XAxis dataKey="name" stroke={isDark ? "#71717a" : "#a1a1aa"} fontSize={10} tickLine={false} axisLine={false} tick={{ fontWeight: 'bold' }} />
                                <YAxis stroke={isDark ? "#71717a" : "#a1a1aa"} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} tick={{ fontWeight: 'bold' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? '#18181b' : '#ffffff',
                                        border: isDark ? '1px solid #ffffff10' : '1px solid #00000005',
                                        borderRadius: '16px',
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                                    }}
                                    itemStyle={{ color: isDark ? '#f97316' : '#ea580c' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke={isDark ? "#f97316" : "#ea580c"} fillOpacity={1} fill="url(#colorRev)" strokeWidth={4} dot={{ fill: isDark ? "#f97316" : "#ea580c", r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Selling Items */}
                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 p-8 rounded-[2.5rem] h-[450px] flex flex-col shadow-sm dark:shadow-none">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase italic">Top Items</h3>
                        <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/10">
                            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-500" />
                        </div>
                    </div>
                    <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                        {analyticsData?.topItems?.map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-5 bg-zinc-50 dark:bg-black/20 rounded-3xl border border-zinc-100 dark:border-white/5 hover:border-orange-500/30 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-orange-400 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-orange-500/20">
                                        #{i + 1}
                                    </div>
                                    <div>
                                        <p className="font-black text-zinc-900 dark:text-white group-hover:text-orange-600 transition-colors uppercase text-sm tracking-tight">{item.name}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{item.quantity} units sold</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-zinc-900 dark:text-white tabular-nums">₹{item.revenue.toLocaleString()}</p>
                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest">Revenue</p>
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
                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 p-8 rounded-[2.5rem] h-[450px] flex flex-col shadow-sm dark:shadow-none">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase italic">Order Status</h3>
                        <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/10">
                            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-500" />
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
                                    paddingAngle={10}
                                    dataKey="value"
                                >
                                    {analyticsData?.statusDistribution?.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? '#18181b' : '#ffffff',
                                        border: isDark ? '1px solid #ffffff10' : '1px solid #00000005',
                                        borderRadius: '16px',
                                        fontSize: '10px',
                                        padding: '12px',
                                        fontWeight: 'bold',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                                    }}
                                    itemStyle={{ color: isDark ? '#fff' : '#18181b' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">{analyticsData?.totalOrders}</span>
                            <span className="text-[10px] uppercase font-black text-orange-600 dark:text-orange-500 tracking-[0.3em] -mt-1">Orders</span>
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
                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 p-8 rounded-[2.5rem] h-[450px] flex flex-col shadow-sm dark:shadow-none">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase italic">Table Performance</h3>
                        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/10">
                            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                        </div>
                    </div>
                    <div className="flex-1 -ml-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analyticsData?.tablePerformance}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#ffffff05" : "#00000005"} />
                                <XAxis dataKey="table" stroke={isDark ? "#71717a" : "#a1a1aa"} fontSize={10} tickLine={false} axisLine={false} tick={{ fontWeight: 'bold' }} />
                                <YAxis stroke={isDark ? "#71717a" : "#a1a1aa"} fontSize={10} tickLine={false} axisLine={false} tick={{ fontWeight: 'bold' }} tickFormatter={(value) => `₹${value}`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? '#18181b' : '#ffffff',
                                        border: isDark ? '1px solid #ffffff10' : '1px solid #00000005',
                                        borderRadius: '16px',
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                                    }}
                                    cursor={{ fill: isDark ? '#ffffff05' : '#00000005', radius: 8 }}
                                />
                                <Bar dataKey="revenue" fill={isDark ? "#10b981" : "#059669"} radius={[8, 8, 0, 0]} barSize={28} />
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
