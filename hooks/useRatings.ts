'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export type DishRating = {
    menu_item_id: string
    order_id: string
    rating: number
    comment?: string
    created_at?: string
}

export function useRatings() {
    const submitRatings = useMutation({
        mutationFn: async (ratings: DishRating[]) => {
            const { error } = await (supabase.from('ratings') as any)
                .insert(ratings.map(r => ({
                    menu_item_id: r.menu_item_id,
                    order_id: r.order_id,
                    rating: r.rating,
                    comment: r.comment || null
                })))

            if (error) throw error
        },
        onSuccess: () => {
            toast.success('Thank you for your feedback!')
        },
        onError: (error) => {
            console.error('Rating submission failed:', error)
            toast.error('Failed to submit feedback. Please try again.')
        }
    })

    return {
        submitRatings
    }
}

export function useItemRatings(itemId: string) {
    return useQuery({
        queryKey: ['item-ratings', itemId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('ratings')
                .select('*')
                .eq('menu_item_id', itemId)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data as DishRating[]
        },
        enabled: !!itemId
    })
}

export function useItemStats(itemId: string) {
    return useQuery({
        queryKey: ['item-rating-stats', itemId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('ratings')
                .select('rating')
                .eq('menu_item_id', itemId)

            if (error) throw error

            const ratingsData = data as { rating: number }[] | null
            if (!ratingsData || ratingsData.length === 0) {
                return { average: 0, count: 0 }
            }

            const sum = ratingsData.reduce((acc, curr) => acc + curr.rating, 0)
            return {
                average: sum / ratingsData.length,
                count: ratingsData.length
            }
        },
        enabled: !!itemId
    })
}
