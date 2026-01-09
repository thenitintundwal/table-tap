'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { Staff, StaffAttendance, StaffShift, PayrollRecord } from '@/types'

export function usePayroll(cafeId?: string) {
    const queryClient = useQueryClient()

    // 1. Fetch Staff Metrics (Petpooja style)
    const { data: metrics, isLoading: isMetricsLoading } = useQuery({
        queryKey: ['payroll-metrics', cafeId],
        enabled: !!cafeId,
        queryFn: async () => {
            const today = new Date().toISOString().split('T')[0]

            // Total Employees
            const { count: totalEmployees } = await supabase
                .from('staff')
                .select('*', { count: 'exact', head: true })
                .eq('cafe_id', cafeId!)

            // Currently Working (Checked in today but not checked out)
            const { data: attendance } = await supabase
                .from('staff_attendance')
                .select('*')
                .eq('cafe_id', cafeId!)
                .gte('check_in', `${today}T00:00:00Z`)
                .is('check_out', null)

            // On Break
            const onBreak = (attendance as StaffAttendance[])?.filter(a => a.status === 'on_break').length || 0
            const currentlyWorking = (attendance?.length || 0) - onBreak

            // Time Off / On Leave
            const { count: onLeave } = await supabase
                .from('staff_attendance')
                .select('*', { count: 'exact', head: true })
                .eq('cafe_id', cafeId!)
                .gte('check_in', `${today}T00:00:00Z`)
                .eq('status', 'on_leave')

            return {
                totalEmployees: totalEmployees || 0,
                currentlyWorking,
                onBreak,
                onLeave: onLeave || 0,
                pendingBiometrics: 0 // Placeholder
            }
        }
    })

    // 2. Fetch Attendance for Table
    const { data: recentAttendance, isLoading: isAttendanceLoading } = useQuery({
        queryKey: ['recent-attendance', cafeId],
        enabled: !!cafeId,
        queryFn: async () => {
            const today = new Date().toISOString().split('T')[0]
            const { data, error } = await (supabase.from('staff_attendance') as any)
                .select('*, staff(*), staff_shifts(*)')
                .eq('cafe_id', cafeId!)
                .gte('created_at', `${today}T00:00:00Z`)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data
        }
    })

    // 3. Fetch Staff Advances
    const { data: advances, isLoading: isAdvancesLoading } = useQuery({
        queryKey: ['staff-advances', cafeId],
        enabled: !!cafeId,
        queryFn: async () => {
            const { data, error } = await (supabase.from('staff_advances') as any)
                .select('*, staff(*)')
                .eq('cafe_id', cafeId!)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data
        }
    })

    // 4. Fetch Payroll History
    const { data: payrollHistory, isLoading: isPayrollLoading } = useQuery({
        queryKey: ['payroll-history', cafeId],
        enabled: !!cafeId,
        queryFn: async () => {
            const { data, error } = await (supabase.from('payroll_records') as any)
                .select('*, staff(*)')
                .eq('cafe_id', cafeId!)
                .order('period_start', { ascending: false })

            if (error) throw error
            return data
        }
    })

    // 5. Attendance Mutations
    const checkIn = useMutation({
        mutationFn: async ({ staffId, shiftId }: { staffId: string; shiftId?: string }) => {
            const { data, error } = await (supabase.from('staff_attendance') as any)
                .insert({
                    cafe_id: cafeId,
                    staff_id: staffId,
                    shift_id: shiftId,
                    check_in: new Date().toISOString(),
                    status: 'present'
                })
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payroll-metrics', cafeId] })
            queryClient.invalidateQueries({ queryKey: ['recent-attendance', cafeId] })
        }
    })

    const checkOut = useMutation({
        mutationFn: async (attendanceId: string) => {
            const { data, error } = await (supabase.from('staff_attendance') as any)
                .update({
                    check_out: new Date().toISOString(),
                    status: 'present'
                })
                .eq('id', attendanceId)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payroll-metrics', cafeId] })
            queryClient.invalidateQueries({ queryKey: ['recent-attendance', cafeId] })
        }
    })

    const toggleBreak = useMutation({
        mutationFn: async ({ attendanceId, onBreak }: { attendanceId: string; onBreak: boolean }) => {
            const { data, error } = await (supabase.from('staff_attendance') as any)
                .update({
                    status: onBreak ? 'on_break' : 'present'
                })
                .eq('id', attendanceId)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payroll-metrics', cafeId] })
            queryClient.invalidateQueries({ queryKey: ['recent-attendance', cafeId] })
        }
    })

    const addAdvance = useMutation({
        mutationFn: async (newAdvance: { staff_id: string; amount: number; reason: string }) => {
            const { data, error } = await (supabase.from('staff_advances') as any)
                .insert({
                    ...newAdvance,
                    cafe_id: cafeId,
                    status: 'paid'
                })
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff-advances', cafeId] })
        }
    })

    const runPayroll = useMutation({
        mutationFn: async ({ periodStart, periodEnd }: { periodStart: string; periodEnd: string }) => {
            // 1. Fetch all staff
            const { data: staffList } = await (supabase.from('staff') as any)
                .select('*')
                .eq('cafe_id', cafeId!)

            if (!staffList) return

            // 2. Fetch pending advances to deduct
            const { data: pendingAdvances } = await (supabase.from('staff_advances') as any)
                .select('*')
                .eq('cafe_id', cafeId!)
                .eq('status', 'paid')

            const payrollEntries = staffList.map((member: any) => {
                const memberAdvances = pendingAdvances?.filter((a: any) => a.staff_id === member.id) || []
                const totalDeductions = memberAdvances.reduce((sum: number, a: any) => sum + Number(a.amount), 0)
                const baseSalary = Number(member.monthly_salary) || 0

                return {
                    cafe_id: cafeId,
                    staff_id: member.id,
                    period_start: periodStart,
                    period_end: periodEnd,
                    base_salary: baseSalary,
                    bonus: 0,
                    deductions: totalDeductions,
                    net_pay: baseSalary - totalDeductions,
                    status: 'paid',
                    processed_at: new Date().toISOString()
                }
            })

            const { data, error } = await (supabase.from('payroll_records') as any)
                .insert(payrollEntries)
                .select()

            if (error) throw error

            // 3. Mark advances as recovered
            const advanceIds = pendingAdvances?.map((a: any) => a.id) || []
            if (advanceIds.length > 0) {
                await (supabase.from('staff_advances') as any)
                    .update({ status: 'recovered' })
                    .in('id', advanceIds)
            }

            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payroll-history', cafeId] })
            queryClient.invalidateQueries({ queryKey: ['staff-advances', cafeId] })
        }
    })

    return {
        metrics,
        isMetricsLoading,
        recentAttendance,
        isAttendanceLoading,
        advances,
        isAdvancesLoading,
        payrollHistory,
        isPayrollLoading,
        checkIn,
        checkOut,
        toggleBreak,
        addAdvance,
        runPayroll
    }
}
