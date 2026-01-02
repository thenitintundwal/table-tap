'use client'

import React, { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ShoppingBag } from 'lucide-react'

export function useOrderRealtime(cafeId?: string) {
    const queryClient = useQueryClient()

    useEffect(() => {
        if (!cafeId) return

        // Subscribe to changes in the orders table
        const channel = supabase
            .channel(`public:orders:cafe_id=eq.${cafeId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `cafe_id=eq.${cafeId}`
                },
                (payload) => {
                    console.log(`[REALTIME] ${payload.eventType} event detected for cafe ${cafeId}`)

                    // 1. Handle Notifications for NEW orders
                    if (payload.eventType === 'INSERT') {
                        toast.success('New Order Received!', {
                            description: `Table ${payload.new.table_number} just placed an order for $${Number(payload.new.total_amount).toFixed(2)}`,
                            icon: <ShoppingBag className="w-4 h-4 text-orange-500" />,
                            duration: 10000,
                        })

                        try {
                            const audio = new Audio('/notification.mp3')
                            audio.play().catch(e => console.log('Audio play failed:', e))
                        } catch (e) {
                            console.error('Audio setup failed:', e)
                        }
                    }

                    // 2. High-Priority Dashboard Re-Sync
                    // We invalidate and refetch simultaneously to kill any cache and force fresh data
                    // This ensures "Active Orders" count on Overview is perfectly in sync with the Orders list
                    queryClient.invalidateQueries({ queryKey: ['orders', cafeId] })
                    queryClient.invalidateQueries({ queryKey: ['stats', cafeId] })
                    queryClient.refetchQueries({ queryKey: ['orders', cafeId] })
                    queryClient.refetchQueries({ queryKey: ['stats', cafeId] })

                    console.log(`[REALTIME] Dashboard parity forced for cafe ${cafeId}`)
                }
            )
            .subscribe((status) => {
                console.log(`[REALTIME] Subscription status for ${cafeId}:`, status)
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [cafeId, queryClient])
}
