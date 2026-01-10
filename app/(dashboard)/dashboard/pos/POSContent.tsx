'use client'

import { useState, useMemo, useEffect } from 'react'
import { useCafe } from '@/hooks/useCafe'
import { useOrders } from '@/hooks/useOrders'
import { useTables } from '@/hooks/useTables'
import {
    Plus,
    Users,
    RefreshCw,
    Utensils,
    Eye,
    Loader2,
    X,
    CheckCircle2,
    Trash2,
    Clock,
    AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

export default function POSContent() {
    const router = useRouter()
    const { cafe } = useCafe()
    const { orders } = useOrders(cafe?.id)
    const { tables, isLoading, clearTable, updateTableStatus, refresh } = useTables(cafe?.id)
    const [selectedSection, setSelectedSection] = useState<string>('all')
    const [mounted, setMounted] = useState(false)
    const [selectedTable, setSelectedTable] = useState<any>(null)
    const [isClearing, setIsClearing] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Map orders to tables
    const tablesWithOrders = useMemo(() => {
        if (!tables || !orders) return []

        return tables.map(table => {
            // Find active order for this table
            const activeOrder = orders.find(order =>
                order.table_number === table.table_number &&
                (order.status === 'pending' || order.status === 'preparing')
            )

            return {
                ...table,
                order: activeOrder,
                status: activeOrder ? ('occupied' as const) : table.status
            }
        })
    }, [tables, orders])

    const sections = [
        { id: 'all', label: 'All Tables', count: tablesWithOrders.length },
        { id: 'ac', label: 'A/C', count: tablesWithOrders.filter(t => t.section === 'ac').length },
        { id: 'non_ac', label: 'Non A/C', count: tablesWithOrders.filter(t => t.section === 'non_ac').length },
        { id: 'bar', label: 'Bar', count: tablesWithOrders.filter(t => t.section === 'bar').length }
    ]

    const filteredTables = selectedSection === 'all'
        ? tablesWithOrders
        : tablesWithOrders.filter(t => t.section === selectedSection)

    const getTableColor = (status: string) => {
        switch (status) {
            case 'available': return 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/5 hover:border-orange-500/50 hover:bg-orange-50 dark:hover:bg-orange-500/5'
            case 'occupied': return 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/30 hover:bg-yellow-100 dark:hover:bg-yellow-500/20 shadow-sm dark:shadow-none'
            case 'reserved': return 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-500/20 shadow-sm dark:shadow-none'
            case 'cleaning': return 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30 hover:bg-orange-100 dark:hover:bg-orange-500/20 shadow-sm dark:shadow-none'
            default: return 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/5'
        }
    }

    const handleTableClick = (table: any) => {
        setSelectedTable(table)
    }

    const handleClearTable = async (tableId: string) => {
        setIsClearing(true)
        try {
            await clearTable(tableId)
            setSelectedTable(null)
        } catch (error) {
            toast.error('Failed to clear table')
        } finally {
            setIsClearing(false)
        }
    }

    const handleUpdateStatus = async (tableId: string, status: any) => {
        try {
            await updateTableStatus(tableId, status)
            toast.success(`Table marked as ${status}`)
            setSelectedTable(null)
        } catch (error) {
            toast.error('Failed to update table status')
        }
    }

    const handleStartOrder = (tableNumber: number) => {
        router.push(`/dashboard/pos/order?table=${tableNumber}`)
    }

    const getStatusDot = (status: string) => {
        switch (status) {
            case 'available': return 'bg-emerald-500'
            case 'occupied': return 'bg-yellow-500'
            case 'reserved': return 'bg-blue-500'
            case 'cleaning': return 'bg-orange-500'
            default: return 'bg-zinc-500'
        }
    }

    if (isLoading || !mounted) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-zinc-500 mt-4 text-sm font-black uppercase tracking-widest">Initializing POS...</p>
            </div>
        )
    }

    return (
        <div className="h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
            {/* Top Bar */}
            <div className="bg-white/80 dark:bg-white/5 border-b border-zinc-200 dark:border-white/10 px-6 py-4 flex items-center justify-between backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-orange-400 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Utensils className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-zinc-900 dark:text-white italic tracking-tighter uppercase">Table View</h1>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{cafe?.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/dashboard/pos/order"
                            className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            New Order
                        </Link>
                        <button className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-all border border-zinc-200 dark:border-white/5">
                            <Users className="w-4 h-4" />
                            Reservation
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button onClick={refresh} className="w-10 h-10 bg-zinc-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-zinc-400 hover:text-orange-500 transition-all border border-zinc-200 dark:border-white/5">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <div className="text-right hidden sm:block border-l border-zinc-200 dark:border-white/10 pl-6">
                        <p className="text-[10px] font-black uppercase tracking-[.2em] text-zinc-400 dark:text-zinc-500">Support</p>
                        <p className="text-sm font-black text-zinc-900 dark:text-white tabular-nums">90999 12383</p>
                    </div>
                </div>
            </div>

            {/* Section Tabs */}
            <div className="bg-white/50 dark:bg-black/20 border-b border-zinc-200 dark:border-white/5 px-6 py-3 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-2">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setSelectedSection(section.id)}
                            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedSection === section.id
                                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-lg'
                                : 'bg-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                                }`}
                        >
                            {section.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[.2em]">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                        <span className="text-zinc-500">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                        <span className="text-zinc-500">Occupied</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                        <span className="text-zinc-500">Reserved</span>
                    </div>
                </div>
            </div>

            {/* Tables Grid */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-4">
                    <h2 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[.3em] mb-4">
                        {selectedSection === 'all' ? 'Floor Layout' : sections.find(s => s.id === selectedSection)?.label}
                    </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                    {filteredTables.map(table => (
                        <div
                            key={`${table.section}-${table.table_number}`}
                            onClick={() => handleTableClick(table)}
                            className={`relative aspect-square rounded-2xl border-2 p-4 transition-all cursor-pointer group ${getTableColor(table.status)}`}
                        >
                            {/* Status Dot */}
                            <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${getStatusDot(table.status)}`}></div>

                            {/* Table Number */}
                            <div className="flex flex-col items-center justify-center h-full">
                                <p className="text-2xl font-black text-zinc-900 dark:text-white mb-1">{table.table_number}</p>
                                <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Table</p>

                                {table.order && (
                                    <div className="text-center mt-3">
                                        <p className="text-xs font-bold text-zinc-900 dark:text-white mb-2">₹{table.order.total_amount.toLocaleString()}</p>
                                        <div className="flex items-center justify-center gap-2">
                                            <Link href={`/dashboard/orders`} className="p-2 bg-white/20 dark:bg-white/10 rounded-xl hover:bg-white/30 transition-all border border-black/5 dark:border-white/5">
                                                <Eye className="w-3.5 h-3.5 text-zinc-900 dark:text-white" />
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Hover Actions */}
                            {table.status === 'available' && (
                                <div className="absolute inset-0 bg-zinc-900/60 dark:bg-black/80 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                    <div className="bg-orange-600 text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl shadow-orange-500/30">
                                        <Plus className="w-3.5 h-3.5" />
                                        Select
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Table Action Modal */}
            {selectedTable && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-white/60 dark:bg-black/80 backdrop-blur-sm" onClick={() => setSelectedTable(null)} />
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden relative z-10 animate-in fade-in zoom-in-95 shadow-2xl">
                        <div className="p-8 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
                            <div className="flex items-center gap-5">
                                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl font-black shadow-lg ${getTableColor(selectedTable.status)}`}>
                                    {selectedTable.table_number}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase italic">Table {selectedTable.table_number}</h3>
                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-[.2em] font-black">Section: {selectedTable.section.replace('_', ' ')}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedTable(null)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-200 dark:bg-white/5 p-3 rounded-2xl transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            {selectedTable.order ? (
                                <div className="space-y-8">
                                    <div className="bg-yellow-50 dark:bg-yellow-500/5 border border-yellow-200 dark:border-yellow-500/20 rounded-3xl p-5 flex items-center justify-between shadow-sm dark:shadow-none">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-600 dark:text-yellow-500 border border-yellow-500/10">
                                                <Clock className="w-6 h-6 animate-pulse" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-yellow-600 dark:text-yellow-500/70 font-black uppercase tracking-widest mb-0.5">Active Order</p>
                                                <p className="text-base font-black text-zinc-900 dark:text-white">#{selectedTable.order.id.slice(0, 8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest mb-0.5">Running Total</p>
                                            <p className="text-2xl font-black text-zinc-900 dark:text-white">₹{selectedTable.order.total_amount.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="bg-zinc-50 dark:bg-black/20 rounded-3xl border border-zinc-100 dark:border-white/5 overflow-hidden transition-colors">
                                        <div className="px-5 py-3 border-b border-zinc-100 dark:border-white/5 bg-zinc-100 dark:bg-white/5 flex items-center justify-between">
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[.2em]">Current Items</p>
                                            <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{selectedTable.order.order_items?.length || 0} Items</span>
                                        </div>
                                        <div className="p-5 space-y-4 max-h-[220px] overflow-y-auto custom-scrollbar">
                                            {selectedTable.order.order_items?.map((item: any) => (
                                                <div key={item.id} className="flex items-center justify-between text-sm group/item">
                                                    <div className="flex items-center gap-4">
                                                        <span className="w-7 h-7 bg-orange-500/10 dark:bg-orange-500/10 rounded-lg flex items-center justify-center text-[10px] font-black text-orange-600 dark:text-orange-500 border border-orange-500/10">
                                                            {item.quantity}
                                                        </span>
                                                        <span className="text-zinc-900 dark:text-zinc-300 font-bold group-hover/item:text-orange-600 transition-colors">{item.menu_items?.name}</span>
                                                    </div>
                                                    <span className="text-zinc-500 dark:text-zinc-500 font-bold tabular-nums">₹{item.price.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[.3em] ml-1">Order Controls</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Link
                                                href="/dashboard/orders"
                                                className="bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white p-5 rounded-3xl font-black uppercase tracking-widest text-[10px] flex flex-col items-center gap-3 transition-all"
                                            >
                                                <Eye className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
                                                Order Detail
                                            </Link>
                                            <button
                                                onClick={() => handleClearTable(selectedTable.id)}
                                                disabled={isClearing}
                                                className="bg-rose-50 dark:bg-zinc-800 hover:bg-rose-100 dark:hover:bg-rose-500/10 border border-rose-100 dark:border-white/5 hover:border-rose-300 dark:hover:border-rose-500/30 text-rose-600 dark:text-rose-500 p-5 rounded-3xl font-black uppercase tracking-widest text-[10px] flex flex-col items-center gap-3 transition-all shadow-sm dark:shadow-none"
                                            >
                                                {isClearing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Trash2 className="w-6 h-6" />}
                                                Clear & Free
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center text-emerald-500 mb-6 border border-emerald-500/20 shadow-lg shadow-emerald-500/10 transition-transform hover:scale-110 duration-500">
                                            <CheckCircle2 className="w-10 h-10" />
                                        </div>
                                        <h4 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase italic">Ready for Guest</h4>
                                        <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[.2em] max-w-[200px] mt-2">Available for immediate seating.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[.3em] ml-1">Service Actions</p>
                                        <div className="grid grid-cols-1 gap-3">
                                            <button
                                                onClick={() => handleStartOrder(selectedTable.table_number)}
                                                className="bg-orange-600 hover:bg-orange-700 text-white p-5 rounded-3xl font-black uppercase tracking-[.2em] text-[10px] flex items-center justify-center gap-4 shadow-xl shadow-orange-500/30 active:scale-95 transition-all"
                                            >
                                                <Plus className="w-5 h-5" />
                                                Create New Order
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <p className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[.3em] ml-1">Operational State</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => handleUpdateStatus(selectedTable.id, 'reserved')}
                                                className={`p-4 rounded-2xl border font-black uppercase tracking-widest text-[10px] transition-all ${selectedTable.status === 'reserved'
                                                    ? 'bg-blue-500/20 dark:bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-500'
                                                    : 'bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10'
                                                    }`}
                                            >
                                                Reserve Table
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(selectedTable.id, 'cleaning')}
                                                className={`p-4 rounded-2xl border font-black uppercase tracking-widest text-[10px] transition-all ${selectedTable.status === 'cleaning'
                                                    ? 'bg-orange-100 dark:bg-orange-500/20 border-orange-500 text-orange-600 dark:text-orange-500'
                                                    : 'bg-zinc-50 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10'
                                                    }`}
                                            >
                                                Needs Cleaning
                                            </button>
                                        </div>
                                        {selectedTable.status !== 'available' && (
                                            <button
                                                onClick={() => handleUpdateStatus(selectedTable.id, 'available')}
                                                className="w-full p-4 bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-500/20 transition-all mt-4"
                                            >
                                                Release to Available
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-5 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-white/5 flex items-center justify-center gap-6">
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-zinc-400" />
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Capacity: {selectedTable.capacity} PAX</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Action Bar */}
            <div className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-white/10 px-8 py-5 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-4 rounded-2xl font-black uppercase tracking-[.2em] text-[10px] hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-xl shadow-black/5 dark:shadow-none">
                        Delivery
                    </button>
                    <button className="bg-orange-600 dark:bg-orange-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[.2em] text-[10px] hover:bg-orange-700 dark:hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20">
                        Take Away
                    </button>
                </div>
            </div>
        </div>
    )
}
