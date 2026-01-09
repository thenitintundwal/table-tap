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
            case 'available': return 'bg-zinc-800 border-white/5 hover:border-orange-500/50 hover:bg-orange-500/5'
            case 'occupied': return 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20'
            case 'reserved': return 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
            case 'cleaning': return 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20'
            default: return 'bg-zinc-800 border-white/5'
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
            <div className="h-screen flex items-center justify-center bg-zinc-950">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="h-screen flex flex-col bg-zinc-950 dark:bg-zinc-950">
            {/* Top Bar */}
            <div className="bg-white/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10 px-6 py-4 flex items-center justify-between backdrop-blur-xl">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                            <Utensils className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-white">Table View</h1>
                            <p className="text-xs text-zinc-500">{cafe?.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/dashboard/pos/order"
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            New Order
                        </Link>
                        <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all">
                            <Users className="w-4 h-4" />
                            Table Reservation
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={refresh} className="text-zinc-400 hover:text-white transition-colors">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <div className="text-right">
                        <p className="text-xs text-zinc-500">Call for Support</p>
                        <p className="text-sm font-bold text-white">9099912383</p>
                    </div>
                </div>
            </div>

            {/* Section Tabs */}
            <div className="bg-black/5 dark:bg-black/20 border-b border-black/5 dark:border-white/5 px-6 py-3 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-2">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setSelectedSection(section.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedSection === section.id
                                ? 'bg-zinc-700 text-white'
                                : 'bg-transparent text-zinc-400 hover:text-white'
                                }`}
                        >
                            {section.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-zinc-400">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-zinc-400">Occupied</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-zinc-400">Reserved</span>
                    </div>
                </div>
            </div>

            {/* Tables Grid */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-4">
                    <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">
                        {selectedSection === 'all' ? 'All Sections' : sections.find(s => s.id === selectedSection)?.label}
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
                                <p className="text-lg font-black text-white mb-1">Table {table.table_number}</p>

                                {table.order && (
                                    <div className="text-center">
                                        <p className="text-xs text-zinc-400 mb-1">${table.order.total_amount.toFixed(2)}</p>
                                        <div className="flex items-center justify-center gap-1">
                                            <Link href={`/dashboard/orders`} className="p-1 bg-white/10 rounded hover:bg-white/20 transition-colors">
                                                <Eye className="w-3 h-3 text-white" />
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Hover Actions */}
                            {table.status === 'available' && (
                                <div className="absolute inset-0 bg-black/80 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        Actions
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
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTable(null)} />
                    <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 w-full max-w-lg rounded-3xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 shadow-2xl">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-800/50">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black ${getTableColor(selectedTable.status)}`}>
                                    {selectedTable.table_number}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Table {selectedTable.table_number}</h3>
                                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Section: {selectedTable.section}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedTable(null)} className="text-zinc-500 hover:text-white bg-white/5 p-2 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {selectedTable.order ? (
                                <div className="space-y-6">
                                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500">
                                                <Clock className="w-5 h-5 animate-pulse" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-yellow-500/70 font-bold uppercase tracking-wider">Active Order</p>
                                                <p className="text-sm font-bold text-white">#{selectedTable.order.id.slice(0, 8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Total</p>
                                            <p className="text-lg font-black text-white">${selectedTable.order.total_amount.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="bg-zinc-800/50 rounded-2xl border border-white/5 overflow-hidden font-medium">
                                        <div className="p-3 border-b border-white/5 bg-white/5">
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Order Items</p>
                                        </div>
                                        <div className="p-4 space-y-3 max-h-[200px] overflow-y-auto no-scrollbar">
                                            {selectedTable.order.order_items?.map((item: any) => (
                                                <div key={item.id} className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-6 h-6 bg-orange-500/10 rounded flex items-center justify-center text-[10px] font-black text-orange-500 border border-orange-500/20">
                                                            {item.quantity}x
                                                        </span>
                                                        <span className="text-zinc-300">{item.menu_items?.name}</span>
                                                    </div>
                                                    <span className="text-zinc-500 text-xs">${(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[.2em] ml-1">Status Management</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Link
                                                href="/dashboard/orders"
                                                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white p-4 rounded-2xl font-bold text-sm flex flex-col items-center gap-2 transition-all"
                                            >
                                                <Eye className="w-5 h-5 text-zinc-400" />
                                                View Order
                                            </Link>
                                            <button
                                                onClick={() => handleClearTable(selectedTable.id)}
                                                disabled={isClearing}
                                                className="bg-zinc-800 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 text-zinc-400 hover:text-red-500 p-4 rounded-2xl font-bold text-sm flex flex-col items-center gap-2 transition-all"
                                            >
                                                {isClearing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                                Clear Table
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex flex-col items-center justify-center py-6 text-center">
                                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4 border border-emerald-500/20">
                                            <CheckCircle2 className="w-8 h-8" />
                                        </div>
                                        <h4 className="text-lg font-bold text-white">Table is Available</h4>
                                        <p className="text-sm text-zinc-500 max-w-[200px] mt-1 font-medium">No active orders found for this table.</p>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[.2em] ml-1">Table Actions</p>
                                        <div className="grid grid-cols-1 gap-3">
                                            <button
                                                onClick={() => handleStartOrder(selectedTable.table_number)}
                                                className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                                            >
                                                <Plus className="w-5 h-5" />
                                                Start New Order
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[.2em] ml-1">Manual Status</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => handleUpdateStatus(selectedTable.id, 'reserved')}
                                                className={`p-3 rounded-xl border font-bold text-xs transition-all ${selectedTable.status === 'reserved'
                                                    ? 'bg-blue-500/20 border-blue-500 text-blue-500'
                                                    : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                Mark Reserved
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(selectedTable.id, 'cleaning')}
                                                className={`p-3 rounded-xl border font-bold text-xs transition-all ${selectedTable.status === 'cleaning'
                                                    ? 'bg-orange-500/20 border-orange-500 text-orange-500'
                                                    : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                Needs Cleaning
                                            </button>
                                        </div>
                                        {selectedTable.status !== 'available' && (
                                            <button
                                                onClick={() => handleUpdateStatus(selectedTable.id, 'available')}
                                                className="w-full p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl font-bold text-xs hover:bg-emerald-500/20 transition-all mt-2"
                                            >
                                                Set to Available
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-zinc-800/30 border-t border-white/5 flex items-center justify-center gap-4">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-zinc-500" />
                                <span className="text-xs font-bold text-zinc-400">Capacity: {selectedTable.capacity} Persons</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Action Bar */}
            <div className="bg-zinc-900 border-t border-white/10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button className="bg-white text-zinc-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-zinc-100 transition-all">
                        Delivery
                    </button>
                    <button className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-600 transition-all">
                        Take Away
                    </button>
                </div>
            </div>
        </div>
    )
}
