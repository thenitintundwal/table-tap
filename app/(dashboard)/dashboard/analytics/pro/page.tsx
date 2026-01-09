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
                <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                    Profitability Matrix
                </h1>
                <p className="text-zinc-500 font-medium">Menu Engineering Analysis (Stars, Plowhorses, Puzzles, Dogs)</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-3xl p-8 shadow-xl">
                <div className="h-[500px] w-full relative">
                    {matrixData.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
                            No sales data available yet.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis
                                    type="number"
                                    dataKey="quantity_sold"
                                    name="Popularity"
                                    unit=" sold"
                                    label={{ value: 'Popularity (Volume)', position: 'insideBottom', offset: -10, fill: '#666' }}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="margin_per_item"
                                    name="Profitability"
                                    unit="$"
                                    label={{ value: 'Profitability (Margin $)', angle: -90, position: 'insideLeft', fill: '#666' }}
                                />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload
                                            return (
                                                <div className="bg-zinc-900 border border-white/10 p-3 rounded-xl shadow-xl">
                                                    <p className="font-bold text-white mb-1">{data.name}</p>
                                                    <div className="text-xs text-zinc-400 space-y-1">
                                                        <p>Sales: <span className="text-white">{data.quantity_sold}</span></p>
                                                        <p>Margin: <span className="text-emerald-400">${data.margin_per_item.toFixed(2)}</span></p>
                                                        <p>Cost: <span className="text-red-400">${data.cost_price.toFixed(2)}</span></p>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <ReferenceLine x={avgPopularity} stroke="#purple" strokeDasharray="3 3" label="Avg Vol" />
                                <ReferenceLine y={avgProfit} stroke="#purple" strokeDasharray="3 3" label="Avg Margin" />
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                    <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Star className="w-5 h-5 text-emerald-500 fill-emerald-500" />
                            <h4 className="font-bold text-emerald-500">Stars</h4>
                        </div>
                        <p className="text-xs text-zinc-500">High Volume, High Profit. Promote these!</p>
                    </div>
                    <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-5 h-5 text-yellow-500" />
                            <h4 className="font-bold text-yellow-500">Plowhorses</h4>
                        </div>
                        <p className="text-xs text-zinc-500">High Volume, Low Profit. Raise prices slightly?</p>
                    </div>
                    <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <HelpCircle className="w-5 h-5 text-purple-500" />
                            <h4 className="font-bold text-purple-500">Puzzles</h4>
                        </div>
                        <p className="text-xs text-zinc-500">Low Volume, High Profit. Needs marketing.</p>
                    </div>
                    <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <h4 className="font-bold text-red-500">Dogs</h4>
                        </div>
                        <p className="text-xs text-zinc-500">Low Volume, Low Profit. Remove from menu?</p>
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
