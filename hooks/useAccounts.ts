'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { Invoice, BusinessExpense, AccountsLedger, FinancialParty } from '@/types'

export function useAccounts(cafeId?: string) {
    const queryClient = useQueryClient()

    // 1. Fetch Financial Overview Metrics
    const { data: metrics, isLoading: isMetricsLoading } = useQuery({
        queryKey: ['accounts-metrics', cafeId],
        enabled: !!cafeId,
        queryFn: async () => {
            const now = new Date()
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

            // Total Sales
            const { data: sales } = await supabase
                .from('invoices')
                .select('total_amount')
                .eq('cafe_id', cafeId!)
                .eq('type', 'sales')
                .gte('invoice_date', startOfMonth)

            // Total Purchase
            const { data: purchases } = await supabase
                .from('invoices')
                .select('total_amount')
                .eq('cafe_id', cafeId!)
                .eq('type', 'purchase')
                .gte('invoice_date', startOfMonth)

            // Receivables (From financial_party)
            const { data: parties } = await supabase
                .from('financial_parties')
                .select('outstanding_balance')
                .eq('cafe_id', cafeId!)

            const totalSales = (sales as any[])?.reduce((sum, i) => sum + Number(i.total_amount), 0) || 0
            const totalPurchase = (purchases as any[])?.reduce((sum, i) => sum + Number(i.total_amount), 0) || 0

            const receivables = (parties as any[])?.filter(p => Number(p.outstanding_balance) < 0)
                .reduce((sum, p) => sum + Math.abs(Number(p.outstanding_balance)), 0) || 0

            const payables = (parties as any[])?.filter(p => Number(p.outstanding_balance) > 0)
                .reduce((sum, p) => sum + Number(p.outstanding_balance), 0) || 0

            return {
                totalSales,
                totalPurchase,
                receivables,
                payables,
                salesGrowth: 5, // Placeholder
                purchaseGrowth: 2, // Placeholder
                receivableGrowth: 10, // Placeholder
                payableGrowth: -5 // Placeholder
            }
        }
    })

    // 2. Fetch Trend Data for Charts
    const { data: trendData, isLoading: isTrendLoading } = useQuery({
        queryKey: ['accounts-trend', cafeId],
        enabled: !!cafeId,
        queryFn: async () => {
            const { data: invoices } = await supabase
                .from('invoices')
                .select('total_amount, type, invoice_date')
                .eq('cafe_id', cafeId!)
                .order('invoice_date', { ascending: true })

            const { data: expenses } = await supabase
                .from('business_expenses')
                .select('amount, date')
                .eq('cafe_id', cafeId!)
                .order('date', { ascending: true })

            // Process into chart format (grouped by date)
            const dailyData: Record<string, { sales: number; purchase: number; expense: number }> = {}

            invoices?.forEach((inv: any) => {
                const date = inv.invoice_date
                if (!dailyData[date]) dailyData[date] = { sales: 0, purchase: 0, expense: 0 }
                if (inv.type === 'sales') dailyData[date].sales += Number(inv.total_amount)
                else dailyData[date].purchase += Number(inv.total_amount)
            })

            expenses?.forEach((exp: any) => {
                const date = exp.date
                if (!dailyData[date]) dailyData[date] = { sales: 0, purchase: 0, expense: 0 }
                dailyData[date].expense += Number(exp.amount)
            })

            return Object.entries(dailyData).map(([date, values]) => ({
                date,
                ...values
            }))
        }
    })

    // 3. Fetch Ledger (Cash/Bank)
    const { data: ledger, isLoading: isLedgerLoading } = useQuery({
        queryKey: ['accounts-ledger', cafeId],
        enabled: !!cafeId,
        queryFn: async () => {
            const { data, error } = await (supabase.from('accounts_ledger') as any)
                .select('*')
                .eq('cafe_id', cafeId!)

            if (error) throw error
            return data as AccountsLedger[]
        }
    })

    // 4. Mutations
    const addInvoice = useMutation({
        mutationFn: async (newInvoice: Omit<Invoice, 'id' | 'created_at' | 'cafe_id'>) => {
            const { data, error } = await (supabase.from('invoices') as any)
                .insert({ ...newInvoice, cafe_id: cafeId })
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts-metrics', cafeId] })
            queryClient.invalidateQueries({ queryKey: ['accounts-trend', cafeId] })
        }
    })

    const addExpense = useMutation({
        mutationFn: async (newExpense: Omit<BusinessExpense, 'id' | 'created_at' | 'cafe_id'>) => {
            const { data, error } = await (supabase.from('business_expenses') as any)
                .insert({ ...newExpense, cafe_id: cafeId })
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts-metrics', cafeId] })
            queryClient.invalidateQueries({ queryKey: ['accounts-trend', cafeId] })
        }
    })

    return {
        metrics,
        isMetricsLoading,
        trendData,
        isTrendLoading,
        ledger,
        isLedgerLoading,
        addInvoice,
        addExpense
    }
}
