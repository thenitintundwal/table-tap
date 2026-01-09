'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Supplier } from '@/types'
import { toast } from 'sonner'

export function useSuppliers(cafeId?: string) {
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (cafeId) {
            fetchSuppliers()
        }
    }, [cafeId])

    const fetchSuppliers = async () => {
        setIsLoading(true)
        const { data, error } = await supabase
            .from('suppliers')
            .select('*')
            .eq('cafe_id', cafeId!)
            .order('name', { ascending: true })

        if (!error && data) {
            setSuppliers(data as Supplier[])
        }
        setIsLoading(false)
    }

    const addSupplier = async (supplier: Omit<Supplier, 'id' | 'created_at'>) => {
        const { data, error } = await (supabase.from('suppliers') as any)
            .insert(supplier)
            .select()
            .single()

        if (error) {
            toast.error('Failed to add supplier')
            throw error
        }

        toast.success('Supplier added successfully')
        fetchSuppliers()
        return data
    }

    const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
        const { error } = await (supabase.from('suppliers') as any)
            .update(updates)
            .eq('id', id)

        if (error) {
            toast.error('Failed to update supplier')
            throw error
        }

        toast.success('Supplier updated')
        fetchSuppliers()
    }

    const deleteSupplier = async (id: string) => {
        const { error } = await supabase
            .from('suppliers')
            .delete()
            .eq('id', id)

        if (error) {
            toast.error('Failed to delete supplier')
            throw error
        }

        toast.success('Supplier deleted')
        fetchSuppliers()
    }

    const toggleActive = async (id: string, isActive: boolean) => {
        await updateSupplier(id, { is_active: !isActive })
    }

    return {
        suppliers,
        isLoading,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        toggleActive,
        refresh: fetchSuppliers
    }
}
