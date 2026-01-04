'use client'

import { useCafeAdmin } from '@/hooks/useCafeAdmin'
import {
    Loader2, Store, Search, ShieldAlert, BadgeCheck,
    ArrowUpRight, Filter
} from 'lucide-react'
import { useState } from 'react'

function CafesManager() {
    const { cafes, isLoading, updateSubscription } = useCafeAdmin()
    const [search, setSearch] = useState('')

    const filteredCafes = cafes?.filter(cafe =>
        (cafe.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (cafe.subscription_plan || '').toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10">
                <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 bg-zinc-100 dark:bg-white/5 rounded-lg">
                        <Filter className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div className="flex-1 max-w-md relative group">
                        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search cafes or plan types..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-zinc-100/50 dark:bg-black/20 w-full pl-10 pr-4 py-2 rounded-xl text-sm border-none outline-none focus:ring-2 ring-orange-500/20 transition-all font-medium"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest px-4">
                    Total: {filteredCafes?.length || 0} Cafes
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-20 gap-4">
                    <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                    <p className="text-zinc-500 animate-pulse text-sm font-medium">Syncing cafe records...</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredCafes?.map((cafe) => (
                        <div key={cafe.id} className="bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg hover:border-orange-500/20 transition-all group shadow-sm dark:shadow-none">
                            <div className="flex items-start gap-5">
                                <div className="p-4 bg-orange-500/5 rounded-2xl group-hover:bg-orange-500/10 transition-colors">
                                    <Store className="w-7 h-7 text-orange-500" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-xl tracking-tight text-foreground group-hover:text-orange-500 transition-colors">{cafe.name}</h3>
                                    <div className="flex items-center gap-3">
                                        <p className="text-zinc-500 text-xs font-medium">Joined {new Date(cafe.created_at).toLocaleDateString()}</p>
                                        <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-sm ${cafe.subscription_plan === 'pro'
                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
                                            : 'bg-zinc-100 text-zinc-600 dark:bg-white/5 dark:text-zinc-400'
                                            }`}>
                                            {cafe.subscription_plan || 'basic'} Plan
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center bg-zinc-100 dark:bg-black/40 rounded-xl p-1.5 border border-zinc-200 dark:border-white/5 shadow-inner">
                                    <button
                                        onClick={() => updateSubscription.mutate({ cafeId: cafe.id, plan: 'basic' })}
                                        className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${(cafe.subscription_plan || 'basic') === 'basic'
                                            ? 'bg-white dark:bg-zinc-900 shadow-md text-foreground scale-[1.02]'
                                            : 'text-zinc-500 hover:text-foreground'
                                            }`}
                                    >
                                        Basic
                                    </button>
                                    <button
                                        onClick={() => updateSubscription.mutate({ cafeId: cafe.id, plan: 'pro' })}
                                        className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 ${cafe.subscription_plan === 'pro'
                                            ? 'bg-white dark:bg-zinc-900 shadow-md text-purple-600 scale-[1.02]'
                                            : 'text-zinc-500 hover:text-foreground'
                                            }`}
                                    >
                                        {cafe.subscription_plan === 'pro' && <BadgeCheck className="w-3.5 h-3.5" />}
                                        Pro
                                    </button>
                                </div>
                                <button className="p-3 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-colors text-zinc-400 hover:text-foreground">
                                    <ArrowUpRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredCafes?.length === 0 && (
                        <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/20 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-white/5">
                            <ShieldAlert className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                            <p className="text-zinc-500 font-medium">No cafes found matching your search criteria.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default function CafesPage() {
    return <CafesManager />
}
