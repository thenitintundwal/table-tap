'use client'

import { useAdminStats } from '@/hooks/useAdminStats'
import {
    Loader2, TrendingUp, BarChart3,
    Activity, PieChart as PieChartIcon,
    Calendar, Users, Store
} from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar,
    PieChart, Pie, Cell
} from 'recharts'

import { ViewMode } from '@/hooks/useAdminStats'
import { useState } from 'react'

function PlatformAnalytics() {
    const [viewMode, setViewMode] = useState<ViewMode>('month')
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedCafeId, setSelectedCafeId] = useState<string>('all')

    const { data: stats, isLoading } = useAdminStats(
        viewMode,
        currentDate,
        selectedCafeId === 'all' ? undefined : selectedCafeId
    )

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                <p className="text-zinc-500 animate-pulse text-sm font-medium">Compiling platform analytics...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header with Switcher & Selector */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Platform Analytics</h1>
                    <p className="text-zinc-500 mt-1 font-medium">Cross-cafe performance and platform growth metrics.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Cafe Selector */}
                    <div className="flex items-center gap-3 bg-white dark:bg-white/5 p-1.5 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm">
                        <div className="pl-3">
                            <Store className="w-4 h-4 text-zinc-400" />
                        </div>
                        <select
                            value={selectedCafeId}
                            onChange={(e) => setSelectedCafeId(e.target.value)}
                            className="bg-transparent text-sm font-bold text-foreground focus:outline-none pr-4 min-w-[160px] cursor-pointer"
                        >
                            <option value="all" className="bg-white dark:bg-zinc-900 text-foreground">All Cafes (Platform)</option>
                            {stats?.cafes?.map(cafe => (
                                <option key={cafe.id} value={cafe.id} className="bg-white dark:bg-zinc-900 text-foreground">
                                    {cafe.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
                        <div className="flex bg-black/40 rounded-xl p-1 gap-1">
                            {(['day', 'month', 'year'] as ViewMode[]).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === mode
                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                        : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Platform Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl">
                    <p className="text-zinc-500 text-sm font-medium">Subscription Revenue</p>
                    <p className="text-2xl font-black mt-1 tracking-tight text-foreground">${stats?.subscriptionRevenue?.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl">
                    <p className="text-zinc-500 text-sm font-medium">Platform GMV</p>
                    <p className="text-2xl font-black mt-1 tracking-tight text-foreground">${stats?.totalRevenue?.toFixed(2)}</p>
                </div>
                <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl">
                    <p className="text-zinc-500 text-sm font-medium">Period Orders</p>
                    <p className="text-2xl font-black mt-1 tracking-tight text-foreground">{stats?.totalOrders}</p>
                </div>
                <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl">
                    <p className="text-zinc-500 text-sm font-medium">Total Cafes</p>
                    <p className="text-2xl font-black mt-1 tracking-tight text-foreground">{stats?.totalCafes}</p>
                </div>
                <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl">
                    <p className="text-zinc-500 text-sm font-medium">Pro Adoption</p>
                    <p className="text-2xl font-black mt-1 tracking-tight text-foreground">
                        {stats?.totalCafes ? Math.round((stats.proCafes / stats.totalCafes) * 100) : 0}%
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Trends */}
                <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-8 rounded-3xl h-[400px] flex flex-col shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Activity className="w-5 h-5 text-blue-500" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">Order Volume</h3>
                        </div>
                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{viewMode} View</div>
                    </div>
                    <div className="flex-1 -ml-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.orderTrendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                                <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }}
                                    itemStyle={{ color: '#3b82f6' }}
                                />
                                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={viewMode === 'day' ? 12 : 20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Plan Distribution */}
                <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-8 rounded-3xl h-[400px] flex flex-col shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <PieChartIcon className="w-5 h-5 text-purple-500" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">Subscription Mix</h3>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats?.planDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {stats?.planDistribution?.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-foreground">{stats?.totalCafes}</span>
                            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Total Cafes</span>
                        </div>
                    </div>
                    <div className="flex justify-center gap-8 mt-4">
                        {stats?.planDistribution?.map((item: any, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">{item.name}: {item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Platform Revenue Trends */}
            <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-8 rounded-3xl h-[400px] flex flex-col shadow-sm relative overflow-hidden group">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">Revenue Analytics</h3>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/10">
                        <Calendar className="w-4 h-4 text-zinc-400" />
                        <span className="text-xs font-bold text-zinc-500 uppercase">{viewMode} Growth</span>
                    </div>
                </div>
                <div className="flex-1 -ml-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats?.orderTrendData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                            <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }}
                                itemStyle={{ color: '#10b981' }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}

export default function AnalyticsPage() {
    return <PlatformAnalytics />
}
