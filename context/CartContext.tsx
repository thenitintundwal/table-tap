'use client'

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { MenuItem } from '@/types'
import { supabase } from '@/lib/supabase/client'

export interface CartItem extends MenuItem {
    quantity: number
}

interface CartContextType {
    items: CartItem[]
    addItem: (item: MenuItem) => void
    removeItem: (id: string) => void
    clearCart: () => void
    total: number
    count: number
    lastOrderId: string | null
    checkout: (cafeId: string, tableNumber: number | null, customerName?: string) => Promise<{ success: boolean, data?: any, error?: string }>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [lastOrderId, setLastOrderId] = useState<string | null>(null)

    useEffect(() => {
        const saved = localStorage.getItem('cafe-last-order-id')
        if (saved) setLastOrderId(saved)
    }, [])

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cafe-qr-cart')
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart))
            } catch (e) {
                console.error('Failed to parse cart', e)
            }
        }
    }, [])

    // Save cart to localStorage on change
    useEffect(() => {
        localStorage.setItem('cafe-qr-cart', JSON.stringify(items))
    }, [items])

    const addItem = (item: MenuItem) => {
        if (!item.is_available) return

        setItems((prev) => {
            const existing = prev.find((i) => i.id === item.id)
            if (existing) {
                return prev.map((i) =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                )
            }
            return [...prev, { ...item, quantity: 1 }]
        })
    }

    const removeItem = (id: string) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.id === id)
            if (existing && existing.quantity > 1) {
                return prev.map((i) =>
                    i.id === id ? { ...i, quantity: i.quantity - 1 } : i
                )
            }
            return prev.filter((i) => i.id !== id)
        })
    }

    const clearCart = () => {
        setItems([])
        localStorage.removeItem('cafe-qr-cart')
    }

    const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])
    const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])

    const checkout = async (cafeId: string, tableNumber: number | null, customerName?: string) => {
        try {
            // 1. Create the order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    cafe_id: cafeId,
                    table_number: tableNumber ?? 0,
                    customer_name: customerName || null,
                    total_amount: total,
                    status: 'pending'
                } as any)
                .select()
                .single()

            if (orderError) throw orderError

            // 2. Create order items
            const orderItems = items.map(item => ({
                order_id: (order as any).id,
                menu_item_id: item.id,
                quantity: item.quantity,
                price: item.price
            }))

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems as any)

            if (itemsError) throw itemsError

            // 3. Success
            if (order) {
                const oid = (order as any).id
                setLastOrderId(oid)
                localStorage.setItem('cafe-last-order-id', oid)
            }
            clearCart()
            return { success: true, data: order }
        } catch (err: any) {
            console.error('Checkout error:', err)
            return { success: false, error: err.message }
        }
    }

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total, count, checkout, lastOrderId }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
