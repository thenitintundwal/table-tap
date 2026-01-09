'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { InventoryLog } from '@/types'

export function useInventoryLogs(cafeId?: string, inventoryItemId?: string) {
    const [logs, setLogs] = useState<(InventoryLog & { inventory_item?: { item_name: string } })[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (cafeId) {
            fetchLogs()
        }
    }, [cafeId, inventoryItemId])

    const fetchLogs = async () => {
        setIsLoading(true)
        let query = supabase
            .from('inventory_logs')
            .select(`
                *,
                inventory_item:inventory_items(item_name)
            `)
            .eq('cafe_id', cafeId!)
            .order('created_at', { ascending: false })
            .limit(50)

        if (inventoryItemId) {
            query = query.eq('inventory_item_id', inventoryItemId)
        }

        const { data, error } = await (query as any)

        if (!error && data) {
            setLogs(data)
        }
        setIsLoading(false)
    }

    return {
        logs,
        isLoading,
        refresh: fetchLogs
    }
}
