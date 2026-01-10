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
        { label: 'Total Revenue', value: `₹${statsData?.totalRevenue?.toLocaleString() || '0.00'}`, icon: TrendingUp, color: 'text-emerald-600', trend: 'Monthly', requiredPlan: 'pro' },
        { label: 'Active Orders', value: statsData?.activeOrders.toString() || '0', icon: ShoppingBag, color: 'text-orange-600', trend: 'Live' },
        { label: 'Total Orders', value: statsData?.totalOrders.toString() || '0', icon: Users, color: 'text-blue-600', trend: 'Overall' },
        { label: 'Menu Items', value: statsData?.menuItemsCount.toString() || '0', icon: Coffee, color: 'text-purple-600', trend: 'Active' },
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white italic tracking-tighter uppercase">Intelligence Command</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Detailed statistics and real-time performance of your TableTap terminal.</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full border border-zinc-200 dark:border-white/5 shadow-sm uppercase tracking-widest italic">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    System Live
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
                        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 p-8 rounded-[2.5rem] hover:border-orange-500/30 transition-all group relative overflow-hidden shadow-sm h-full">
                            <div className="flex items-center justify-between mb-8">
                                <div className={`p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 ${stat.color.replace('text-', 'bg-').replace('600', '600/10')} border border-zinc-200 dark:border-white/5 shadow-sm group-hover:scale-110 transition-transform`}>
                                    <stat.icon className={`w-7 h-7 ${stat.color} dark:text-zinc-100`} />
                                </div>
                                <div className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border ${stat.trend === 'Live' ? 'bg-orange-600/10 text-orange-600 border-orange-600/10' : 'bg-emerald-600/10 text-emerald-600 border-emerald-600/10'
                                    }`}>
                                    {stat.trend}
                                </div>
                            </div>
                            <div>
                                <p className="text-zinc-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                                <p className="text-3xl font-black mt-2 tracking-tighter text-zinc-900 dark:text-white italic group-hover:translate-x-1 transition-transform duration-300">{stat.value}</p>
                            </div>
                        </div>
                    </FeatureGuard>
                ))}
            </div>

            {/* Charts / Activity Placeholders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 p-8 rounded-[2.5rem] min-h-[450px] flex flex-col group relative shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">Revenue Analysis</h3>
                            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-1">Intelligence performance dataset</p>
                        </div>
                        <button className="text-zinc-400 dark:text-zinc-500 hover:text-orange-600 dark:hover:text-orange-500 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all italic">
                            FULL REPORT <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex-1 min-h-[350px]">
                        <FeatureGuard mode="blur" featureName="Revenue Analytics">
                            {statsData?.chartData && <RevenueChart data={statsData.chartData} />}
                        </FeatureGuard>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 p-8 rounded-[2.5rem] min-h-[450px] flex flex-col group shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">Live Orders</h3>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-orange-600/10 text-orange-600 px-4 py-2 rounded-xl border border-orange-600/10 italic">Live Stream</span>
                    </div>
                    <div className="flex-1 space-y-6">
                        {statsData?.recentOrders.map((order: any) => (
                            <div key={order.id} className="flex items-center gap-5 p-3 rounded-[1.5rem] hover:bg-zinc-50 dark:hover:bg-white/[0.05] border border-transparent hover:border-zinc-100 dark:hover:border-white/5 transition-all group/item">
                                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex flex-col items-center justify-center border border-zinc-200 dark:border-white/5 shadow-sm group-hover/item:scale-110 transition-transform">
                                    <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-500">T</span>
                                    <span className="text-lg font-black text-zinc-900 dark:text-white italic leading-none">{order.table_number}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase italic tracking-tight">{order.customer_name || 'Anonymous Protocol'}</p>
                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest mt-0.5">{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-zinc-900 dark:text-white italic">₹{Number(order.total_amount).toLocaleString()}</p>
                                    <p className={`text-[8px] uppercase font-black tracking-[0.2em] mt-1 ${order.status === 'pending' ? 'text-orange-600' :
                                        order.status === 'preparing' ? 'text-blue-600' :
                                            order.status === 'completed' ? 'text-emerald-600' : 'text-rose-600'
                                        }`}>{order.status}</p>
                                </div>
                            </div>
                        ))}
                        {statsData?.recentOrders.length === 0 && (
                            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 opacity-20 py-20">
                                <ShoppingBag className="w-16 h-16 mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Intelligence Flux</p>
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
