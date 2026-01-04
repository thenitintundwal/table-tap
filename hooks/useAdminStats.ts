'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, format, eachDayOfInterval, eachMonthOfInterval, getHours, getMonth } from 'date-fns'

export type ViewMode = 'day' | 'month' | 'year'

export function useAdminStats(viewMode: ViewMode = 'month', dateInput?: Date, selectedCafeId?: string) {
    const currentDate = dateInput || new Date()
    // Stabilize the date by day to avoid millisecond-based query key changes
    const memoDate = format(currentDate, 'yyyy-MM-dd')

    return useQuery({
        queryKey: ['admin-stats', viewMode, memoDate, selectedCafeId],
        queryFn: async () => {
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
                default:
                    startDate = startOfMonth(currentDate)
                    endDate = endOfMonth(currentDate)
            }

            // 1 & 2. Parallel Fetching for Cafes and Orders
            const cafesPromise = supabase
                .from('cafes')
                .select('id, name, subscription_plan, created_at')
                .returns<{ id: string, name: string, subscription_plan: string, created_at: string }[]>()

            let ordersQuery = (supabase.from('orders') as any)
                .select('total_amount, created_at, status')
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString())

            if (selectedCafeId) {
                ordersQuery = ordersQuery.eq('cafe_id', selectedCafeId)
            }

            const [cafesResult, ordersResult] = await Promise.all([
                cafesPromise,
                ordersQuery
            ])

            if (cafesResult.error) throw cafesResult.error
            if (ordersResult.error) throw ordersResult.error

            const cafes = cafesResult.data
            const orders = ordersResult.data

            const BASIC_PRICE = 2000
            const PRO_PRICE = 5000

            // Grouping logic
            const typedCafes = cafes as unknown as { id: string, name: string, subscription_plan: string, created_at: string }[]
            const typedOrders = orders as unknown as { total_amount: number, created_at: string, status: string }[]

            const totalCafes = typedCafes?.length || 0
            const proCafes = typedCafes?.filter((c) => c.subscription_plan === 'pro').length || 0
            const basicCafes = totalCafes - proCafes

            // Calculate subscription revenue
            let subscriptionRevenue = 0
            if (selectedCafeId) {
                const selectedCafe = typedCafes.find(c => c.id === selectedCafeId)
                if (selectedCafe) {
                    subscriptionRevenue = selectedCafe.subscription_plan === 'pro' ? PRO_PRICE : BASIC_PRICE
                }
            } else {
                subscriptionRevenue = (proCafes * PRO_PRICE) + (basicCafes * BASIC_PRICE)
            }

            const periodRevenue = typedOrders?.reduce((acc: number, o) => {
                if (o.status === 'completed' || o.status === 'served') {
                    return acc + (Number(o.total_amount) || 0)
                }
                return acc
            }, 0) || 0
            const periodOrders = typedOrders?.length || 0

            // 3. Prepare Chart Data (Optimized with Map)
            let chartData: any[] = []
            let orderTrendData: any[] = []

            if (viewMode === 'day') {
                const hoursMap = new Map()
                for (let i = 0; i < 24; i++) {
                    hoursMap.set(i, {
                        name: `${i.toString().padStart(2, '0')}:00`,
                        hour: i,
                        value: 0,
                        orders: 0,
                        revenue: 0
                    })
                }

                typedCafes.forEach(c => {
                    const d = new Date(c.created_at)
                    if (d >= startDate && d <= endDate) {
                        const h = getHours(d)
                        const item = hoursMap.get(h)
                        if (item) item.value += 1
                    }
                })

                typedOrders.forEach(o => {
                    const d = new Date(o.created_at)
                    const h = getHours(d)
                    const item = hoursMap.get(h)
                    if (item) {
                        item.orders += 1
                        if (o.status === 'completed' || o.status === 'served') item.revenue += Number(o.total_amount)
                    }
                })
                chartData = Array.from(hoursMap.values())
                orderTrendData = chartData
            } else if (viewMode === 'month') {
                const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate })
                const daysMap = new Map()

                daysInMonth.forEach(date => {
                    const ds = format(date, 'yyyy-MM-dd')
                    daysMap.set(ds, {
                        name: format(date, 'MMM d'),
                        dateStr: ds,
                        value: 0,
                        orders: 0,
                        revenue: 0
                    })
                })

                typedCafes.forEach(c => {
                    const ds = format(new Date(c.created_at), 'yyyy-MM-dd')
                    const item = daysMap.get(ds)
                    if (item) item.value += 1
                })

                typedOrders.forEach(o => {
                    const ds = format(new Date(o.created_at), 'yyyy-MM-dd')
                    const item = daysMap.get(ds)
                    if (item) {
                        item.orders += 1
                        if (o.status === 'completed' || o.status === 'served') item.revenue += Number(o.total_amount)
                    }
                })
                chartData = Array.from(daysMap.values())
                orderTrendData = chartData
            } else if (viewMode === 'year') {
                const monthsMap = new Map()
                const monthsInYear = eachMonthOfInterval({ start: startDate, end: endDate })

                monthsInYear.forEach(date => {
                    const m = getMonth(date)
                    monthsMap.set(m, {
                        name: format(date, 'MMM'),
                        month: m,
                        value: 0,
                        orders: 0,
                        revenue: 0
                    })
                })

                typedCafes.forEach(c => {
                    const m = getMonth(new Date(c.created_at))
                    const item = monthsMap.get(m)
                    if (item) item.value += 1
                })

                typedOrders.forEach(o => {
                    const m = getMonth(new Date(o.created_at))
                    const item = monthsMap.get(m)
                    if (item) {
                        item.orders += 1
                        if (o.status === 'completed' || o.status === 'served') item.revenue += Number(o.total_amount)
                    }
                })
                chartData = Array.from(monthsMap.values())
                orderTrendData = chartData
            }

            // 3.2 Plan Distribution
            const planDistribution = [
                { name: 'Basic', value: basicCafes, color: '#71717a' },
                { name: 'Pro', value: proCafes, color: '#a855f7' }
            ]

            return {
                totalCafes,
                proCafes,
                basicCafes,
                totalOrders: periodOrders,
                totalRevenue: periodOrders > 0 ? periodRevenue : 0, // Fallback for safety
                subscriptionRevenue,
                chartData,
                planDistribution,
                orderTrendData,
                cafes: typedCafes
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    })
}
