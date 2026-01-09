'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { StaffShift } from '@/types'

export function useShifts(cafeId?: string) {
    const queryClient = useQueryClient()

    const { data: shifts, isLoading } = useQuery({
        queryKey: ['shifts', cafeId],
        enabled: !!cafeId,
        queryFn: async () => {
            const { data, error } = await (supabase.from('staff_shifts') as any)
                .select('*')
                .eq('cafe_id', cafeId!)
                .order('start_time', { ascending: true })

            if (error) throw error
            return data as StaffShift[]
        }
    })

    const addShift = useMutation({
        mutationFn: async (newShift: Omit<StaffShift, 'id' | 'created_at' | 'cafe_id'>) => {
            const { data, error } = await (supabase.from('staff_shifts') as any)
                .insert({
                    ...newShift,
                    cafe_id: cafeId
                })
                .select()
                .single()

            if (error) throw error
            return data as StaffShift
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shifts', cafeId] })
        }
    })

    const deleteShift = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await (supabase.from('staff_shifts') as any)
                .delete()
                .eq('id', id)

            if (error) throw error
            return id
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shifts', cafeId] })
        }
    })

    return {
        shifts,
        isLoading,
        addShift,
        deleteShift
    }
}
