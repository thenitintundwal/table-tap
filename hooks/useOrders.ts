'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { Order, OrderItem } from '@/types'

export function useOrders(cafeId?: string) {
    const queryClient = useQueryClient()

    const { data: orders, isLoading } = useQuery({
        queryKey: ['orders', cafeId],
        queryFn: async () => {
            if (!cafeId) return []
            const { data, error } = await (supabase.from('orders') as any)
                .select(`
          *,
          order_items (
            *,
            menu_items (*)
          )
        `)
                .eq('cafe_id', cafeId)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data as any[]
        },
        enabled: !!cafeId,
        refetchInterval: 2000,
        staleTime: 0,
    })

    const updateStatus = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: Order['status'] }) => {
            const { error } = await (supabase.from('orders') as any)
                .update({ status })
                .eq('id', id)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ['orders', cafeId] })
            queryClient.refetchQueries({ queryKey: ['stats', cafeId] })
            queryClient.invalidateQueries({ queryKey: ['accounts-metrics', cafeId] })
            queryClient.invalidateQueries({ queryKey: ['accounts-trend', cafeId] })
            queryClient.invalidateQueries({ queryKey: ['financial-parties', cafeId] })
        },
    })

    return {
        orders,
        isLoading,
        updateStatus,
    }
}
