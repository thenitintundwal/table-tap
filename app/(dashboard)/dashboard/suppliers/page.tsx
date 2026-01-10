'use client'

import { useState } from 'react'
import { useCafe } from '@/hooks/useCafe'
import { useSuppliers } from '@/hooks/useSuppliers'
import {
    Truck,
    Plus,
    Search,
    Phone,
    Mail,
    MapPin,
    Edit2,
    Trash2,
    Loader2,
    X,
    Check,
    Power
} from 'lucide-react'
import { Supplier, PurchaseOrder } from '@/types'
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders'
import { useInventory } from '@/hooks/useInventory'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function SuppliersPage() {
    const { cafe } = useCafe()
    const [activeTab, setActiveTab] = useState<'suppliers' | 'orders'>('suppliers')
    const { suppliers, isLoading: suppliersLoading, addSupplier, updateSupplier, deleteSupplier, toggleActive } = useSuppliers(cafe?.id)
    const { orders, isLoading: ordersLoading, createOrder, updateOrderStatus, deleteOrder } = usePurchaseOrders(cafe?.id)
    const { items: inventoryItems } = useInventory(cafe?.id)

    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')
    const [modalOpen, setModalOpen] = useState(false)
    const [orderModalOpen, setOrderModalOpen] = useState(false)
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)

    // Supplier Form
    const [formData, setFormData] = useState({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        category: 'other' as Supplier['category'],
        notes: ''
    })

    // Order Form
    const [orderFormData, setOrderFormData] = useState({
        supplier_id: '',
        expected_delivery: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
        items: [] as any[]
    })

    const categories = [
        { value: 'all', label: 'All Categories', color: 'text-zinc-400' },
        { value: 'produce', label: 'Produce', color: 'text-green-500' },
        { value: 'dairy', label: 'Dairy', color: 'text-blue-500' },
        { value: 'beverages', label: 'Beverages', color: 'text-orange-500' },
        { value: 'dry_goods', label: 'Dry Goods', color: 'text-yellow-500' },
        { value: 'other', label: 'Other', color: 'text-purple-500' }
    ]

    const filteredSuppliers = suppliers.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.contact_person?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter
        return matchesSearch && matchesCategory
    })

    const openModal = (supplier?: Supplier) => {
        if (supplier) {
            setEditingSupplier(supplier)
            setFormData({
                name: supplier.name,
                contact_person: supplier.contact_person || '',
                phone: supplier.phone || '',
                email: supplier.email || '',
                address: supplier.address || '',
                category: supplier.category || 'other',
                notes: supplier.notes || ''
            })
        } else {
            setEditingSupplier(null)
            setFormData({
                name: '',
                contact_person: '',
                phone: '',
                email: '',
                address: '',
                category: 'other',
                notes: ''
            })
        }
        setModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!cafe) return

        try {
            if (editingSupplier) {
                await updateSupplier(editingSupplier.id, formData)
            } else {
                await addSupplier({
                    ...formData,
                    cafe_id: cafe.id,
                    is_active: true
                })
            }
            setModalOpen(false)
        } catch (error) {
            console.error(error)
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this supplier?')) {
            await deleteSupplier(id)
        }
    }

    const handleOrderSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!cafe) return

        if (orderFormData.items.length === 0) {
            toast.error('Please add at least one item to the order')
            return
        }

        const total_amount = orderFormData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)

        const order = await createOrder({
            supplier_id: orderFormData.supplier_id,
            expected_delivery: orderFormData.expected_delivery,
            notes: orderFormData.notes,
            total_amount
        }, orderFormData.items)

        if (order) {
            setOrderModalOpen(false)
            setOrderFormData({
                supplier_id: '',
                expected_delivery: format(new Date(), 'yyyy-MM-dd'),
                notes: '',
                items: []
            })
        }
    }

    const addItemToOrder = () => {
        setOrderFormData(prev => ({
            ...prev,
            items: [...prev.items, { inventory_item_id: '', item_name: '', quantity: 1, unit_price: 0 }]
        }))
    }

    const updateOrderItem = (index: number, updates: any) => {
        setOrderFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) => i === index ? { ...item, ...updates } : item)
        }))
    }

    const removeOrderItem = (index: number) => {
        setOrderFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }))
    }

    const isLoading = suppliersLoading || (activeTab === 'orders' && ordersLoading)

    const getStatusColor = (status: PurchaseOrder['status']) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            case 'ordered': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            case 'delivered': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20'
            default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                <p className="text-zinc-500 mt-4 text-sm font-medium">Loading suppliers...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white italic tracking-tighter uppercase flex items-center gap-3">
                        <Truck className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
                        Supplier Hub
                    </h1>
                    <div className="flex items-center gap-4 mt-2">
                        <button
                            onClick={() => setActiveTab('suppliers')}
                            className={`text-sm font-bold uppercase tracking-widest transition-all pb-1 border-b-2 ${activeTab === 'suppliers' ? 'border-emerald-500 text-zinc-900 dark:text-white' : 'border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                        >
                            Suppliers
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`text-sm font-bold uppercase tracking-widest transition-all pb-1 border-b-2 ${activeTab === 'orders' ? 'border-emerald-500 text-zinc-900 dark:text-white' : 'border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                        >
                            Purchase Orders
                        </button>
                    </div>
                </div>

                {activeTab === 'suppliers' ? (
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Add Supplier
                    </button>
                ) : (
                    <button
                        onClick={() => setOrderModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        New Order
                    </button>
                )}
            </div>

            {/* Main Content */}
            {activeTab === 'suppliers' ? (
                <>
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search suppliers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                            {categories.map(cat => (
                                <button
                                    key={cat.value}
                                    onClick={() => setCategoryFilter(cat.value)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${categoryFilter === cat.value
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Suppliers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSuppliers.map(supplier => {
                            const category = categories.find(c => c.value === supplier.category)
                            return (
                                <div
                                    key={supplier.id}
                                    className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl p-6 transition-all hover:border-emerald-500/30 shadow-sm dark:shadow-none ${!supplier.is_active ? 'opacity-50' : ''
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">{supplier.name}</h3>
                                            <span className={`text-xs font-bold uppercase tracking-wider ${category?.color}`}>
                                                {category?.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => toggleActive(supplier.id, supplier.is_active)}
                                                className={`p-2 rounded-lg transition-colors ${supplier.is_active
                                                    ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                                                    : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                                                    }`}
                                                title={supplier.is_active ? 'Active' : 'Inactive'}
                                            >
                                                <Power className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        {supplier.contact_person && (
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                                <span className="font-medium text-zinc-900 dark:text-zinc-300">Contact:</span> {supplier.contact_person}
                                            </p>
                                        )}
                                        {supplier.phone && (
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                                <Phone className="w-3 h-3 text-zinc-400" />
                                                {supplier.phone}
                                            </p>
                                        )}
                                        {supplier.email && (
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                                <Mail className="w-3 h-3 text-zinc-400" />
                                                {supplier.email}
                                            </p>
                                        )}
                                        {supplier.address && (
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                                <MapPin className="w-3 h-3 text-zinc-400" />
                                                {supplier.address}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 pt-4 border-t border-zinc-100 dark:border-white/5">
                                        <button
                                            onClick={() => openModal(supplier)}
                                            className="flex-1 flex items-center justify-center gap-2 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-900 dark:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(supplier.id)}
                                            className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}

                        {filteredSuppliers.length === 0 && (
                            <div className="col-span-full text-center py-12">
                                <Truck className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                                <p className="text-zinc-500 font-medium">No suppliers found.</p>
                                <p className="text-sm text-zinc-600 mt-1">Add your first supplier to get started.</p>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="space-y-6">
                    {/* Orders List */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm dark:shadow-none">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-white/5">
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Order No.</th>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Supplier</th>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Expected</th>
                                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                                {orders.map(order => (
                                    <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors">#{order.order_number}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">{order.supplier_name}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-black text-zinc-900 dark:text-white">₹{order.total_amount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-zinc-400">{order.expected_delivery ? format(new Date(order.expected_delivery), 'MMM dd, yyyy') : '-'}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {order.status === 'pending' && (
                                                    <button
                                                        onClick={() => updateOrderStatus(order.id, 'ordered')}
                                                        className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg transition-all"
                                                        title="Mark as Ordered"
                                                    >
                                                        <Truck className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {order.status === 'ordered' && (
                                                    <button
                                                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                                                        className="p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-lg transition-all"
                                                        title="Mark as Delivered"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteOrder(order.id)}
                                                    className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-all"
                                                    title="Delete Order"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <Truck className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                                            <p className="text-zinc-500 font-medium">No purchase orders found.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-white/60 dark:bg-black/80 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 w-full max-w-2xl rounded-3xl p-6 relative z-10 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                            </h3>
                            <button onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-1">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Supplier Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        placeholder="ABC Suppliers Ltd."
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Contact Person</label>
                                    <input
                                        type="text"
                                        value={formData.contact_person}
                                        onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                                        className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2371717a%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.7em_0.7em] bg-[right_1rem_center] bg-no-repeat"
                                    >
                                        <option value="produce" className="bg-zinc-900 text-white">Produce</option>
                                        <option value="dairy" className="bg-zinc-900 text-white">Dairy</option>
                                        <option value="beverages" className="bg-zinc-900 text-white">Beverages</option>
                                        <option value="dry_goods" className="bg-zinc-900 text-white">Dry Goods</option>
                                        <option value="other" className="bg-zinc-900 text-white">Other</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        placeholder="+1 234 567 8900"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        placeholder="contact@supplier.com"
                                    />
                                </div>

                                <div className="col-span-2 space-y-1">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Address</label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        placeholder="123 Main St, City, State"
                                    />
                                </div>

                                <div className="col-span-2 space-y-1">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3}
                                        className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                                        placeholder="Additional notes..."
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-4 font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-4"
                            >
                                <Check className="w-5 h-5" />
                                {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* New Order Modal */}
            {orderModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-white/60 dark:bg-black/80 backdrop-blur-sm" onClick={() => setOrderModalOpen(false)} />
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 w-full max-w-3xl rounded-3xl p-6 relative z-10 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                                Create Purchase Order
                            </h3>
                            <button onClick={() => setOrderModalOpen(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleOrderSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Supplier *</label>
                                    <select
                                        value={orderFormData.supplier_id}
                                        onChange={(e) => setOrderFormData({ ...orderFormData, supplier_id: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2371717a%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.7em_0.7em] bg-[right_1rem_center] bg-no-repeat"
                                        required
                                    >
                                        <option value="" className="bg-zinc-900 text-white">Select Supplier</option>
                                        {suppliers.filter(s => s.is_active).map(s => (
                                            <option key={s.id} value={s.id} className="bg-zinc-900 text-white">{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Expected Delivery</label>
                                    <input
                                        type="date"
                                        value={orderFormData.expected_delivery}
                                        onChange={(e) => setOrderFormData({ ...orderFormData, expected_delivery: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Items</label>
                                    <button
                                        type="button"
                                        onClick={addItemToOrder}
                                        className="text-xs font-bold text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 flex items-center gap-1 bg-blue-500/10 px-3 py-1.5 rounded-lg transition-all"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Add Item
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {orderFormData.items.map((item, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-3 items-end bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <div className="col-span-12 md:col-span-5 space-y-1">
                                                <label className="text-[10px] font-bold text-zinc-500 uppercase">Item Name *</label>
                                                <div className="relative">
                                                    <select
                                                        value={item.inventory_item_id}
                                                        onChange={(e) => {
                                                            const invItem = inventoryItems.find(i => i.id === e.target.value)
                                                            updateOrderItem(index, {
                                                                inventory_item_id: e.target.value,
                                                                item_name: invItem?.item_name || ''
                                                            })
                                                        }}
                                                        className="w-full bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2371717a%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.7em_0.7em] bg-[right_1rem_center] bg-no-repeat"
                                                        required
                                                    >
                                                        <option value="" className="bg-zinc-900 text-white">Select Stock Item</option>
                                                        {inventoryItems.map(invItem => (
                                                            <option key={invItem.id} value={invItem.id} className="bg-zinc-900 text-white">{invItem.item_name} ({invItem.unit})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="col-span-4 md:col-span-2 space-y-1">
                                                <label className="text-[10px] font-bold text-zinc-500 uppercase">Qty</label>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateOrderItem(index, { quantity: parseFloat(e.target.value) || 0 })}
                                                    className="w-full bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                                                    min="0.01"
                                                    step="0.01"
                                                    required
                                                />
                                            </div>

                                            <div className="col-span-5 md:col-span-3 space-y-1">
                                                <label className="text-[10px] font-bold text-zinc-500 uppercase">Unit Price (₹)</label>
                                                <input
                                                    type="number"
                                                    value={item.unit_price}
                                                    onChange={(e) => updateOrderItem(index, { unit_price: parseFloat(e.target.value) || 0 })}
                                                    className="w-full bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                                                    min="0"
                                                    step="0.01"
                                                    required
                                                />
                                            </div>

                                            <div className="col-span-3 md:col-span-2 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => removeOrderItem(index)}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {orderFormData.items.length === 0 && (
                                        <div className="text-center py-8 border-2 border-dashed border-white/5 rounded-3xl">
                                            <p className="text-sm text-zinc-500 font-medium">No items added yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Notes</label>
                                <textarea
                                    value={orderFormData.notes}
                                    onChange={(e) => setOrderFormData({ ...orderFormData, notes: e.target.value })}
                                    rows={2}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                                    placeholder="Optional notes for this order..."
                                />
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-white/5">
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Total Amount</p>
                                    <p className="text-2xl font-black text-zinc-900 dark:text-white">₹{orderFormData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toLocaleString()}</p>
                                </div>
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    <Check className="w-5 h-5" />
                                    Confirm Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
