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
                        <div className="bg-white dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 p-6 rounded-[2rem] hover:shadow-xl hover:shadow-black/5 transition-all group relative overflow-hidden shadow-sm shadow-black/5 h-full">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 ${stat.color.replace('text-', 'bg-').replace('500', '500/10')} dark:bg-transparent`}>
                                    <stat.icon className={`w-7 h-7 ${stat.color}`} />
                                </div>
                                <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${stat.trend === 'Live' ? 'bg-orange-500/10 text-orange-600' : 'bg-emerald-500/10 text-emerald-600'
                                    }`}>
                                    {stat.trend}
                                </div>
                            </div>
                            <div>
                                <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                                <p className="text-3xl font-black mt-2 tracking-tight text-foreground transition-transform group-hover:scale-105 origin-left duration-300">{stat.value}</p>
                            </div>
                        </div>
                    </FeatureGuard>
                ))}
            </div>

            {/* Charts / Activity Placeholders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                <div className="lg:col-span-2 bg-white dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 p-8 rounded-[2.5rem] min-h-[450px] flex flex-col group relative shadow-sm shadow-black/5">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-black text-foreground">Revenue Analytics</h3>
                            <p className="text-xs text-zinc-500 font-medium">Performance over time</p>
                        </div>
                        <button className="text-zinc-500 dark:text-zinc-400 hover:text-orange-500 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all">
                            View Report <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex-1 min-h-[350px]">
                        <FeatureGuard mode="blur" featureName="Revenue Analytics">
                            {statsData?.chartData && <RevenueChart data={statsData.chartData} />}
                        </FeatureGuard>
                    </div>
                </div>

                <div className="bg-white dark:bg-white/5 border border-zinc-200/50 dark:border-white/10 p-8 rounded-[2.5rem] min-h-[450px] flex flex-col group shadow-sm shadow-black/5">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-black text-foreground">Recent Orders</h3>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-orange-500/10 text-orange-600 px-3 py-1.5 rounded-full">Real-time</span>
                    </div>
                    <div className="flex-1 space-y-6">
                        {statsData?.recentOrders.map((order: any) => (
                            <div key={order.id} className="flex items-center gap-5 p-2 rounded-2xl hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors group/item">
                                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-xs font-black text-zinc-500 group-hover/item:bg-white group-hover/item:shadow-sm transition-all">
                                    T{order.table_number}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-foreground">{order.customer_name || 'Anonymous'}</p>
                                    <p className="text-[10px] text-zinc-400 font-medium">{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-foreground">${Number(order.total_amount).toFixed(2)}</p>
                                    <p className={`text-[10px] uppercase font-black tracking-widest ${order.status === 'pending' ? 'text-orange-500' :
                                        order.status === 'preparing' ? 'text-blue-500' :
                                            order.status === 'completed' ? 'text-emerald-500' : 'text-red-500'
                                        }`}>{order.status}</p>
                                </div>
                            </div>
                        ))}
                        {statsData?.recentOrders.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-500 dark:text-zinc-600 opacity-50">
                                <ShoppingBag className="w-12 h-12 mb-3" />
                                <p className="text-sm font-bold uppercase tracking-widest">No recent orders</p>
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
