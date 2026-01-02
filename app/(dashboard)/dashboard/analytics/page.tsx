'use client'

import { TrendingUp, ShoppingCart, Users, DollarSign, Loader2 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import CafeGuard from '@/components/dashboard/CafeGuard'
import { useStats } from '@/hooks/useStats'
import { useCafe } from '@/hooks/useCafe'

function AnalyticsContent() {
    const { cafe } = useCafe()
    const { data: statsData, isLoading } = useStats(cafe?.id)

    if (isLoading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-zinc-500 text-sm animate-pulse">Analyzing your cafe's performance...</p>
            </div>
        )
    }

    const avgOrder = statsData?.totalOrders ? (statsData.totalRevenue / statsData.totalOrders) : 0

    const stats = [
        { label: 'Revenue', value: `$${statsData?.totalRevenue.toFixed(2) || '0.00'}`, icon: DollarSign, color: 'text-emerald-500', trend: 'Total' },
        { label: 'Total Orders', value: statsData?.totalOrders.toString() || '0', icon: ShoppingCart, color: 'text-orange-500', trend: 'Total' },
        { label: 'Active Orders', value: statsData?.activeOrders.toString() || '0', icon: Users, color: 'text-blue-500', trend: 'Live' },
        { label: 'Avg Order', value: `$${avgOrder.toFixed(2)}`, icon: TrendingUp, color: 'text-purple-500', trend: 'Calculated' },
    ]

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                <p className="text-zinc-500 mt-1">Discover insights about your cafe's performance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/[0.07] transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-black/40 ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-zinc-400 text-sm font-medium">{stat.label}</p>
                        <p className="text-2xl font-bold mt-1 tracking-tight">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl h-[450px] flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold">Revenue Trend</h3>
                        <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Last 7 Days</span>
                    </div>
                    <div className="flex-1 -ml-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={statsData?.chartData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }}
                                    itemStyle={{ color: '#f97316' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#f97316" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl h-[450px] flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold">Order Volume</h3>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-orange-500" />
                                <span className="text-[10px] text-zinc-500 font-bold uppercase">Orders</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 -ml-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statsData?.chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }}
                                    cursor={{ fill: '#ffffff05' }}
                                />
                                <Bar dataKey="orders" fill="#f97316" radius={[4, 4, 0, 0]} barSize={32} />
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
            <AnalyticsContent />
        </CafeGuard>
    )
}
