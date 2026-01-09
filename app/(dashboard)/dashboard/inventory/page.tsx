'use client'

import { useState } from 'react'
import { useCafe } from '@/hooks/useCafe'
import { useInventory, InventoryItem } from '@/hooks/useInventory'
import {
    LayoutGrid,
    Plus,
    Search,
    AlertTriangle,
    CheckCircle2,
    Package,
    Loader2,
    Trash2,
    Save,
    X,
    Minus
} from 'lucide-react'

export default function InventoryPage() {
    const { cafe } = useCafe()
    const { items, isLoading, addItem, updateItem, deleteItem, adjustStock } = useInventory(cafe?.id)
    const [searchQuery, setSearchQuery] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [newItem, setNewItem] = useState({ item_name: '', quantity: 0, unit: 'kg', min_threshold: 5 })

    const filteredItems = items.filter(item =>
        item.item_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getStockStatus = (item: InventoryItem) => {
        if (item.quantity <= 0) return { label: 'Out of Stock', color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertTriangle }
        if (item.quantity <= item.min_threshold) return { label: 'Low Stock', color: 'text-orange-500', bg: 'bg-orange-500/10', icon: AlertTriangle }
        return { label: 'In Stock', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2 }
    }

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault()
        await addItem(newItem)
        setIsAddModalOpen(false)
        setNewItem({ item_name: '', quantity: 0, unit: 'kg', min_threshold: 5 })
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-zinc-500 mt-4 text-sm font-medium">Loading InventoryOS...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground italic tracking-tighter uppercase flex items-center gap-3">
                        <LayoutGrid className="w-8 h-8 text-orange-500" />
                        InventoryOS
                    </h1>
                    <p className="text-zinc-500 font-medium mt-1">
                        Real-time stock tracking and smart alerts.
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Add Item
                </button>
            </div>

            {/* Smart Stats Row - Placeholder for now, calculated from items */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
                    <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Total Items</p>
                    <p className="text-3xl font-black text-white mt-1">{items.length}</p>
                </div>
                <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
                    <p className="text-orange-500 text-xs font-black uppercase tracking-widest">Low Stock Alerts</p>
                    <p className="text-3xl font-black text-white mt-1">
                        {items.filter(i => i.quantity <= i.min_threshold && i.quantity > 0).length}
                    </p>
                </div>
                <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
                    <p className="text-red-500 text-xs font-black uppercase tracking-widest">Out of Stock</p>
                    <p className="text-3xl font-black text-white mt-1">
                        {items.filter(i => i.quantity <= 0).length}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
                <div className="p-6 border-b border-white/5 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search ingredients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/20 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-black/20 text-xs font-black text-zinc-500 uppercase tracking-widest text-left">
                            <tr>
                                <th className="px-6 py-4">Item Name</th>
                                <th className="px-6 py-4">Stock Status</th>
                                <th className="px-6 py-4">Current Stock</th>
                                <th className="px-6 py-4">Unit</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredItems.map(item => {
                                const status = getStockStatus(item)
                                const StatusIcon = status.icon
                                return (
                                    <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white">{item.item_name}</div>
                                            <div className="text-xs text-zinc-500">Min: {item.min_threshold} {item.unit}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border border-current/10 ${status.color} ${status.bg}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {status.label}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => adjustStock(item.id, -1)}
                                                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="font-mono font-bold text-lg text-white w-16 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => adjustStock(item.id, 1)}
                                                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-zinc-400 uppercase">{item.unit}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => deleteItem(item.id)}
                                                className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                            {filteredItems.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                        <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p className="font-medium">No items found in inventory.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Item Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
                    <div className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-3xl shadow-2xl relative z-10 p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Add Ingredient</h2>
                            <button onClick={() => setIsAddModalOpen(false)}><X className="w-6 h-6 text-zinc-500 hover:text-white" /></button>
                        </div>
                        <form onSubmit={handleAddItem} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Name</label>
                                <input
                                    required
                                    value={newItem.item_name}
                                    onChange={e => setNewItem({ ...newItem, item_name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                    placeholder="e.g. Milk, Coffee Beans"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Initial Stock</label>
                                    <input
                                        type="number"
                                        required
                                        step="0.001"
                                        value={newItem.quantity}
                                        onChange={e => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Unit</label>
                                    <select
                                        value={newItem.unit}
                                        onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2371717a%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.7em_0.7em] bg-[right_1rem_center] bg-no-repeat"
                                    >
                                        <option value="kg" className="bg-zinc-900 text-white">kg</option>
                                        <option value="g" className="bg-zinc-900 text-white">g</option>
                                        <option value="l" className="bg-zinc-900 text-white">l</option>
                                        <option value="ml" className="bg-zinc-900 text-white">ml</option>
                                        <option value="pcs" className="bg-zinc-900 text-white">pcs</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Low Stock Alert At</label>
                                <input
                                    type="number"
                                    required
                                    step="0.001"
                                    value={newItem.min_threshold}
                                    onChange={e => setNewItem({ ...newItem, min_threshold: parseFloat(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                />
                            </div>
                            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl mt-2">
                                Save Item
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
