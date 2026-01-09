'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { PurchaseOrder, PurchaseOrderItem } from '@/types'
import { toast } from 'sonner'

export function usePurchaseOrders(cafeId?: string) {
    const [orders, setOrders] = useState<(PurchaseOrder & { supplier_name?: string, items_count: number })[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (cafeId) {
            fetchOrders()
        }
    }, [cafeId])

    const fetchOrders = async () => {
        setIsLoading(true)
        const { data, error } = await (supabase
            .from('purchase_orders')
            .select(`
                *,
                suppliers (name),
                purchase_order_items (count)
            `)
            .eq('cafe_id', cafeId!)
            .order('created_at', { ascending: false }) as any)

        if (error) {
            console.error('Error fetching purchase orders:', error)
            toast.error('Failed to load purchase orders')
        } else {
            const formattedOrders = (data as any[]).map(order => ({
                ...order,
                supplier_name: order.suppliers?.name,
                items_count: order.purchase_order_items?.[0]?.count || 0
            }))
            setOrders(formattedOrders)
        }
        setIsLoading(false)
    }

    const createOrder = async (orderData: Partial<PurchaseOrder>, items: Partial<PurchaseOrderItem>[]) => {
        try {
            // Generate order number (simple format PO-YYYYMMDD-XXXX)
            const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
            const random = Math.floor(1000 + Math.random() * 9000)
            const orderNumber = `PO-${date}-${random}`

            const { data: order, error: orderError } = await (supabase
                .from('purchase_orders') as any)
                .insert({
                    ...orderData,
                    cafe_id: cafeId!,
                    order_number: orderNumber,
                    status: 'pending'
                })
                .select()
                .single()

            if (orderError) throw orderError

            if (items.length > 0) {
                const formattedItems = items.map(item => ({
                    ...item,
                    purchase_order_id: (order as any).id
                }))

                const { error: itemsError } = await (supabase
                    .from('purchase_order_items') as any)
                    .insert(formattedItems)

                if (itemsError) throw itemsError
            }

            toast.success('Purchase order created successfully')
            fetchOrders()
            return order
        } catch (error: any) {
            console.error('Error creating purchase order:', error)
            toast.error(error.message || 'Failed to create purchase order')
            return null
        }
    }

    const updateOrderStatus = async (orderId: string, status: PurchaseOrder['status']) => {
        const { error } = await (supabase
            .from('purchase_orders') as any)
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', orderId)

        if (error) {
            toast.error('Failed to update order status')
        } else {
            toast.success(`Order marked as ${status}`)
            fetchOrders()

            // If delivered, we should ideally update inventory levels
            if (status === 'delivered') {
                await updateInventoryFromOrder(orderId)
            }
        }
    }

    const updateInventoryFromOrder = async (orderId: string) => {
        // Fetch items for this order
        const { data: items, error: fetchError } = await (supabase
            .from('purchase_order_items')
            .select('inventory_item_id, quantity')
            .eq('purchase_order_id', orderId) as any)

        if (fetchError || !items) return

        // Update each inventory item
        for (const item of items as any[]) {
            if (item.inventory_item_id) {
                const { data: currentItem } = await (supabase
                    .from('inventory_items')
                    .select('quantity')
                    .eq('id', item.inventory_item_id)
                    .single() as any)

                if (currentItem) {
                    const currentQty = (currentItem as any).quantity
                    await (supabase
                        .from('inventory_items') as any)
                        .update({ quantity: Number(currentQty) + Number(item.quantity) })
                        .eq('id', item.inventory_item_id)
                }
            }
        }
    }

    const deleteOrder = async (orderId: string) => {
        const { error } = await (supabase
            .from('purchase_orders')
            .delete()
            .eq('id', orderId) as any)

        if (error) {
            toast.error('Failed to delete purchase order')
        } else {
            toast.success('Order deleted')
            fetchOrders()
        }
    }

    return {
        orders,
        isLoading,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        refresh: fetchOrders
    }
}
