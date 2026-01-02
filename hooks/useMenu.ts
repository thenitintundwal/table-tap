'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { MenuItem } from '@/types'
import { Database } from '@/types/database'

type MenuItemInsert = Database['public']['Tables']['menu_items']['Insert']
type MenuItemUpdate = Database['public']['Tables']['menu_items']['Update']

export function useMenu(cafeId?: string) {
    const queryClient = useQueryClient()

    const { data: menuItems, isLoading, error } = useQuery({
        queryKey: ['menu', cafeId],
        queryFn: async () => {
            if (!cafeId) return []
            const { data, error } = await supabase
                .from('menu_items')
                .select('*')
                .eq('cafe_id', cafeId)
                .order('category', { ascending: true })

            if (error) throw error
            return data as MenuItem[]
        },
        enabled: !!cafeId,
    })

    const addItem = useMutation({
        mutationFn: async (newItem: MenuItemInsert) => {
            const { data, error } = await (supabase.from('menu_items') as any)
                .insert(newItem)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu', cafeId] })
        },
    })

    const updateItem = useMutation({
        mutationFn: async ({ id, ...updates }: MenuItemUpdate & { id: string }) => {
            const { data, error } = await (supabase.from('menu_items') as any)
                .update(updates)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu', cafeId] })
        },
    })

    const deleteItem = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('menu_items')
                .delete()
                .eq('id', id)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu', cafeId] })
        },
    })

    const uploadImage = useMutation({
        mutationFn: async (file: File) => {
            if (!cafeId) throw new Error('Cafe ID is required for image upload')

            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${cafeId}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('menu-images')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('menu-images')
                .getPublicUrl(filePath)

            return publicUrl
        }
    })

    return {
        menuItems,
        isLoading,
        error,
        addItem,
        updateItem,
        deleteItem,
        uploadImage,
    }
}
