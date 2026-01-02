'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

export function useStats(cafeId?: string) {
    return useQuery({
        queryKey: ['stats', cafeId],
        queryFn: async () => {
            if (!cafeId) return null

            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

            // Execute all queries in parallel for maximum speed
            const [
                revenueResult,
                activeResult,
                totalResult,
                menuResult,
                chartResult,
                recentResult
            ] = await Promise.all([
                // Efficiently get revenue (only statuses that matter)
                supabase.from('orders').select('total_amount').eq('cafe_id', cafeId).eq('status', 'completed'),
                // Exact counts for stats cards
                supabase.from('orders').select('*', { count: 'exact', head: true }).eq('cafe_id', cafeId).in('status', ['pending', 'preparing']),
                supabase.from('orders').select('*', { count: 'exact', head: true }).eq('cafe_id', cafeId),
                supabase.from('menu_items').select('*', { count: 'exact', head: true }).eq('cafe_id', cafeId),
                // Data for charts
                supabase.from('orders').select('created_at, total_amount, status').eq('cafe_id', cafeId).gte('created_at', sevenDaysAgo.toISOString()).order('created_at', { ascending: true }),
                // Recent activity list
                supabase.from('orders').select('*').eq('cafe_id', cafeId).order('created_at', { ascending: false }).limit(5)
            ])

            const totalRevenue = revenueResult.data?.reduce((sum, o: any) => sum + Number(o.total_amount), 0) || 0

            // Aggregate chart data
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            const dailyStats = Array.from({ length: 7 }, (_, i) => {
                const date = new Date()
                date.setDate(date.getDate() - (6 - i))
                return {
                    name: days[date.getDay()],
                    dateStr: date.toISOString().split('T')[0],
                    revenue: 0,
                    orders: 0
                }
            })

            chartResult.data?.forEach((order: any) => {
                const day = dailyStats.find(d => d.dateStr === order.created_at.split('T')[0])
                if (day) {
                    if (order.status === 'completed') {
                        day.revenue += Number(order.total_amount)
                    }
                    if (order.status !== 'cancelled') {
                        day.orders += 1
                    }
                }
            })

            return {
                totalRevenue,
                activeOrders: activeResult.count || 0,
                totalOrders: totalResult.count || 0,
                menuItemsCount: menuResult.count || 0,
                chartData: dailyStats,
                recentOrders: recentResult.data || []
            }
        },
        enabled: !!cafeId,
        refetchInterval: 1000, // 1 second polling for extreme parity
        staleTime: 0,
        gcTime: 0,
        refetchOnWindowFocus: true
    })
}
