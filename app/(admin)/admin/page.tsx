'use client'

import { useAdminStats } from '@/hooks/useAdminStats'
import {
    Loader2, Store, BadgeCheck, Users,
    DollarSign, TrendingUp, BarChart3,
    ArrowUpRight, ShieldAlert
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

import { useState } from 'react'

function AdminDashboard() {
    const [selectedCafeId, setSelectedCafeId] = useState<string>('all')
    const { data: stats, isLoading } = useAdminStats('month', undefined, selectedCafeId === 'all' ? undefined : selectedCafeId)

    const platformStats = [
        { label: 'Total Cafes', value: stats?.totalCafes || 0, icon: Store, color: 'text-orange-500', trend: 'Total' },
        { label: 'Pro Plans', value: stats?.proCafes || 0, icon: BadgeCheck, color: 'text-purple-500', trend: 'Premium' },
        { label: 'Subscription Revenue', value: `$${stats?.subscriptionRevenue?.toLocaleString() || '0'}`, icon: DollarSign, color: 'text-emerald-500', trend: 'Monthly' },
        { label: 'Platform GMV', value: `$${stats?.totalRevenue?.toFixed(2) || '0.00'}`, icon: Users, color: 'text-blue-500', trend: 'Order Volume' },
    ]

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                <p className="text-zinc-500 animate-pulse text-sm font-medium">Syncing platform control center...</p>
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <ShieldAlert className="w-10 h-10 text-red-500" />
                <p className="text-zinc-500 text-sm font-medium">Failed to sync platform metrics.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-xl font-bold text-sm"
                >
                    Retry Connection
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    <h2 className="text-2xl font-black text-foreground tracking-tight">Overview</h2>
                    <p className="text-zinc-500 text-sm font-medium">Platform-wide performance benchmarks.</p>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-white/5 p-1.5 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm">
                    <div className="pl-3">
                        <Store className="w-4 h-4 text-zinc-400" />
                    </div>
                    <select
                        value={selectedCafeId}
                        onChange={(e) => setSelectedCafeId(e.target.value)}
                        className="bg-transparent text-sm font-bold text-foreground focus:outline-none pr-4 min-w-[200px] cursor-pointer"
                    >
                        <option value="all" className="bg-white dark:bg-zinc-900 text-foreground">All Cafes (Global)</option>
                        {stats?.cafes?.map(cafe => (
                            <option key={cafe.id} value={cafe.id} className="bg-white dark:bg-zinc-900 text-foreground">
                                {cafe.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {platformStats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl hover:bg-zinc-50 dark:hover:bg-white/[0.07] transition-all shadow-sm dark:shadow-none group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-zinc-100 dark:bg-black/40 ${stat.color.replace('text-', 'bg-').replace('500', '500/10')} dark:bg-transparent transition-colors`}>
                                <stat.icon className={`w-6 h-6 ${stat.color} group-hover:scale-110 transition-transform`} />
                            </div>
                            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">{stat.label}</p>
                        <p className="text-2xl font-bold mt-1 tracking-tight text-foreground">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Growth Chart */}
                <div className="xl:col-span-2 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-6 md:p-8 rounded-3xl min-h-[350px] md:h-[400px] flex flex-col shadow-sm dark:shadow-none relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-6 md:mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-purple-500" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">Platform Growth</h3>
                        </div>
                    </div>
                    <div className="flex-1 -ml-4 md:-ml-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.chartData}>
                                <defs>
                                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }}
                                    itemStyle={{ color: '#a855f7' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#a855f7" fillOpacity={1} fill="url(#colorGrowth)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Platform Status Card */}
                <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-6 md:p-8 rounded-2xl hover:bg-zinc-50 dark:hover:bg-white/[0.07] transition-all shadow-sm dark:shadow-none flex flex-col justify-between min-h-[350px] md:h-[400px]">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-orange-500/10">
                                    <BarChart3 className="w-6 h-6 text-orange-500" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">Platform Status</h3>
                            </div>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] bg-emerald-500/10 px-3 py-1.5 rounded-full">
                                Active
                            </span>
                        </div>

                        <div className="space-y-4">
                            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                                Operational oversight for <span className="text-foreground font-bold">{stats?.totalCafes} active cafes</span>.
                                Strategic Pro adoption is at <span className="text-orange-500 font-bold">{stats?.totalCafes ? Math.round((stats.proCafes / stats.totalCafes) * 100) : 0}%</span>.
                            </p>

                            <div className="pt-4 border-t border-zinc-200 dark:border-white/10 space-y-3">
                                <div className="flex items-center justify-between text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">
                                    <span>Pro Tier Performance</span>
                                </div>
                                <div className="flex items-center justify-between p-5 bg-zinc-50 dark:bg-black/20 rounded-xl border border-zinc-200 dark:border-white/5">
                                    <div className="space-y-1">
                                        <span className="text-zinc-500 dark:text-zinc-400 text-xs font-medium">Net Subscription Revenue</span>
                                        <div className="text-3xl font-bold tracking-tight text-foreground">
                                            ${stats?.subscriptionRevenue?.toLocaleString() || '0'}
                                        </div>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <ArrowUpRight className="w-6 h-6 text-emerald-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="w-full mt-6 py-3.5 bg-orange-500 text-white font-bold text-sm rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98]">
                        Access Reports
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function AdminPage() {
    return <AdminDashboard />
}
