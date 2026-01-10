'use client'

import { useState } from 'react'
import {
    Users,
    UserCheck,
    Coffee,
    Plane,
    Fingerprint,
    Clock,
    Search,
    Filter,
    ArrowUpRight,
    Building2,
    Calendar,
    ChevronDown,
    X,
    CheckCircle2,
    LogOut,
    Plus
} from 'lucide-react'
import { usePayroll } from '@/hooks/usePayroll'
import { useShifts } from '@/hooks/useShifts'
import { useStaff } from '@/hooks/useStaff'
import { useCafe } from '@/hooks/useCafe'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { toast } from 'sonner'
import { Staff, StaffAdvance } from '@/types'

export default function PayrollDashboard() {
    const { cafe } = useCafe()
    const { metrics, recentAttendance, isMetricsLoading, isAttendanceLoading, advances, isAdvancesLoading, payrollHistory, isPayrollLoading, checkIn, checkOut, addAdvance, runPayroll } = usePayroll(cafe?.id)
    const { shifts } = useShifts(cafe?.id)
    const { staff } = useStaff(cafe?.id)
    const [activeShiftTab, setActiveShiftTab] = useState('All')
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)
    const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false)
    const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false)
    const [activeMainTab, setActiveMainTab] = useState<'attendance' | 'advances' | 'salary'>('attendance')

    const stats = [
        { label: 'Total Employees', value: metrics?.totalEmployees || 0, icon: Users, color: 'blue' },
        { label: 'Currently Working', value: metrics?.currentlyWorking || 0, icon: UserCheck, color: 'emerald' },
        { label: 'On Break', value: metrics?.onBreak || 0, icon: Coffee, color: 'orange' },
        { label: 'Time Off', value: metrics?.onLeave || 0, icon: Plane, color: 'purple' },
        { label: 'Pending Biometrics', value: 12, icon: Fingerprint, color: 'rose' },
    ]

    const handleCheckIn = async (staffId: string) => {
        try {
            await checkIn.mutateAsync({ staffId })
            toast.success('Staff checked in successfully')
            setIsAttendanceModalOpen(false)
        } catch (error) {
            toast.error('Failed to check in staff')
        }
    }

    const handleCheckOut = async (attendanceId: string) => {
        try {
            await checkOut.mutateAsync(attendanceId)
            toast.success('Staff checked out successfully')
        } catch (error) {
            toast.error('Failed to check out staff')
        }
    }

    const shiftTabs = ['All', 'Morning Shift', 'Noon Shift', 'Evening Shift', 'Night Shift']

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-orange-600/10 dark:bg-orange-500/10 rounded-2xl border border-orange-600/10">
                            <Users className="w-6 h-6 text-orange-600 dark:text-orange-500" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase italic">Staff Command & Payroll</h1>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg">Real-time attendance tracking and payroll intelligence.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsAdvanceModalOpen(true)}
                        className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-6 py-3.5 rounded-2xl text-[10px] font-black text-zinc-600 dark:text-zinc-400 flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-white/10 transition-all shadow-sm uppercase tracking-widest active:scale-95"
                    >
                        <Plane className="w-5 h-5 text-rose-500" />
                        Staff Advance
                    </button>
                    <button
                        onClick={() => setIsPayrollModalOpen(true)}
                        className="bg-zinc-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-950 px-8 py-3.5 rounded-2xl font-black text-[10px] shadow-xl shadow-black/10 dark:shadow-white/5 transition-all active:scale-95 uppercase italic tracking-widest"
                    >
                        Run Payroll
                    </button>
                </div>
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-white/10 p-6 rounded-[2rem] group hover:border-orange-500/30 transition-all shadow-sm dark:shadow-none relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-orange-500/10 transition-all"></div>
                        <div className="flex items-center justify-between mb-5 relative z-10">
                            <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-500 ring-1 ring-${stat.color}-500/20 shadow-sm`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600 group-hover:text-orange-500 transition-colors" />
                        </div>
                        <div className="space-y-1 relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">{stat.label}</p>
                            <h3 className="text-4xl font-black text-zinc-900 dark:text-white italic tracking-tighter">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Attendance Summary */}
            <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/50 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-sm shadow-black/5">
                <div className="p-8 border-b border-zinc-100 dark:border-white/5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                        <div className="flex items-center gap-10">
                            <button
                                onClick={() => setActiveMainTab('attendance')}
                                className={`text-2xl font-black uppercase italic tracking-tighter transition-all ${activeMainTab === 'attendance' ? 'text-zinc-900 dark:text-white border-b-4 border-orange-500 pb-1' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                            >
                                Attendance
                            </button>
                            <button
                                onClick={() => setActiveMainTab('advances')}
                                className={`text-2xl font-black uppercase italic tracking-tighter transition-all ${activeMainTab === 'advances' ? 'text-zinc-900 dark:text-white border-b-4 border-orange-500 pb-1' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                            >
                                Advances
                            </button>
                            <button
                                onClick={() => setActiveMainTab('salary')}
                                className={`text-2xl font-black uppercase italic tracking-tighter transition-all ${activeMainTab === 'salary' ? 'text-zinc-900 dark:text-white border-b-4 border-orange-500 pb-1' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                            >
                                Salary History
                            </button>
                        </div>
                        {activeMainTab === 'attendance' && (
                            <div className="flex items-center gap-2 p-2 bg-zinc-100 dark:bg-black/40 rounded-[1.5rem] border border-zinc-200 dark:border-white/5 w-fit">
                                {shiftTabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveShiftTab(tab)}
                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeShiftTab === tab
                                            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-lg'
                                            : 'text-zinc-400 hover:text-orange-600 dark:hover:text-orange-500'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {activeMainTab === 'attendance' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-orange-50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/20 p-8 rounded-[2rem] flex items-center justify-between group hover:border-orange-500/30 transition-all shadow-sm">
                                <div>
                                    <h4 className="text-4xl font-black text-orange-600 dark:text-orange-500 mb-1 italic">{metrics?.currentlyWorking || 0}</h4>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600/60 dark:text-orange-500/60">Checked In</p>
                                </div>
                                <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20 shadow-sm">
                                    <UserCheck className="w-8 h-8 text-orange-500" />
                                </div>
                            </div>
                            <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-8 rounded-[2rem] flex items-center justify-between group hover:border-zinc-300 transition-all shadow-sm">
                                <div>
                                    <h4 className="text-4xl font-black text-zinc-900 dark:text-white mb-1 italic">06</h4>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Not In Yet</p>
                                </div>
                                <div className="p-4 bg-zinc-100 dark:bg-white/10 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm">
                                    <Clock className="w-8 h-8 text-zinc-400" />
                                </div>
                            </div>
                            <div className="bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 p-8 rounded-[2rem] flex items-center justify-between group hover:border-rose-500/30 transition-all shadow-sm">
                                <div>
                                    <h4 className="text-4xl font-black text-rose-500 mb-1 italic">{metrics?.onLeave || 0}</h4>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500/60">On Leave</p>
                                </div>
                                <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-200 dark:border-purple-500/20 shadow-sm">
                                    <Plane className="w-8 h-8 text-rose-500" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeMainTab === 'advances' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 p-8 rounded-[2rem] flex items-center justify-between shadow-sm">
                                <div>
                                    <h4 className="text-4xl font-black text-rose-500 mb-1 italic">
                                        ₹{advances?.reduce((sum: number, a: any) => sum + (a.status === 'paid' ? Number(a.amount) : 0), 0) || 0}
                                    </h4>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500/60">Pending Recovery</p>
                                </div>
                                <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 shadow-sm">
                                    <ArrowUpRight className="w-8 h-8 text-rose-500" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    {activeMainTab === 'attendance' && (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-zinc-100 dark:border-white/5">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Emp ID</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Name</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Dept.</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Designation</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Total Hours</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-white/5">
                                {recentAttendance?.map((entry: any, i: number) => (
                                    <tr key={entry.id} className="group hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-mono font-bold text-zinc-400">#{(i + 1).toString().padStart(4, '0')}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center font-black text-zinc-900 dark:text-white italic text-lg shadow-sm">
                                                    {entry.staff?.name?.[0]}
                                                </div>
                                                <span className="font-black text-zinc-900 dark:text-white uppercase tracking-tight text-sm">{entry.staff?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-bold text-zinc-500 dark:text-zinc-400">{entry.staff?.department || 'Operations'}</td>
                                        <td className="px-8 py-6 text-sm font-bold text-zinc-500 dark:text-zinc-400">{entry.staff?.designation || entry.staff?.role}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-black ${entry.check_out ? 'text-zinc-400' : 'text-orange-500 italic'}`}>
                                                    {entry.check_out ? 'Completed' : 'Working...'}
                                                </span>
                                                <div className={`w-2 h-2 rounded-full ${entry.check_out ? 'bg-zinc-200' : 'bg-orange-500 animate-pulse'} shadow-sm`} />
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {!entry.check_out && (
                                                <button
                                                    onClick={() => handleCheckOut(entry.id)}
                                                    className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all flex items-center gap-2 ml-auto bg-rose-50 dark:bg-rose-500/10 px-5 py-2.5 rounded-xl border border-rose-100 dark:border-rose-500/20 shadow-sm active:scale-95"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Check Out
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {activeMainTab === 'advances' && (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-zinc-100 dark:border-white/5">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Date</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Staff Member</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Amount</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Reason</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-white/5">
                                {advances?.map((adv: any) => (
                                    <tr key={adv.id} className="group hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-6 text-sm font-bold text-zinc-500 dark:text-zinc-400">{format(new Date(adv.created_at), 'dd MMM yyyy')}</td>
                                        <td className="px-8 py-6 font-bold text-foreground dark:text-white">{adv.staff?.name}</td>
                                        <td className="px-8 py-6 font-black text-rose-500 italic text-lg">₹{adv.amount}</td>
                                        <td className="px-8 py-6 text-sm font-bold text-zinc-500 dark:text-zinc-400 italic font-medium">{adv.reason}</td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${adv.status === 'recovered' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-100 dark:border-emerald-500/20' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500 border border-rose-100 dark:border-rose-500/20'}`}>
                                                {adv.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {(!advances || advances.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-24 text-center text-zinc-400 font-black uppercase tracking-widest italic">No advances discovered.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}

                    {activeMainTab === 'salary' && (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-zinc-100 dark:border-white/5">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Period</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Staff Member</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Base Salary</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Deductions</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Net Paid</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-white/5">
                                {payrollHistory?.map((pay: any) => (
                                    <tr key={pay.id} className="group hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-6 text-sm font-bold text-zinc-500 dark:text-zinc-400">
                                            {format(new Date(pay.period_start), 'MMM yyyy')}
                                        </td>
                                        <td className="px-8 py-6 font-bold text-foreground dark:text-white">{pay.staff?.name}</td>
                                        <td className="px-8 py-6 font-bold text-zinc-600 dark:text-zinc-300">₹{pay.base_salary}</td>
                                        <td className="px-8 py-6 font-black text-rose-500 italic">₹{pay.deductions}</td>
                                        <td className="px-8 py-6 font-black text-emerald-600 dark:text-emerald-500 text-xl italic drop-shadow-sm">₹{pay.net_pay}</td>
                                    </tr>
                                ))}
                                {(!payrollHistory || payrollHistory.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-24 text-center text-zinc-400 font-black uppercase tracking-widest italic">No payroll history discovered.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Attendance Modal */}
            {
                isAttendanceModalOpen && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-white/40 dark:bg-black/80 backdrop-blur-md" onClick={() => setIsAttendanceModalOpen(false)} />
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 p-10 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">Manual Attendance</h2>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-1">Select a staff member to check them in for today.</p>
                                </div>
                                <button onClick={() => setIsAttendanceModalOpen(false)} className="p-3 hover:bg-zinc-50 dark:hover:bg-white/5 rounded-2xl transition-all border border-zinc-100 dark:border-white/10">
                                    <X className="w-8 h-8 text-zinc-400" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                                {staff.map((member) => {
                                    const isWorking = recentAttendance?.some((a: any) => a.staff_id === member.id && !a.check_out)
                                    return (
                                        <div
                                            key={member.id}
                                            className={`p-6 rounded-[2rem] border transition-all ${isWorking
                                                ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20 opacity-60'
                                                : 'bg-zinc-50 dark:bg-white/5 border-zinc-100 dark:border-white/10 hover:border-orange-500/30 hover:bg-white dark:hover:bg-white/10 cursor-pointer shadow-sm'
                                                }`}
                                            onClick={() => !isWorking && handleCheckIn(member.id)}
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-zinc-900 dark:text-white italic text-lg shadow-sm border border-zinc-200 dark:border-white/5">
                                                    {member.name[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-black text-zinc-900 dark:text-white truncate text-lg uppercase tracking-tight">{member.name}</h4>
                                                    <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">{member.role}</p>
                                                </div>
                                                {isWorking ? (
                                                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                                ) : (
                                                    <Plus className="w-6 h-6 text-orange-500" />
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Advance Modal */}
            <AddAdvanceModal
                isOpen={isAdvanceModalOpen}
                onClose={() => setIsAdvanceModalOpen(false)}
                staff={staff}
                onSubmit={async (data) => {
                    await addAdvance.mutateAsync(data)
                    setIsAdvanceModalOpen(false)
                    setActiveMainTab('advances')
                }}
            />

            {/* Run Payroll Modal */}
            <RunPayrollModal
                isOpen={isPayrollModalOpen}
                onClose={() => setIsPayrollModalOpen(false)}
                onSubmit={async (dates) => {
                    await runPayroll.mutateAsync(dates)
                    setIsPayrollModalOpen(false)
                    setActiveMainTab('salary')
                    toast.success('Payroll processed successfully')
                }}
            />

            {/* Bottom Summaries */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
                {/* Shift Summary */}
                <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/50 dark:border-white/5 rounded-[3rem] p-10 shadow-sm shadow-black/5">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-black text-foreground dark:text-white uppercase italic tracking-tighter">Shift-Wise Summary</h3>
                        <button className="p-2.5 hover:bg-zinc-50 dark:hover:bg-white/5 rounded-2xl transition-all">
                            <ChevronDown className="w-6 h-6 text-zinc-400" />
                        </button>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-zinc-100 dark:border-white/5">
                                <th className="pb-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Shift</th>
                                <th className="pb-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">On Time</th>
                                <th className="pb-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Late</th>
                                <th className="pb-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Time Off</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 dark:divide-white/5">
                            {['Morning', 'Noon', 'Evening'].map((shift) => (
                                <tr key={shift} className="hover:bg-zinc-50 dark:hover:bg-white/[0.01] transition-colors">
                                    <td className="py-5 font-bold text-foreground dark:text-white text-sm">{shift} Shift</td>
                                    <td className="py-5 text-sm font-bold text-zinc-500 dark:text-zinc-400">0</td>
                                    <td className="py-5 text-sm font-bold text-zinc-300 dark:text-zinc-600">-</td>
                                    <td className="py-5 text-sm font-bold text-zinc-500 dark:text-zinc-400">0</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Department Summary */}
                <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/50 dark:border-white/5 rounded-[3rem] p-10 shadow-sm shadow-black/5">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-black text-foreground dark:text-white uppercase italic tracking-tighter">Department-Wise Summary</h3>
                        <button className="p-2.5 hover:bg-zinc-50 dark:hover:bg-white/5 rounded-2xl transition-all">
                            <ChevronDown className="w-6 h-6 text-zinc-400" />
                        </button>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-zinc-100 dark:border-white/5">
                                <th className="pb-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Department</th>
                                <th className="pb-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Working</th>
                                <th className="pb-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">On Break</th>
                                <th className="pb-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Leave</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 dark:divide-white/5">
                            {['Sales', 'Marketing', 'Kitchen', 'Service'].map((dept) => (
                                <tr key={dept} className="hover:bg-zinc-50 dark:hover:bg-white/[0.01] transition-colors">
                                    <td className="py-5 font-bold text-foreground dark:text-white text-sm">{dept}</td>
                                    <td className="py-5 text-sm font-bold text-zinc-500 dark:text-zinc-400">0</td>
                                    <td className="py-5 text-sm font-bold text-zinc-500 dark:text-zinc-400">0</td>
                                    <td className="py-5 text-sm font-bold text-zinc-500 dark:text-zinc-400">0</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function AddAdvanceModal({ isOpen, onClose, staff, onSubmit }: { isOpen: boolean; onClose: () => void; staff: Staff[]; onSubmit: (data: any) => Promise<void> }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        staff_id: '',
        amount: 0,
        reason: ''
    })

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.staff_id || !formData.amount) return
        setIsSubmitting(true)
        try {
            await onSubmit(formData)
            toast.success('Advance logged successfully')
            onClose()
        } catch (error) {
            toast.error('Failed to log advance')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-white/40 dark:bg-black/60 backdrop-blur-md" onClick={onClose} />
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 w-full max-w-md rounded-[3rem] shadow-2xl relative z-10 p-10 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-black text-foreground dark:text-white uppercase italic tracking-tighter">Add Staff Advance</h2>
                    <button onClick={onClose} className="p-3 hover:bg-zinc-50 dark:hover:bg-white/5 rounded-full transition-all">
                        <X className="w-8 h-8 text-zinc-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Staff Member</label>
                        <select
                            value={formData.staff_id}
                            onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                            className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl px-5 py-4 text-foreground dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all appearance-none shadow-inner"
                            required
                        >
                            <option value="" className="bg-white dark:bg-zinc-900">Select Staff</option>
                            {staff.map(s => <option key={s.id} value={s.id} className="bg-white dark:bg-zinc-900">{s.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Amount (₹)</label>
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                            className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl px-5 py-4 text-foreground dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all shadow-inner"
                            placeholder="0"
                            required
                        />
                    </div>

                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Reason / Note</label>
                        <textarea
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl px-5 py-4 text-foreground dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all h-28 resize-none shadow-inner"
                            placeholder="Emergency, Loan, etc."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-zinc-900 dark:bg-zinc-800 hover:bg-black dark:hover:bg-zinc-700 disabled:opacity-50 text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-xl shadow-black/10 transition-all active:scale-95 italic"
                    >
                        {isSubmitting ? 'Logging...' : 'Log Advance Payment'}
                    </button>
                </form>
            </div>
        </div>
    )
}

function RunPayrollModal({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: (data: any) => Promise<void> }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [dates, setDates] = useState({
        periodStart: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        periodEnd: format(endOfMonth(new Date()), 'yyyy-MM-dd')
    })

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await onSubmit(dates)
            onClose()
        } catch (error) {
            toast.error('Failed to run payroll')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-white/40 dark:bg-black/80 backdrop-blur-md" onClick={onClose} />
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 w-full max-w-md rounded-[3rem] shadow-2xl relative z-10 p-10">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-black text-foreground dark:text-white uppercase italic tracking-tighter">Run Monthly Payroll</h2>
                    <button onClick={onClose} className="p-3 hover:bg-zinc-50 dark:hover:bg-white/5 rounded-full transition-all">
                        <X className="w-8 h-8 text-zinc-400" />
                    </button>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 p-8 rounded-[2rem] mb-10 shadow-sm shadow-emerald-500/5">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 leading-relaxed italic">
                        This will generate salary records for all active staff, deducting outstanding advances and calculating net payouts.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Period Start</label>
                            <input
                                type="date"
                                value={dates.periodStart}
                                onChange={(e) => setDates({ ...dates, periodStart: e.target.value })}
                                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl px-5 py-4 text-foreground dark:text-white font-black focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all dark:[color-scheme:dark] shadow-inner"
                                required
                            />
                        </div>
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Period End</label>
                            <input
                                type="date"
                                value={dates.periodEnd}
                                onChange={(e) => setDates({ ...dates, periodEnd: e.target.value })}
                                className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl px-5 py-4 text-foreground dark:text-white font-black focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all dark:[color-scheme:dark] shadow-inner"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        {isSubmitting ? 'Processing...' : (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                Confirm & Process
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
