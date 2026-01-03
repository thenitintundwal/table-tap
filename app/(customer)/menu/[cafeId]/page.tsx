'use client'

import { useState, useMemo, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { Coffee, ShoppingCart, Search, ArrowRight, Loader2, ChevronLeft, Clock, CheckCircle2, Star } from 'lucide-react'
import MenuCard from '@/components/customer/MenuCard'
import RatingModal from '@/components/customer/RatingModal'
import { useCart } from '@/context/CartContext'
import { MenuItem, Cafe } from '@/types'

export default function CustomerMenuPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const cafeId = params.cafeId as string
    const tableNumber = searchParams.get('table')

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [isOrdering, setIsOrdering] = useState(false)
    const [showRatingModal, setShowRatingModal] = useState(false)
    const [hasRated, setHasRated] = useState(false)

    const { items, addItem, removeItem, total, count, checkout, lastOrderId } = useCart()

    const { data: cafe, isLoading: isLoadingCafe, error: cafeError } = useQuery({
        queryKey: ['cafe-public', cafeId],
        queryFn: async () => {
            const { data, error } = await supabase.from('cafes').select('*').eq('id', cafeId).single()
            if (error) throw error
            return data as Cafe
        }
    })

    const { data: menuItems, isLoading: isLoadingMenu } = useQuery({
        queryKey: ['menu-public', cafeId],
        queryFn: async () => {
            const { data, error } = await supabase.from('menu_items').select('*').eq('cafe_id', cafeId)
            if (error) throw error
            return data as MenuItem[]
        }
    })

    const [customerName, setCustomerName] = useState('')

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

    // Tracking current order
    const { data: currentOrder } = useQuery({
        queryKey: ['order-status', lastOrderId || ''],
        queryFn: async () => {
            if (!lastOrderId) return null
            const { data, error } = await supabase.from('orders').select('*').eq('id', lastOrderId).single()
            if (error) throw error
            return data as any
        },
        enabled: !!lastOrderId,
        refetchInterval: 2000 // Aggressive poll for customer status (2s)
    })

    // Fetch items for rating when order is completed
    const { data: orderedItems } = useQuery({
        queryKey: ['order-items-for-rating', lastOrderId || ''],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('order_items')
                .select('menu_items(id, name, image_url)')
                .eq('order_id', lastOrderId!)

            if (error) throw error
            return data.map((item: any) => item.menu_items)
        },
        enabled: !!lastOrderId && currentOrder?.status === 'completed'
    })

    // Auto-show rating modal when completed
    useEffect(() => {
        if (currentOrder?.status === 'completed' && !hasRated && !showRatingModal) {
            const alreadyShown = localStorage.getItem(`rated-order-${lastOrderId}`)
            if (!alreadyShown) {
                setShowRatingModal(true)
            }
        }
    }, [currentOrder?.status, lastOrderId, hasRated, showRatingModal])

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [orderSuccess, setOrderSuccess] = useState(false)

    const handlePlaceOrder = async () => {
        setIsSubmitting(true)
        const result = await checkout(cafeId, tableNumber ? parseInt(tableNumber) : 0, customerName)
        setIsSubmitting(false)

        if (result.success) {
            setOrderSuccess(true)
            setIsOrdering(false)
        } else {
            alert('Failed to place order: ' + result.error)
        }
    }

    const isLoading = isLoadingCafe || isLoadingMenu

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        )
    }

    if (cafeError || !cafe) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-8 border border-red-500/20">
                    <Coffee className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Cafe Not Found</h2>
                <p className="text-zinc-500 max-w-xs mb-10 font-medium">
                    This QR code seems to be invalid or the cafe is currently closed.
                </p>
                <div className="w-full max-w-xs space-y-3">
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[.2em] pt-4 leading-none">Powered by TableTap</p>
                </div>
            </div>
        )
    }

    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
                <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-8 border border-emerald-500/20">
                    <ArrowRight className="w-12 h-12 text-emerald-500 -rotate-45" />
                </div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Order Received!</h2>
                <p className="text-zinc-500 max-w-xs mb-10 font-medium">
                    Your order has been sent to the kitchen. Please relax, we'll bring it to your table shortly.
                </p>
                <div className="w-full max-w-xs space-y-3">
                    <button
                        onClick={() => setOrderSuccess(false)}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-orange-500/20"
                    >
                        Order More
                    </button>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[.2em] pt-4">TableTap Powered Experience</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pb-32">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <Coffee className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-none truncate max-w-[150px]">{cafe?.name || 'Cafe Menu'}</h1>
                        {tableNumber && <p className="text-zinc-500 text-[10px] mt-1 uppercase tracking-widest font-black">Table {tableNumber}</p>}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-zinc-500 text-[8px] uppercase font-black tracking-tighter leading-none mb-1">Powering by</p>
                    <p className="text-[10px] font-black text-orange-500 italic uppercase">TableTap</p>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-8">
                {/* Search and Filters */}
                <div className="space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 transition-colors group-focus-within:text-orange-500" />
                        <input
                            type="text"
                            placeholder="Search your favorites..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-[2rem] pl-16 pr-8 py-5 text-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-zinc-700 shadow-inner text-lg font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-none no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`flex-shrink-0 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${selectedCategory === cat
                                    ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20 active:scale-95'
                                    : 'bg-white/5 text-zinc-500 hover:bg-white/10 active:scale-95 border border-white/5'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Categories Grouped Display */}
                {filteredItems?.length === 0 ? (
                    <div className="py-20 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-zinc-700">
                            <Search className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 italic">Nothing found</h3>
                        <p className="text-zinc-500 max-w-[200px] text-sm font-medium">Try searching for something else or check another category.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedCategory('All') }}
                            className="mt-8 text-orange-500 font-black uppercase tracking-widest text-[10px] hover:text-orange-400 transition-colors"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : selectedCategory === 'All' ? (
                    <div className="space-y-12">
                        {categories.filter(c => c !== 'All').map(cat => {
                            const itemsInCategory = menuItems?.filter(item => item.category === cat)
                            if (!itemsInCategory?.length) return null

                            return (
                                <section key={cat} className="space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                                            {cat}
                                        </h2>
                                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                            {itemsInCategory.length} Items
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-0 px-2">
                                        {itemsInCategory.map(item => (
                                            <MenuCard
                                                key={item.id}
                                                item={item}
                                                onAdd={() => addItem(item)}
                                                onRemove={() => removeItem(item.id)}
                                                quantity={items.find(i => i.id === item.id)?.quantity || 0}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {filteredItems?.map(item => (
                            <MenuCard
                                key={item.id}
                                item={item}
                                onAdd={() => addItem(item)}
                                onRemove={() => removeItem(item.id)}
                                quantity={items.find(i => i.id === item.id)?.quantity || 0}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Floating Checkout Button */}
            {count > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 animate-in slide-in-from-bottom-10 duration-500 z-50">
                    <button
                        onClick={() => setIsOrdering(true)}
                        className="w-full bg-gradient-to-br from-orange-400 to-orange-600 p-6 rounded-[2.5rem] flex items-center justify-between shadow-2xl shadow-orange-500/40 hover:-translate-y-2 transition-all active:scale-95 text-white border-t border-white/20"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-black/20 rounded-2xl flex items-center justify-center relative backdrop-blur-md">
                                <ShoppingCart className="w-7 h-7" />
                                <span className="absolute -top-3 -right-3 bg-white text-orange-600 text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center border-4 border-orange-500 shadow-xl ring-2 ring-orange-500/20">
                                    {count}
                                </span>
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-[.2em] leading-none opacity-70 mb-1">View Tray</p>
                                <p className="text-xl font-black tracking-tighter italic">${total.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <ArrowRight className="w-6 h-6" />
                        </div>
                    </button>
                </div>
            )}

            {/* Order Modal */}
            {isOrdering && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setIsOrdering(false)} />
                    <div className="w-full max-w-md bg-zinc-900 border-t sm:border border-white/10 rounded-t-[3.5rem] sm:rounded-[4rem] shadow-2xl relative z-10 overflow-hidden animate-in slide-in-from-bottom-20 duration-500">
                        <div className="p-10 pb-4 flex items-center justify-between">
                            <button onClick={() => setIsOrdering(false)} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-90">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Your Tray</h2>
                            <div className="w-12" />
                        </div>

                        <div className="px-10 py-4">
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Your Name (Optional)"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-zinc-700 font-bold"
                                />
                            </div>
                        </div>

                        <div className="p-10 pt-4 max-h-[50vh] overflow-y-auto no-scrollbar">
                            <div className="space-y-8">
                                {items.map(item => (
                                    <div key={item.id} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center font-black text-orange-500 border border-white/5 text-lg">
                                                {item.quantity}
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg text-white group-hover:text-orange-500 transition-colors leading-tight">{item.name}</p>
                                                <p className="text-xs text-zinc-500 mt-1 font-medium">${item.price.toFixed(2)} each</p>
                                            </div>
                                        </div>
                                        <p className="font-black text-white italic">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-10 bg-black/40 border-t border-white/5 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Grand Total</span>
                                    <p className="text-xs text-zinc-600 font-medium">Inclusive of all taxes</p>
                                </div>
                                <span className="text-4xl font-black tracking-tighter text-white italic">${total.toFixed(2)}</span>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={isSubmitting}
                                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-[2.5rem] py-6 font-black uppercase tracking-[.2em] text-sm shadow-2xl shadow-orange-500/40 active:scale-95 transition-all flex items-center justify-center gap-4 border-t border-white/10"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                                ) : (
                                    <>Verify & Place Order <ArrowRight className="w-5 h-5 text-white/50" /></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Tracking Sticky Bar / Rating Trigger */}
            {currentOrder && currentOrder.status !== 'cancelled' && !isOrdering && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 z-[60] animate-in slide-in-from-top-10 duration-500">
                    <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-4 flex items-center justify-between shadow-2xl overflow-hidden group">
                        <div className="flex items-center gap-4">
                            {currentOrder.status === 'completed' ? (
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                            ) : (
                                <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 relative">
                                    <Clock className="w-6 h-6 animate-pulse" />
                                    <div className="absolute inset-0 bg-orange-500/10 rounded-2xl animate-ping" />
                                </div>
                            )}
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 leading-none mb-1">
                                    {currentOrder.status === 'completed' ? 'Order Served' : 'Kitchen Status'}
                                </p>
                                <p className={`text-sm font-black italic uppercase tracking-tighter ${currentOrder.status === 'completed' ? 'text-emerald-500' : 'text-white'
                                    }`}>
                                    {currentOrder.status === 'pending' ? 'Order Received' :
                                        currentOrder.status === 'preparing' ? 'Preparing...' :
                                            'Enjoy your meal!'}
                                </p>
                            </div>
                        </div>
                        <div className="pr-1">
                            {currentOrder.status === 'completed' && !hasRated ? (
                                <button
                                    onClick={() => setShowRatingModal(true)}
                                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <Star className="w-3 h-3 fill-current" /> Rate
                                </button>
                            ) : (
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Rating Modal */}
            {showRatingModal && orderedItems && (
                <RatingModal
                    isOpen={showRatingModal}
                    onClose={() => {
                        setShowRatingModal(false)
                        setHasRated(true)
                        localStorage.setItem(`rated-order-${lastOrderId}`, 'true')
                    }}
                    orderId={lastOrderId!}
                    items={orderedItems}
                />
            )}
        </div>
    )
}
