'use client'

import { useState } from 'react'
import { useCafe } from '@/hooks/useCafe'
import { useStaff } from '@/hooks/useStaff'
import { Staff } from '@/types'
import {
    Users,
    Plus,
    UserPlus,
    ShieldCheck,
    Utensils,
    Coffee,
    Trash2,
    X,
    Loader2
} from 'lucide-react'

export default function StaffPage() {
    const { cafe } = useCafe()
    const { staff, isLoading, addStaff, removeStaff } = useStaff(cafe?.id)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newStaff, setNewStaff] = useState<Partial<Staff>>({
        name: '',
        role: 'server',
        designation: '',
        department: '',
        monthly_salary: 0,
        pin: '',
        is_active: true
    })

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newStaff.name || !newStaff.role) return

        await addStaff(newStaff)
        setIsModalOpen(false)
        setNewStaff({
            name: '',
            role: 'server',
            designation: '',
            department: '',
            monthly_salary: 0,
            pin: '',
            is_active: true
        })
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
                        <Users className="w-8 h-8 text-purple-500" />
                        Staff Command
                    </h1>
                    <p className="text-zinc-500 font-medium mt-1">
                        Manage your team access and roles.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all active:scale-95"
                >
                    <UserPlus className="w-5 h-5" />
                    Add Staff
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.map(member => (
                    <div key={member.id} className="bg-zinc-900 border border-white/5 p-6 rounded-3xl group hover:border-purple-500/30 transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-purple-500">
                                {member.role === 'manager' && <ShieldCheck className="w-6 h-6" />}
                                {member.role === 'chef' && <Utensils className="w-6 h-6" />}
                                {member.role === 'server' && <Coffee className="w-6 h-6" />}
                            </div>
                            <button
                                onClick={() => removeStaff(member.id)}
                                className="p-2 text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                Trash2
                            </button>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-500 px-2 py-1 rounded-lg border border-purple-500/20">
                                {member.role}
                            </span>
                            {member.designation && (
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg text-zinc-400">
                                    {member.designation}
                                </span>
                            )}
                            {member.department && (
                                <span className="text-[10px] font-medium uppercase tracking-widest bg-black/20 px-2 py-1 rounded-lg text-zinc-500 border border-white/5">
                                    {member.department}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Active Now</span>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-3xl shadow-2xl relative z-10 p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Add Team Member</h2>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-zinc-500 hover:text-white" /></button>
                        </div>
                        <form onSubmit={handleAddStaff} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Full Name</label>
                                <input
                                    required
                                    value={newStaff.name}
                                    onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Role</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['manager', 'chef', 'server'].map((role) => (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => setNewStaff({ ...newStaff, role: role as any })}
                                            className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${newStaff.role === role
                                                ? 'bg-purple-500 text-white border-purple-500'
                                                : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10'
                                                }`}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Designation</label>
                                    <input
                                        value={newStaff.designation}
                                        onChange={e => setNewStaff({ ...newStaff, designation: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        placeholder="e.g. Lead Server"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Department</label>
                                    <input
                                        value={newStaff.department}
                                        onChange={e => setNewStaff({ ...newStaff, department: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        placeholder="e.g. Service"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Monthly Salary</label>
                                    <input
                                        type="number"
                                        value={newStaff.monthly_salary}
                                        onChange={e => setNewStaff({ ...newStaff, monthly_salary: Number(e.target.value) })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Access PIN (Optional)</label>
                                    <input
                                        type="number"
                                        maxLength={4}
                                        value={newStaff.pin}
                                        onChange={e => setNewStaff({ ...newStaff, pin: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        placeholder="4-digit"
                                    />
                                </div>
                            </div>

                            <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 rounded-xl mt-2">
                                Create Profile
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
