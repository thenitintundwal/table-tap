'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useCafe } from '@/hooks/useCafe'
import CafeGuard from '@/components/dashboard/CafeGuard'
import {
    ResponsiveContainer,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    Cell
} from 'recharts'
import { Loader2, TrendingUp, AlertTriangle, Star, CheckCircle2, HelpCircle } from 'lucide-react'
import { useTheme } from 'next-themes'

// Types
interface AnalyticItem {
    id: string
    name: string
    price: number
    cost_price: number
    quantity_sold: number
    revenue: number
    profit: number
    margin_per_item: number
}

function ProfitabilityMatrixContent() {
    const { cafe } = useCafe()
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    // 1. Fetch Menu Items
    const { data: menuItems, isLoading: loadingMenu } = useQuery({
        queryKey: ['menu-pro', cafe?.id],
        queryFn: async () => {
            const { data } = await supabase.from('menu_items').select('*').eq('cafe_id', cafe!.id)
            return data || []
        },
        enabled: !!cafe?.id
    })

    // 2. Fetch Sales Data (Aggregation)
    // In a real app, this should be a stored procedure or edge function for performance
    const { data: salesData, isLoading: loadingSales } = useQuery({
        queryKey: ['sales-pro', cafe?.id],
        queryFn: async () => {
            // Fetch all COMPLETED order items
            // This is heavy, optimally filter by date range (e.g. last 30 days)
            const { data, error } = await supabase
                .from('order_items')
                .select(`
                    quantity,
                    price,
                    menu_item_id,
                    orders!inner(status, cafe_id)
                `)
                .eq('orders.cafe_id', cafe!.id)
                .eq('orders.status', 'completed') as any

            if (error) throw error
            return data
        },
        enabled: !!cafe?.id
    })

    const matrixData = useMemo(() => {
        if (!menuItems || !salesData) return []

        // Map sales to items
        const stats = new Map<string, { qty: number; revenue: number }>()

        salesData.forEach((record: any) => {
            const itemId = record.menu_item_id
            const current = stats.get(itemId) || { qty: 0, revenue: 0 }

            stats.set(itemId, {
                qty: current.qty + record.quantity,
                revenue: current.revenue + (record.price * record.quantity)
            })
        })

        // Combine with cost info
        return menuItems.map((item: any) => {
            const sale = stats.get(item.id) || { qty: 0, revenue: 0 }
            const cost = item.cost_price || 0
            const profit = sale.revenue - (cost * sale.qty)
            const margin = item.price - cost

            return {
                id: item.id,
                name: item.name,
                price: item.price,
                cost_price: cost,
                quantity_sold: sale.qty,
                revenue: sale.revenue,
                profit: profit,
                margin_per_item: margin
            }
        }).filter((i: any) => i.quantity_sold > 0) // Only plot active items
    }, [menuItems, salesData])

    // Calculate Averages for Quadrants
    const { avgPopularity, avgProfit } = useMemo(() => {
        if (matrixData.length === 0) return { avgPopularity: 0, avgProfit: 0 }

        const totalQty = matrixData.reduce((sum: number, i: any) => sum + i.quantity_sold, 0)
        const totalProfit = matrixData.reduce((sum: number, i: any) => sum + i.profit, 0) // actually usually Contribution Margin is used for Y axis
        // Menu Engineering: Y = Contribution Margin (Price - Cost), X = Popularity (Qty)

        // Let's us Contribution MArgin (Per item) for Y? Or Total Profit?
        // Standard Matrix: 
        // X: Volume (Popularity)
        // Y: Contribution Margin (Profitability)

        const avgPop = totalQty / matrixData.length

        // Avg Margin
        const avgMarg = matrixData.reduce((sum: number, i: any) => sum + i.margin_per_item, 0) / matrixData.length

        return { avgPopularity: avgPop, avgProfit: avgMarg }
    }, [matrixData])


    if (loadingMenu || loadingSales) {
        return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black text-zinc-900 dark:text-white italic tracking-tighter uppercase flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-500" />
                    Profitability Matrix
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">Menu Engineering Analysis (Stars, Plowhorses, Puzzles, Dogs)</p>
            </div>

            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl shadow-black/5">
                <div className="h-[500px] w-full relative">
                    {matrixData.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 gap-4">
                            <TrendingUp className="w-12 h-12 opacity-20" />
                            <p className="font-black uppercase tracking-widest text-xs">No sales data available yet.</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#ffffff05" : "#00000005"} />
                                <XAxis
                                    type="number"
                                    dataKey="quantity_sold"
                                    name="Popularity"
                                    unit=" sold"
                                    stroke={isDark ? "#71717a" : "#a1a1aa"}
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontWeight: 'bold' }}
                                    label={{ value: 'Popularity (Volume)', position: 'insideBottom', offset: -10, fill: isDark ? '#71717a' : '#a1a1aa', fontSize: 10, fontWeight: 'bold' }}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="margin_per_item"
                                    name="Profitability"
                                    unit="₹"
                                    stroke={isDark ? "#71717a" : "#a1a1aa"}
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontWeight: 'bold' }}
                                    label={{ value: 'Profitability (Margin ₹)', angle: -90, position: 'insideLeft', fill: isDark ? '#71717a' : '#a1a1aa', fontSize: 10, fontWeight: 'bold' }}
                                />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3', stroke: isDark ? '#ffffff20' : '#00000010' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload
                                            return (
                                                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-4 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                                                    <p className="font-black text-zinc-900 dark:text-white mb-2 uppercase tracking-tight text-sm">{data.name}</p>
                                                    <div className="text-[10px] text-zinc-500 space-y-1.5 font-bold uppercase">
                                                        <p className="flex justify-between gap-8">Sales: <span className="text-zinc-900 dark:text-white">{data.quantity_sold}</span></p>
                                                        <p className="flex justify-between gap-8">Margin: <span className="text-emerald-600 dark:text-emerald-400">₹{data.margin_per_item.toFixed(2)}</span></p>
                                                        <p className="flex justify-between gap-8">Cost: <span className="text-rose-600 dark:text-rose-400">₹{data.cost_price.toFixed(2)}</span></p>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <ReferenceLine x={avgPopularity} stroke={isDark ? "#ffffff20" : "#00000010"} strokeDasharray="3 3" />
                                <ReferenceLine y={avgProfit} stroke={isDark ? "#ffffff20" : "#00000010"} strokeDasharray="3 3" />
                                <Scatter name="Menu Items" data={matrixData} fill="#ec4899">
                                    {matrixData.map((entry: any, index: number) => {
                                        // Determine Quadrant color
                                        // Star (High Pop, High Margin): Green
                                        // Plowhorse (High Pop, Low Margin): Yellow
                                        // Puzzle (Low Pop, High Margin): Purple
                                        // Dog (Low Pop, Low Margin): Red
                                        let fill = '#ef4444' // Dog
                                        if (entry.quantity_sold >= avgPopularity && entry.margin_per_item >= avgProfit) fill = '#10b981' // Star
                                        else if (entry.quantity_sold >= avgPopularity && entry.margin_per_item < avgProfit) fill = '#eab308' // Plowhorse
                                        else if (entry.quantity_sold < avgPopularity && entry.margin_per_item >= avgProfit) fill = '#a855f7' // Puzzle

                                        return <Cell key={`cell-${index}`} fill={fill} />
                                    })}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                    <div className="bg-emerald-50 dark:bg-emerald-500/5 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-500/20 group hover:border-emerald-500/40 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                <Star className="w-6 h-6 text-emerald-600 dark:text-emerald-500 fill-emerald-500/20" />
                            </div>
                            <h4 className="font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-tighter">Stars</h4>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 leading-relaxed">High Volume, High Profit. Promote these!</p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-500/5 p-5 rounded-3xl border border-yellow-100 dark:border-yellow-500/20 group hover:border-yellow-500/40 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
                            </div>
                            <h4 className="font-black text-yellow-600 dark:text-yellow-500 uppercase tracking-tighter">Plowhorses</h4>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 leading-relaxed">High Volume, Low Profit. Raise prices slightly?</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-500/5 p-5 rounded-3xl border border-purple-100 dark:border-purple-500/20 group hover:border-purple-500/40 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                                <HelpCircle className="w-6 h-6 text-purple-600 dark:text-purple-500" />
                            </div>
                            <h4 className="font-black text-purple-600 dark:text-purple-500 uppercase tracking-tighter">Puzzles</h4>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 leading-relaxed">Low Volume, High Profit. Needs marketing.</p>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-500/5 p-5 rounded-3xl border border-rose-100 dark:border-rose-500/20 group hover:border-rose-500/40 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-500" />
                            </div>
                            <h4 className="font-black text-rose-600 dark:text-rose-500 uppercase tracking-tighter">Dogs</h4>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 leading-relaxed">Low Volume, Low Profit. Remove from menu?</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ProfitabilityPage() {
    return (
        <CafeGuard>
            <ProfitabilityMatrixContent />
        </CafeGuard>
    )
}
