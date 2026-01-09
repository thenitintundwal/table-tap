'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import {
    Utensils,
    ShoppingCart,
    Search,
    ArrowRight,
    Loader2,
    ChevronLeft,
    Plus,
    Minus,
    X,
    Trash2
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useCafe } from '@/hooks/useCafe'
import { MenuItem, Customer } from '@/types'
import { toast } from 'sonner'
import { useCRM } from '@/hooks/useCRM'

export default function POSOrderPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const tableNumber = searchParams.get('table')
    const { cafe } = useCafe()
    const { items, addItem, removeItem, clearCart, total, count, checkout } = useCart()

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [customerName, setCustomerName] = useState('')
    const { customers: allCustomers } = useCRM(cafe?.id)
    const [customerSearch, setCustomerSearch] = useState('')
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)

    const filteredCustomers = useMemo(() => {
        if (!customerSearch) return []
        return allCustomers.filter(c =>
            c.customer_name?.toLowerCase().includes(customerSearch.toLowerCase())
        ).slice(0, 5)
    }, [allCustomers, customerSearch])

    // Fetch menu items
    const { data: menuItems, isLoading: isLoadingMenu } = useQuery({
        queryKey: ['menu-items', cafe?.id],
        queryFn: async () => {
            if (!cafe?.id) return []
            const { data, error } = await supabase
                .from('menu_items')
                .select('*')
                .eq('cafe_id', cafe.id)
                .eq('is_available', true)
            if (error) throw error
            return data as MenuItem[]
        },
        enabled: !!cafe?.id
    })

    const categories = useMemo(() => {
        if (!menuItems) return ['All']
        const cats = Array.from(new Set(menuItems.map(item => item.category)))
        return ['All', ...cats]
    }, [menuItems])

    const filteredItems = useMemo(() => {
        return menuItems?.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
            return matchesSearch && matchesCategory
        })
    }, [menuItems, searchQuery, selectedCategory])

    const handlePlaceOrder = async () => {
        if (count === 0) {
            toast.error('Cart is empty')
            return
        }

        setIsSubmitting(true)
        try {
            const tableNum = tableNumber ? parseInt(tableNumber) : 0
            const result = await checkout(cafe!.id, tableNum, customerName || `Table ${tableNum}`)

            if (result.success) {
                toast.success('Order placed successfully')
                clearCart()
                router.push('/dashboard/pos')
            } else {
                toast.error(result.error || 'Failed to place order')
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoadingMenu) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] -m-8 overflow-hidden bg-zinc-950 dark:bg-zinc-950">
            {/* Header / Search */}
            <div className="bg-white/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10 p-6 flex items-center justify-between gap-6 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-white">Punch Order</h1>
                        <p className="text-xs text-orange-500 font-bold uppercase tracking-widest">
                            {tableNumber ? `Table ${tableNumber}` : 'Direct Order'}
                        </p>
                    </div>
                </div>

                <div className="flex-1 max-w-md relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-orange-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-medium"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto max-w-sm scrollbar-none no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat
                                ? 'bg-orange-500 text-white'
                                : 'bg-white/5 text-zinc-500 hover:text-white border border-white/5'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Menu Grid */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-none no-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredItems?.map(item => {
                            const cartItem = items.find(i => i.id === item.id)
                            const quantity = cartItem?.quantity || 0

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => addItem(item)}
                                    className={`relative bg-white/5 dark:bg-white/5 border rounded-2xl p-4 cursor-pointer transition-all hover:border-orange-500/50 group backdrop-blur-sm ${quantity > 0 ? 'border-orange-500' : 'border-black/5 dark:border-white/5'
                                        }`}
                                >
                                    {item.image_url ? (
                                        <div className="aspect-square rounded-xl overflow-hidden mb-3 border border-white/5">
                                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                    ) : (
                                        <div className="aspect-square rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mb-3">
                                            <Utensils className="w-8 h-8 text-zinc-700" />
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        <h3 className="font-bold text-white text-sm line-clamp-1">{item.name}</h3>
                                        <p className="text-orange-500 font-extrabold text-xs">${item.price.toFixed(2)}</p>
                                    </div>

                                    {quantity > 0 && (
                                        <div className="absolute top-2 right-2 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg shadow-orange-500/20">
                                            {quantity}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Sidebar Cart */}
                <div className="w-96 bg-black/20 dark:bg-black/40 border-l border-black/5 dark:border-white/10 flex flex-col backdrop-blur-2xl">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-orange-500" />
                            <h2 className="font-bold text-white uppercase tracking-widest text-xs">Current Tray</h2>
                        </div>
                        {count > 0 && (
                            <button
                                onClick={clearCart}
                                className="text-[10px] font-black text-red-500/70 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-1"
                            >
                                <Trash2 className="w-3 h-3" /> Clear
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                        {items.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                                <ShoppingCart className="w-12 h-12 mb-4" />
                                <p className="text-sm font-bold uppercase tracking-widest">Tray is Empty</p>
                            </div>
                        ) : (
                            items.map(item => (
                                <div key={item.id} className="bg-white/5 rounded-2xl p-4 flex items-center justify-between group border border-white/5 hover:border-white/10 transition-all">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                                        <p className="text-[10px] text-zinc-500 mt-0.5">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg flex items-center justify-center transition-all active:scale-95"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="w-4 text-center font-black text-white text-sm">{item.quantity}</span>
                                        <button
                                            onClick={() => addItem(item)}
                                            className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg flex items-center justify-center transition-all active:scale-95"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-6 bg-black/40 border-t border-white/5 space-y-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Customer Name (Optional)"
                                    value={customerSearch}
                                    onChange={(e) => {
                                        setCustomerSearch(e.target.value)
                                        setCustomerName(e.target.value)
                                        setShowCustomerDropdown(true)
                                    }}
                                    onFocus={() => setShowCustomerDropdown(true)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-bold placeholder:text-zinc-700"
                                />
                                {showCustomerDropdown && filteredCustomers.length > 0 && (
                                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-zinc-800 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
                                        {filteredCustomers.map(customer => (
                                            <button
                                                key={customer.id}
                                                onClick={() => {
                                                    const name = customer.customer_name || ''
                                                    setCustomerName(name)
                                                    setCustomerSearch(name)
                                                    setShowCustomerDropdown(false)
                                                }}
                                                className="w-full px-4 py-3 text-left hover:bg-orange-500/10 flex items-center justify-between border-b border-white/5 last:border-0 transition-colors"
                                            >
                                                <div>
                                                    <p className="text-xs font-bold text-white">{customer.customer_name}</p>
                                                    <p className="text-[10px] text-zinc-500 uppercase font-black">{customer.loyalty_points || 0} pts</p>
                                                </div>
                                                <div className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase">
                                                    Member
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <span className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Total Amount</span>
                                    <p className="text-[10px] text-zinc-700 font-bold uppercase">{count} Items selected</p>
                                </div>
                                <span className="text-2xl font-black text-white italic">${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={isSubmitting || count === 0}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-30 text-white rounded-2xl py-4 font-black uppercase tracking-[.2em] text-xs shadow-xl shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 border-t border-white/10"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>Verify & Place <ArrowRight className="w-4 h-4 opacity-50" /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
