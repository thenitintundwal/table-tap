'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface InventoryItem {
    id: string
    cafe_id: string
    item_name: string
    quantity: number
    unit: string
    min_threshold: number
    last_updated: string
}

export function useInventory(cafeId?: string) {
    const [items, setItems] = useState<InventoryItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (cafeId) {
            fetchInventory()
        }
    }, [cafeId])

    const fetchInventory = async () => {
        try {
            setIsLoading(true)
            const { data, error } = await supabase
                .from('inventory_items')
                .select('*')
                .eq('cafe_id', cafeId!)
                .order('item_name')

            if (error) throw error
            setItems(data as InventoryItem[])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const addItem = async (item: Omit<InventoryItem, 'id' | 'cafe_id' | 'last_updated'>) => {
        try {
            const { data, error } = await (supabase
                .from('inventory_items') as any)
                .insert({
                    ...item,
                    cafe_id: cafeId
                })
                .select()
                .single()

            if (error) throw error
            setItems(prev => [...prev, data as InventoryItem].sort((a, b) => a.item_name.localeCompare(b.item_name)))
            return { success: true }
        } catch (err: any) {
            return { success: false, error: err.message }
        }
    }

    const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
        try {
            const { error } = await (supabase
                .from('inventory_items') as any)
                .update({
                    ...updates,
                    last_updated: new Date().toISOString()
                })
                .eq('id', id)

            if (error) throw error
            setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item))
            return { success: true }
        } catch (err: any) {
            return { success: false, error: err.message }
        }
    }

    const deleteItem = async (id: string) => {
        try {
            const { error } = await (supabase
                .from('inventory_items')
                .delete()
                .eq('id', id) as any)

            if (error) throw error
            setItems(prev => prev.filter(item => item.id !== id))
            return { success: true }
        } catch (err: any) {
            return { success: false, error: err.message }
        }
    }

    const adjustStock = async (id: string, adjustment: number) => {
        const item = items.find(i => i.id === id)
        if (!item) return

        const newQuantity = Math.max(0, Number(item.quantity) + adjustment)
        return updateItem(id, { quantity: newQuantity })
    }

    return {
        items,
        isLoading,
        error,
        fetchInventory,
        addItem,
        updateItem,
        deleteItem,
        adjustStock
    }
}
