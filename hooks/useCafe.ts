'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { Cafe } from '@/types'
import { Database } from '@/types/database'

type CafeInsert = Database['public']['Tables']['cafes']['Insert']
type CafeUpdate = Database['public']['Tables']['cafes']['Update']

export function useCafe() {
    const queryClient = useQueryClient()

    const { data: cafe, isLoading, error } = useQuery({
        queryKey: ['cafe-owner'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return null

            const { data, error } = await supabase
                .from('cafes')
                .select('*')
                .eq('owner_id', user.id)
                .maybeSingle()

            if (error) throw error
            return data as Cafe | null
        }
    })

    const createCafe = useMutation({
        mutationFn: async (newCafe: Omit<CafeInsert, 'owner_id'>) => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data, error } = await supabase
                .from('cafes')
                .insert({
                    ...newCafe,
                    owner_id: user.id
                })
                .select()
                .single()

            if (error) throw error
            return data as Cafe
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cafe-owner'] })
        }
    })

    const updateCafe = useMutation({
        mutationFn: async (updatedCafe: CafeUpdate & { id: string }) => {
            const { data, error } = await supabase
                .from('cafes')
                .update(updatedCafe as any)
                .eq('id', updatedCafe.id)
                .select()
                .single()

            if (error) throw error
            return data as Cafe
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cafe-owner'] })
        }
    })

    return {
        cafe,
        isLoading,
        error,
        createCafe,
        updateCafe
    }
}
