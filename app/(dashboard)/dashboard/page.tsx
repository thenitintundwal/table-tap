'use client'

import { TrendingUp, ShoppingBag, Users, Coffee, ArrowUpRight, Loader2 } from 'lucide-react'
import CafeGuard from '@/components/dashboard/CafeGuard'
import { useStats } from '@/hooks/useStats'
import { useCafe } from '@/hooks/useCafe'
import { formatDistanceToNow } from 'date-fns'
import RevenueChart from '@/components/dashboard/RevenueChart'
import FeatureGuard from '@/components/dashboard/FeatureGuard'

function DashboardContent() {
    const { cafe } = useCafe()
    const { data: statsData, isLoading } = useStats(cafe?.id)

    const stats = [
        { label: 'Total Revenue', value: `$${statsData?.totalRevenue?.toFixed(2) || '0.00'}`, icon: TrendingUp, color: 'text-emerald-500', trend: 'Monthly', requiredPlan: 'pro' },
        { label: 'Active Orders', value: statsData?.activeOrders.toString() || '0', icon: ShoppingBag, color: 'text-orange-500', trend: 'Live' },
        { label: 'Total Orders', value: statsData?.totalOrders.toString() || '0', icon: Users, color: 'text-blue-500', trend: 'Overall' },
        { label: 'Menu Items', value: statsData?.menuItemsCount.toString() || '0', icon: Coffee, color: 'text-purple-500', trend: 'Active' },
    ]

    if (isLoading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-zinc-500 text-sm animate-pulse">Gathering insights...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
                    <p className="text-zinc-500 mt-1">Detailed statistics and performance of your cafe.</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    SYSTEM LIVE
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <FeatureGuard
                        key={i}
                        mode="blur"
                        minimal={true}
                        requiredPlan={stat.requiredPlan as any || 'basic'}
                        featureName={stat.label}
                    >
                        <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl hover:bg-zinc-50 dark:hover:bg-white/[0.07] transition-all group relative overflow-hidden shadow-sm dark:shadow-none h-full">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-zinc-100 dark:bg-black/40 ${stat.color.replace('text-', 'bg-').replace('500', '500/10')} dark:bg-transparent`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <div className={`text-xs font-medium px-2 py-1 rounded-full bg-zinc-100 dark:bg-white/5 ${stat.trend === 'Live' ? 'text-orange-600 dark:text-orange-500' : 'text-emerald-600 dark:text-emerald-500'
                                    }`}>
                                    {stat.trend}
                                </div>
                            </div>
                            <div>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">{stat.label}</p>
                                <p className="text-2xl font-bold mt-1 tracking-tight text-foreground">{stat.value}</p>
                            </div>
                            {/* Hover bar */}
                            <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent`} />
                        </div>
                    </FeatureGuard>
                ))}
            </div>

            {/* Charts / Activity Placeholders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-8 rounded-3xl min-h-[400px] flex flex-col group relative shadow-sm dark:shadow-none">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-semibold text-foreground">Revenue Analytics</h3>
                        <button className="text-zinc-500 dark:text-zinc-400 hover:text-foreground flex items-center gap-1 text-sm transition-colors">
                            View Report <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                        <FeatureGuard mode="blur" featureName="Revenue Analytics">
                            {statsData?.chartData && <RevenueChart data={statsData.chartData} />}
                        </FeatureGuard>
                    </div>
                </div>

                <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-8 rounded-3xl min-h-[400px] flex flex-col group shadow-sm dark:shadow-none">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-semibold text-foreground">Recent Orders</h3>
                        <span className="text-xs bg-orange-500/10 text-orange-600 dark:text-orange-500 px-2 py-1 rounded-lg">Real-time</span>
                    </div>
                    <div className="flex-1 space-y-4">
                        {statsData?.recentOrders.map((order: any) => (
                            <div key={order.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-white/5 cursor-pointer">
                                <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-xs font-bold text-zinc-500 dark:text-zinc-400">
                                    T{order.table_number}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">{order.customer_name || 'Anonymous'}</p>
                                    <p className="text-xs text-zinc-500">{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-foreground">${Number(order.total_amount).toFixed(2)}</p>
                                    <p className={`text-[10px] uppercase font-bold ${order.status === 'pending' ? 'text-orange-500' :
                                        order.status === 'preparing' ? 'text-blue-500' :
                                            order.status === 'completed' ? 'text-emerald-500' : 'text-red-500'
                                        }`}>{order.status}</p>
                                </div>
                            </div>
                        ))}
                        {statsData?.recentOrders.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-500 dark:text-zinc-600 opacity-50">
                                <ShoppingBag className="w-8 h-8 mb-2" />
                                <p className="text-sm">No recent orders</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

import { useAdmin } from '@/hooks/useAdmin'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
    const { isAdmin, isLoading: isAdminLoading } = useAdmin()
    const router = useRouter()

    useEffect(() => {
        if (!isAdminLoading && isAdmin) {
            router.push('/admin')
        }
    }, [isAdmin, isAdminLoading, router])

    if (isAdminLoading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-zinc-500 text-sm animate-pulse">Checking permissions...</p>
            </div>
        )
    }

    if (isAdmin) return null

    return (
        <CafeGuard>
            <DashboardContent />
        </CafeGuard>
    )
}
