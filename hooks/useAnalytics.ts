import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, format, eachDayOfInterval, eachMonthOfInterval, getHours, getMonth } from 'date-fns'

export type ViewMode = 'day' | 'month' | 'year'

export function useAnalytics(cafeId: string | undefined, viewMode: ViewMode, currentDate: Date) {
    return useQuery({
        queryKey: ['analytics', cafeId, viewMode, currentDate.toISOString()],
        queryFn: async () => {
            if (!cafeId) return null

            let startDate: Date
            let endDate: Date

            // Determine date range
            switch (viewMode) {
                case 'day':
                    startDate = startOfDay(currentDate)
                    endDate = endOfDay(currentDate)
                    break
                case 'month':
                    startDate = startOfMonth(currentDate)
                    endDate = endOfMonth(currentDate)
                    break
                case 'year':
                    startDate = startOfYear(currentDate)
                    endDate = endOfYear(currentDate)
                    break
            }

            // 1. Fetch orders in range with items for deeper analysis
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select(`
                    id, 
                    created_at, 
                    total_amount, 
                    status, 
                    table_number,
                    order_items (
                        quantity,
                        menu_item_id,
                        menu_items (name)
                    )
                `)
                .eq('cafe_id', cafeId)
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString())
                .order('created_at', { ascending: true })

            if (ordersError) throw ordersError

            // 2. Aggregate Data
            let totalRevenue = 0
            let totalOrders = 0
            const itemSales: Record<string, { name: string, quantity: number, revenue: number }> = {}
            const tableStats: Record<number, { orders: number, revenue: number }> = {}
            const statusCounts: Record<string, number> = {
                completed: 0,
                preparing: 0,
                pending: 0,
                cancelled: 0
            }

            orders?.forEach((order: any) => {
                const status = order.status || 'pending'
                const amount = Number(order.total_amount) || 0
                const table = order.table_number

                // Totals
                if (status === 'completed') {
                    totalRevenue += amount
                    statusCounts.completed += 1
                } else if (status === 'cancelled') {
                    statusCounts.cancelled += 1
                } else {
                    statusCounts[status] = (statusCounts[status] || 0) + 1
                }

                if (status !== 'cancelled') {
                    totalOrders += 1

                    // Table Stats
                    if (!tableStats[table]) tableStats[table] = { orders: 0, revenue: 0 }
                    tableStats[table].orders += 1
                    if (status === 'completed') {
                        tableStats[table].revenue += amount
                    }

                    // Item Stats
                    order.order_items?.forEach((oi: any) => {
                        const itemId = oi.menu_item_id
                        const itemName = oi.menu_items?.name || 'Unknown Item'
                        const qty = oi.quantity || 0

                        if (!itemSales[itemId]) {
                            itemSales[itemId] = { name: itemName, quantity: 0, revenue: 0 }
                        }
                        itemSales[itemId].quantity += qty
                        if (status === 'completed') {
                            itemSales[itemId].revenue += (Number(oi.price) || 0) * qty
                        }
                    })
                }
            })

            // Chart Data Processing
            let chartData: any[] = []
            if (viewMode === 'day') {
                const hours = Array.from({ length: 24 }, (_, i) => ({
                    name: `${i.toString().padStart(2, '0')}:00`,
                    hour: i,
                    revenue: 0,
                    orders: 0
                }))
                orders?.forEach((order: any) => {
                    const date = new Date(order.created_at)
                    const hour = getHours(date)
                    const item = hours.find(h => h.hour === hour)
                    if (item) {
                        if (order.status === 'completed') item.revenue += Number(order.total_amount)
                        if (order.status !== 'cancelled') item.orders += 1
                    }
                })
                chartData = hours
            } else if (viewMode === 'month') {
                const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate })
                chartData = daysInMonth.map(date => ({
                    name: format(date, 'MMM d'),
                    dateStr: format(date, 'yyyy-MM-dd'),
                    revenue: 0,
                    orders: 0
                }))
                orders?.forEach((order: any) => {
                    const dateStr = format(new Date(order.created_at), 'yyyy-MM-dd')
                    const item = chartData.find(d => d.dateStr === dateStr)
                    if (item) {
                        if (order.status === 'completed') item.revenue += Number(order.total_amount)
                        if (order.status !== 'cancelled') item.orders += 1
                    }
                })
            } else if (viewMode === 'year') {
                const monthsInYear = eachMonthOfInterval({ start: startDate, end: endDate })
                chartData = monthsInYear.map(date => ({
                    name: format(date, 'MMM'),
                    month: getMonth(date),
                    revenue: 0,
                    orders: 0
                }))
                orders?.forEach((order: any) => {
                    const month = getMonth(new Date(order.created_at))
                    const item = chartData.find(m => m.month === month)
                    if (item) {
                        if (order.status === 'completed') item.revenue += Number(order.total_amount)
                        if (order.status !== 'cancelled') item.orders += 1
                    }
                })
            }

            const topItems = Object.values(itemSales)
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 5)

            const statusDistribution = [
                { name: 'Completed', value: statusCounts.completed, color: '#10b981' },
                { name: 'Preparing', value: statusCounts.preparing, color: '#f59e0b' },
                { name: 'Pending', value: statusCounts.pending, color: '#3b82f6' },
                { name: 'Cancelled', value: statusCounts.cancelled, color: '#ef4444' }
            ].filter(s => s.value > 0)

            const tablePerformance = Object.entries(tableStats)
                .map(([table, stats]) => ({
                    table: `Table ${table}`,
                    orders: stats.orders,
                    revenue: stats.revenue
                }))
                .sort((a, b) => b.revenue - a.revenue)

            return {
                totalRevenue,
                totalOrders,
                chartData,
                topItems,
                statusDistribution,
                tablePerformance
            }
        },
        enabled: !!cafeId,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    })
}
