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
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function PayrollDashboard() {
    const { cafe } = useCafe()
    const { metrics, recentAttendance, isMetricsLoading, isAttendanceLoading, checkIn, checkOut } = usePayroll(cafe?.id)
    const { shifts } = useShifts(cafe?.id)
    const { staff } = useStaff(cafe?.id)
    const [activeShiftTab, setActiveShiftTab] = useState('All')
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)

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
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Users className="w-5 h-5 text-purple-500" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Staff Command & Payroll</h1>
                    </div>
                    <p className="text-zinc-500 font-medium">Real-time attendance tracking and payroll intelligence.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAttendanceModalOpen(true)}
                        className="bg-zinc-800/50 border border-white/5 px-4 py-2.5 rounded-xl text-sm font-bold text-zinc-400 flex items-center gap-2 hover:bg-zinc-800 transition-all"
                    >
                        <UserCheck className="w-4 h-4" />
                        Manual Attendance
                    </button>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-purple-600/20 transition-all active:scale-95">
                        Run Payroll
                    </button>
                </div>
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-5 rounded-3xl group hover:border-white/10 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2.5 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 ring-1 ring-${stat.color}-500/20`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-black uppercase tracking-widest text-zinc-500">{stat.label}</p>
                            <h3 className="text-3xl font-black text-white italic">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Attendance Summary */}
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden">
                <div className="p-8 border-b border-white/5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Quick Attendance Summary</h2>
                        <div className="flex items-center gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5 w-fit">
                            {shiftTabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveShiftTab(tab)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeShiftTab === tab
                                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-purple-500/5 border border-purple-500/20 p-6 rounded-3xl flex items-center justify-between group hover:bg-purple-500/10 transition-all">
                            <div>
                                <h4 className="text-3xl font-black text-purple-500 mb-1">{metrics?.currentlyWorking || 0}</h4>
                                <p className="text-xs font-black uppercase tracking-widest text-purple-500/60">Checked In</p>
                            </div>
                            <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                                <UserCheck className="w-6 h-6 text-purple-500" />
                            </div>
                        </div>
                        <div className="bg-orange-500/5 border border-orange-500/20 p-6 rounded-3xl flex items-center justify-between group hover:bg-orange-500/10 transition-all">
                            <div>
                                <h4 className="text-3xl font-black text-orange-500 mb-1">06</h4>
                                <p className="text-xs font-black uppercase tracking-widest text-orange-500/60">Not In Yet</p>
                            </div>
                            <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                                <Clock className="w-6 h-6 text-orange-500" />
                            </div>
                        </div>
                        <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl flex items-center justify-between group hover:bg-rose-500/10 transition-all">
                            <div>
                                <h4 className="text-3xl font-black text-rose-500 mb-1">{metrics?.onLeave || 0}</h4>
                                <p className="text-xs font-black uppercase tracking-widest text-rose-500/60">On Leave</p>
                            </div>
                            <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                                <Plane className="w-6 h-6 text-rose-500" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Emp ID</th>
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Name</th>
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Dept.</th>
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Designation</th>
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Total Hours</th>
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-zinc-500 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {recentAttendance?.map((entry: any, i: number) => (
                                <tr key={entry.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-5">
                                        <span className="text-sm font-mono text-zinc-500">#{(i + 1).toString().padStart(4, '0')}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center font-black text-white italic">
                                                {entry.staff?.name?.[0]}
                                            </div>
                                            <span className="font-bold text-white">{entry.staff?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-medium text-zinc-400">{entry.staff?.department || 'Operations'}</td>
                                    <td className="px-8 py-5 text-sm font-medium text-zinc-400">{entry.staff?.designation || entry.staff?.role}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-white">
                                                {entry.check_out ? 'Completed' : 'Working...'}
                                            </span>
                                            <div className={`w-1.5 h-1.5 rounded-full ${entry.check_out ? 'bg-zinc-600' : 'bg-emerald-500 animate-pulse'} shadow-lg`} />
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        {!entry.check_out && (
                                            <button
                                                onClick={() => handleCheckOut(entry.id)}
                                                className="text-xs font-black uppercase tracking-widest text-rose-500 hover:text-rose-400 transition-colors flex items-center gap-2 ml-auto"
                                            >
                                                <LogOut className="w-3 h-3" />
                                                Check Out
                                            </button>
                                        )}
                                        {entry.check_out && (
                                            <span className="text-xs font-black uppercase tracking-widest text-zinc-600 italic">Signed Out</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {!recentAttendance?.length && !isAttendanceLoading && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 rounded-3xl bg-white/5 border border-white/5">
                                                <Users className="w-8 h-8 text-zinc-600" />
                                            </div>
                                            <p className="text-zinc-500 font-medium italic">No attendance records found for today.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Attendance Modal */}
            {isAttendanceModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAttendanceModalOpen(false)} />
                    <div className="bg-zinc-900 border border-white/10 w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 p-8 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase italic">Manual Attendance</h2>
                                <p className="text-zinc-500 text-sm">Select a staff member to check them in for today.</p>
                            </div>
                            <button onClick={() => setIsAttendanceModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-all">
                                <X className="w-6 h-6 text-zinc-500 hover:text-white" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                            {staff.map((member) => {
                                const isWorking = recentAttendance?.some((a: any) => a.staff_id === member.id && !a.check_out)
                                return (
                                    <div
                                        key={member.id}
                                        className={`p-4 rounded-3xl border transition-all ${isWorking
                                            ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60'
                                            : 'bg-white/5 border-white/10 hover:border-purple-500/50 hover:bg-white/10 cursor-pointer'
                                            }`}
                                        onClick={() => !isWorking && handleCheckIn(member.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center font-black text-white italic">
                                                {member.name[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-white truncate">{member.name}</h4>
                                                <p className="text-xs text-zinc-500 uppercase tracking-widest">{member.role}</p>
                                            </div>
                                            {isWorking ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            ) : (
                                                <Plus className="w-5 h-5 text-purple-500" />
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Summaries */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Shift Summary */}
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Shift-Wise Summary</h3>
                        <button className="p-2 hover:bg-white/5 rounded-xl transition-all">
                            <ChevronDown className="w-5 h-5 text-zinc-500" />
                        </button>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Shift</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">On Time</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Late</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Time Off</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {['Morning', 'Noon', 'Evening'].map((shift) => (
                                <tr key={shift} className="hover:bg-white/[0.01] transition-colors">
                                    <td className="py-4 font-bold text-white text-sm">{shift} Shift</td>
                                    <td className="py-4 text-sm font-medium text-zinc-400">0</td>
                                    <td className="py-4 text-sm font-medium text-zinc-400">-</td>
                                    <td className="py-4 text-sm font-medium text-zinc-400">0</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Department Summary */}
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Department-Wise Summary</h3>
                        <button className="p-2 hover:bg-white/5 rounded-xl transition-all">
                            <ChevronDown className="w-5 h-5 text-zinc-500" />
                        </button>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Department</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Working</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">On Break</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Leave</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {['Sales', 'Marketing', 'Kitchen', 'Service'].map((dept) => (
                                <tr key={dept} className="hover:bg-white/[0.01] transition-colors">
                                    <td className="py-4 font-bold text-white text-sm">{dept}</td>
                                    <td className="py-4 text-sm font-medium text-zinc-400">0</td>
                                    <td className="py-4 text-sm font-medium text-zinc-400">0</td>
                                    <td className="py-4 text-sm font-medium text-zinc-400">0</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
