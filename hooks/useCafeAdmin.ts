'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

import { Cafe } from '@/types'

export function useCafeAdmin() {
    const queryClient = useQueryClient()

    const { data: cafes, isLoading } = useQuery({
        queryKey: ['admin-cafes'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('cafes')
                .select('*')
                .order('created_at', { ascending: false })
                .returns<Cafe[]>()

            if (error) throw error
            return data
        }
    })

    const updateSubscription = useMutation({
        mutationFn: async ({ cafeId, plan }: { cafeId: string, plan: 'basic' | 'pro' }) => {
            const { error } = await (supabase.from('cafes') as any)
                .update({ subscription_plan: plan })
                .eq('id', cafeId)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-cafes'] })
            queryClient.invalidateQueries({ queryKey: ['cafe'] }) // Refresh individual cafe data too if needed
        }
    })

    return {
        cafes,
        isLoading,
        updateSubscription
    }
}
