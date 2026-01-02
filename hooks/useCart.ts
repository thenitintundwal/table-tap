'use client'

import { useState, useEffect } from 'react'
import { MenuItem } from '@/types'

export interface CartItem extends MenuItem {
    quantity: number
}

export function useCart() {
    const [items, setItems] = useState<CartItem[]>([])

    const addItem = (item: MenuItem) => {
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

    const clearCart = () => setItems([])

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const count = items.reduce((sum, item) => sum + item.quantity, 0)

    return {
        items,
        addItem,
        removeItem,
        clearCart,
        total,
        count,
    }
}
