'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface MenuItemIngredient {
    id: string
    menu_item_id: string
    inventory_item_id: string
    quantity_required: number
    created_at?: string
    inventory_item?: {
        item_name: string
        unit: string
    }
}

export function useRecipes(menuItemId?: string) {
    const [ingredients, setIngredients] = useState<MenuItemIngredient[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (menuItemId) {
            fetchIngredients()
        }
    }, [menuItemId])

    const fetchIngredients = async () => {
        setIsLoading(true)
        const { data, error } = await supabase
            .from('menu_item_ingredients')
            .select(`
                *,
                inventory_item:inventory_items(item_name, unit)
            `)
            .eq('menu_item_id', menuItemId!)

        if (error) {
            console.error('Error fetching ingredients:', error)
        } else {
            setIngredients(data as any[])
        }
        setIsLoading(false)
    }

    const addIngredient = async (ingredient: Omit<MenuItemIngredient, 'id' | 'created_at'>) => {
        const { data, error } = await (supabase.from('menu_item_ingredients') as any)
            .insert(ingredient)
            .select(`
                *,
                inventory_item:inventory_items(item_name, unit)
            `)
            .single()

        if (error) {
            toast.error('Failed to add ingredient')
            throw error
        }

        setIngredients(prev => [...prev, data as any])
        toast.success('Ingredient added')
        return data
    }

    const removeIngredient = async (id: string) => {
        const { error } = await supabase
            .from('menu_item_ingredients')
            .delete()
            .eq('id', id)

        if (error) {
            toast.error('Failed to remove ingredient')
            throw error
        }

        setIngredients(prev => prev.filter(i => i.id !== id))
        toast.success('Ingredient removed')
    }

    return {
        ingredients,
        isLoading,
        addIngredient,
        removeIngredient,
        refresh: fetchIngredients
    }
}
