'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

import { Staff } from '@/types'

export function useStaff(cafeId?: string) {
    const [staff, setStaff] = useState<Staff[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (cafeId) {
            fetchStaff()
        }
    }, [cafeId])

    const fetchStaff = async () => {
        setIsLoading(true)
        const { data, error } = await (supabase
            .from('staff') as any)
            .select('*')
            .eq('cafe_id', cafeId)
            .order('name')

        if (!error && data) {
            setStaff(data as Staff[])
        }
        setIsLoading(false)
    }

    const addStaff = async (newStaff: Partial<Staff>) => {
        const { data, error } = await (supabase
            .from('staff') as any)
            .insert({
                ...newStaff,
                cafe_id: cafeId
            })
            .select()
            .single()

        if (!error && data) {
            setStaff(prev => [...prev, data as Staff])
            return { success: true }
        }
        return { success: false, error: error?.message }
    }

    const removeStaff = async (id: string) => {
        const { error } = await (supabase
            .from('staff') as any)
            .delete()
            .eq('id', id)

        if (!error) {
            setStaff(prev => prev.filter(s => s.id !== id))
            return { success: true }
        }
        return { success: false, error: error?.message }
    }

    return {
        staff,
        isLoading,
        addStaff,
        removeStaff,
        fetchStaff
    }
}
