'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface CafeTable {
    id: string
    cafe_id: string
    table_number: number
    section: string
    capacity: number
    status: 'available' | 'occupied' | 'reserved' | 'cleaning'
    current_order_id?: string
    x_position: number
    y_position: number
    created_at: string
}

export function useTables(cafeId?: string) {
    const [tables, setTables] = useState<CafeTable[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isGenerating, setIsGenerating] = useState(false)

    useEffect(() => {
        if (cafeId) {
            fetchTables()
        }
    }, [cafeId])

    const fetchTables = async () => {
        if (isGenerating) return
        setIsLoading(true)

        try {
            const { data, error } = await supabase
                .from('cafe_tables')
                .select('*')
                .eq('cafe_id', cafeId!)
                .order('section', { ascending: true })
                .order('table_number', { ascending: true })

            if (!error && data && data.length > 0) {
                setTables(data as CafeTable[])
            } else if (!error && data && data.length === 0) {
                // Only generate if we are sure it's empty
                await generateDefaultTables()
            }
        } catch (e) {
            // If table doesn't exist in DB, generate client-side defaults
            console.log('cafe_tables table not found, using default layout')
            generateClientSideTables()
        }

        setIsLoading(false)
    }

    const generateClientSideTables = () => {
        const defaultTables: CafeTable[] = []

        // AC Section - 28 tables
        for (let i = 1; i <= 28; i++) {
            defaultTables.push({
                id: `ac-${i}`,
                cafe_id: cafeId!,
                table_number: i,
                section: 'ac',
                capacity: 4,
                status: 'available',
                x_position: 0,
                y_position: 0,
                created_at: new Date().toISOString()
            })
        }

        // Non-AC Section - 9 tables
        for (let i = 1; i <= 9; i++) {
            defaultTables.push({
                id: `non_ac-${i}`,
                cafe_id: cafeId!,
                table_number: i,
                section: 'non_ac',
                capacity: 4,
                status: 'available',
                x_position: 0,
                y_position: 0,
                created_at: new Date().toISOString()
            })
        }

        // Bar Section - 5 tables
        for (let i = 1; i <= 5; i++) {
            defaultTables.push({
                id: `bar-${i}`,
                cafe_id: cafeId!,
                table_number: i,
                section: 'bar',
                capacity: 2,
                status: 'available',
                x_position: 0,
                y_position: 0,
                created_at: new Date().toISOString()
            })
        }

        setTables(defaultTables)
    }

    const generateDefaultTables = async () => {
        if (!cafeId || isGenerating) return
        setIsGenerating(true)

        const defaultTables: Omit<CafeTable, 'id' | 'created_at'>[] = []

        // AC Section - 28 tables
        for (let i = 1; i <= 28; i++) {
            defaultTables.push({
                cafe_id: cafeId,
                table_number: i,
                section: 'ac',
                capacity: 4,
                status: 'available',
                x_position: 0,
                y_position: 0
            })
        }

        // Non-AC Section - 9 tables
        for (let i = 1; i <= 9; i++) {
            defaultTables.push({
                cafe_id: cafeId,
                table_number: i,
                section: 'non_ac',
                capacity: 4,
                status: 'available',
                x_position: 0,
                y_position: 0
            })
        }

        // Bar Section - 5 tables
        for (let i = 1; i <= 5; i++) {
            defaultTables.push({
                cafe_id: cafeId,
                table_number: i,
                section: 'bar',
                capacity: 2,
                status: 'available',
                x_position: 0,
                y_position: 0
            })
        }

        try {
            // Using upsert with conflict target to avoid 409 errors
            const { data, error } = await (supabase.from('cafe_tables') as any)
                .upsert(defaultTables, { onConflict: 'cafe_id,section,table_number' })
                .select()

            if (!error && data) {
                setTables(data)
                toast.success('Default table layout created')
            } else if (error) {
                console.error('Upsert error:', error)
            }
        } catch (e) {
            console.error('Failed to create default tables:', e)
        } finally {
            setIsGenerating(false)
        }
    }

    const updateTableStatus = async (tableId: string, status: CafeTable['status']) => {
        const { error } = await (supabase.from('cafe_tables') as any)
            .update({ status })
            .eq('id', tableId)

        if (!error) {
            fetchTables()
        }
    }

    const assignOrderToTable = async (tableId: string, orderId: string) => {
        const { error } = await (supabase.from('cafe_tables') as any)
            .update({
                current_order_id: orderId,
                status: 'occupied'
            })
            .eq('id', tableId)

        if (!error) {
            fetchTables()
        }
    }

    const clearTable = async (tableId: string) => {
        const { error } = await (supabase.from('cafe_tables') as any)
            .update({
                current_order_id: null,
                status: 'available'
            })
            .eq('id', tableId)

        if (!error) {
            toast.success('Table cleared')
            fetchTables()
        }
    }

    return {
        tables,
        isLoading,
        updateTableStatus,
        assignOrderToTable,
        clearTable,
        refresh: fetchTables
    }
}
