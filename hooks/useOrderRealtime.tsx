'use client'

import React, { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ShoppingBag } from 'lucide-react'
import { pushNotifications } from '@/lib/notifications/push'
import { Cafe } from '@/types'

export function useOrderRealtime(cafe?: Cafe) {
    const cafeId = cafe?.id
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

                    const fetchOrderItems = async (orderId: string) => {
                        const { data } = await supabase
                            .from('order_items')
                            .select('*, menu_items(name)')
                            .eq('order_id', orderId)
                        return data || []
                    }

                    // 1. Handle Notifications for NEW orders
                    if (payload.eventType === 'INSERT') {
                        const orderData = payload.new as any

                        // In-app toast notification
                        toast.success('New Order Received!', {
                            description: `Table ${orderData.table_number} just placed an order for $${Number(orderData.total_amount).toFixed(2)}`,
                            icon: <ShoppingBag className="w-4 h-4 text-orange-500" />,
                            duration: 10000,
                        })

                        // Sound alert
                        try {
                            const audio = new Audio('/notification.mp3')
                            audio.play().catch(e => console.log('Audio play failed:', e))
                        } catch (e) {
                            console.error('Audio setup failed:', e)
                        }

                        // Browser push notification (works even when tab is in background)
                        pushNotifications.notifyNewOrder({
                            tableNumber: orderData.table_number,
                            customerName: orderData.customer_name,
                            totalAmount: orderData.total_amount,
                            itemCount: 1 // We'll fetch items for Telegram
                        }).catch(e => console.log('Push notification failed:', e))

                        // 4. Telegram Notification
                        if (cafe?.telegram_bot_token && cafe?.telegram_chat_id) {
                            fetchOrderItems(orderData.id).then(items => {
                                fetch('/api/notifications/telegram', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        order: orderData,
                                        items: items,
                                        cafe: cafe
                                    })
                                }).catch(e => console.error('Telegram trigger failed:', e))
                            })
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
