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
        <div className="flex flex-col h-[calc(100vh-8rem)] -m-8 overflow-hidden bg-zinc-50 dark:bg-black">
            {/* Header / Search */}
            <div className="bg-white dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-white/10 p-6 flex flex-wrap lg:flex-nowrap items-center justify-between gap-6 backdrop-blur-xl z-20">
                <div className="flex items-center gap-4 min-w-fit">
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-2xl text-zinc-400 hover:text-orange-600 dark:hover:text-orange-500 transition-all active:scale-95 border border-zinc-200 dark:border-white/5 shadow-sm"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">Punch Order</h1>
                        <p className="text-[10px] text-orange-600 dark:text-orange-500 font-extrabold uppercase tracking-[0.2em] italic">
                            {tableNumber ? `Table ${tableNumber} Command` : 'Direct Command'}
                        </p>
                    </div>
                </div>

                <div className="flex-1 max-w-md relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-orange-600 dark:group-focus-within:text-orange-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search Intelligence Flux..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/5 rounded-2xl pl-14 pr-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-black uppercase italic tracking-tight shadow-inner"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto max-w-full lg:max-w-sm no-scrollbar pb-1 lg:pb-0">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`flex-shrink-0 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all italic border ${selectedCategory === cat
                                ? 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 border-transparent shadow-xl'
                                : 'bg-zinc-100 dark:bg-white/5 text-zinc-400 dark:text-zinc-500 hover:text-orange-600 dark:hover:text-orange-500 border-zinc-200 dark:border-white/5'
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
                                    className={`relative bg-white dark:bg-zinc-900/50 border rounded-[2.5rem] p-5 cursor-pointer transition-all hover:-translate-y-1 group active:scale-[0.98] shadow-sm ${quantity > 0
                                        ? 'border-orange-500 ring-2 ring-orange-500/10'
                                        : 'border-zinc-200 dark:border-white/10 hover:border-orange-500/30 hover:bg-zinc-50 dark:hover:bg-white/[0.07]'
                                        }`}
                                >
                                    {item.image_url ? (
                                        <div className="aspect-square rounded-[1.8rem] overflow-hidden mb-4 border border-zinc-100 dark:border-white/5 shadow-inner">
                                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        </div>
                                    ) : (
                                        <div className="aspect-square rounded-[1.8rem] bg-zinc-50 dark:bg-black/40 border border-zinc-100 dark:border-white/5 flex items-center justify-center mb-4 shadow-inner">
                                            <Utensils className="w-10 h-10 text-zinc-200 dark:text-zinc-800" />
                                        </div>
                                    )}

                                    <div className="space-y-1.5 px-1">
                                        <h3 className="font-black text-zinc-900 dark:text-white text-sm line-clamp-1 uppercase italic tracking-tight">{item.name}</h3>
                                        <p className="text-orange-600 dark:text-orange-500 font-black text-sm italic">₹{item.price.toLocaleString()}</p>
                                    </div>

                                    {quantity > 0 && (
                                        <div className="absolute -top-1 -right-1 w-8 h-8 bg-zinc-950 dark:bg-zinc-100 rounded-full flex items-center justify-center text-white dark:text-zinc-950 text-xs font-black shadow-xl ring-4 ring-zinc-50 dark:ring-black">
                                            {quantity}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Sidebar Cart */}
                <div className="w-96 bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-white/10 flex flex-col shadow-2xl z-10">
                    <div className="p-8 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-600/10 dark:bg-orange-500/10 rounded-xl border border-orange-600/10">
                                <ShoppingCart className="w-5 h-5 text-orange-600 dark:text-orange-500" />
                            </div>
                            <h2 className="font-black text-zinc-900 dark:text-white uppercase tracking-tighter text-sm italic">Intelligence Tray</h2>
                        </div>
                        {count > 0 && (
                            <button
                                onClick={clearCart}
                                className="text-[10px] font-black text-rose-600/70 hover:text-rose-600 uppercase tracking-[0.2em] transition-all flex items-center gap-1 active:scale-95 italic"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Purge
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                        {items.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                                <ShoppingCart className="w-20 h-20 mb-6 text-zinc-300 dark:text-zinc-700" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Tray Is Empty</p>
                            </div>
                        ) : (
                            items.map(item => (
                                <div key={item.id} className="bg-zinc-50 dark:bg-black/40 rounded-[2rem] p-5 flex items-center justify-between group border border-zinc-100 dark:border-white/5 hover:border-orange-500/30 transition-all shadow-sm">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase italic tracking-tight line-clamp-1">{item.name}</h4>
                                        <p className="text-[10px] text-orange-600 dark:text-orange-500 font-black mt-1">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="w-10 h-10 bg-white dark:bg-zinc-900 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500/10 dark:hover:text-rose-500 text-zinc-400 rounded-2xl flex items-center justify-center transition-all active:scale-95 border border-zinc-200 dark:border-white/5 shadow-sm"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-4 text-center font-black text-zinc-900 dark:text-white text-sm italic">{item.quantity}</span>
                                        <button
                                            onClick={() => addItem(item)}
                                            className="w-10 h-10 bg-white dark:bg-zinc-900 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500/10 dark:hover:text-emerald-500 text-zinc-400 rounded-2xl flex items-center justify-center transition-all active:scale-95 border border-zinc-200 dark:border-white/5 shadow-sm"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-8 bg-zinc-50 dark:bg-black/60 border-t border-zinc-200 dark:border-white/10 space-y-8">
                        <div className="space-y-6">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="CUSTOMER IDENTITY (OPTIONAL)"
                                    value={customerSearch}
                                    onChange={(e) => {
                                        setCustomerSearch(e.target.value)
                                        setCustomerName(e.target.value)
                                        setShowCustomerDropdown(true)
                                    }}
                                    onFocus={() => setShowCustomerDropdown(true)}
                                    className="w-full bg-white dark:bg-black/60 border border-zinc-200 dark:border-white/10 rounded-[1.5rem] px-5 py-4 text-[10px] text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-black uppercase tracking-widest placeholder:text-zinc-400 shadow-inner"
                                />
                                {showCustomerDropdown && filteredCustomers.length > 0 && (
                                    <div className="absolute bottom-full left-0 right-0 mb-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
                                        {filteredCustomers.map(customer => (
                                            <button
                                                key={customer.id}
                                                onClick={() => {
                                                    const name = customer.customer_name || ''
                                                    setCustomerName(name)
                                                    setCustomerSearch(name)
                                                    setShowCustomerDropdown(false)
                                                }}
                                                className="w-full px-6 py-4 text-left hover:bg-orange-600/5 flex items-center justify-between border-b border-zinc-100 dark:border-white/5 last:border-0 transition-colors"
                                            >
                                                <div>
                                                    <p className="text-sm font-black text-zinc-900 dark:text-white uppercase italic tracking-tight">{customer.customer_name}</p>
                                                    <p className="text-[10px] text-orange-600 dark:text-orange-500 uppercase font-black tracking-widest mt-0.5">{customer.loyalty_points || 0} Intelligence Points</p>
                                                </div>
                                                <div className="px-3 py-1 rounded-lg bg-orange-600/10 text-orange-600 text-[8px] font-black uppercase tracking-widest border border-orange-600/10 italic">
                                                    MEMBER
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between px-2">
                                <div className="space-y-1">
                                    <span className="text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-[0.2em] text-[10px]">Total Payload</span>
                                    <p className="text-[10px] text-zinc-500 dark:text-zinc-600 font-black uppercase tracking-widest">{count} Signals Dispatched</p>
                                </div>
                                <span className="text-4xl font-black text-zinc-900 dark:text-white italic tracking-tighter">₹{total.toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={isSubmitting || count === 0}
                            className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-30 text-white rounded-[1.8rem] py-5 font-black uppercase tracking-[.3em] text-[10px] shadow-2xl shadow-orange-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-4 border-t border-white/10 italic"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>COMMIT COMMAND <ArrowRight className="w-5 h-5 opacity-50" /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
