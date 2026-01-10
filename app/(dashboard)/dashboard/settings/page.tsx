'use client'

import { useState, useEffect } from 'react'
import { useCafe } from '@/hooks/useCafe'
import CafeGuard from '@/components/dashboard/CafeGuard'
import {
    Store,
    CreditCard,
    CheckCircle2,
    Loader2,
    Save,
    Lock,
    Globe
} from 'lucide-react'
import { toast } from 'sonner'

function SettingsContent() {
    const { cafe, updateCafe } = useCafe()
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        logo_url: '',
        telegram_bot_token: '',
        telegram_chat_id: ''
    })

    useEffect(() => {
        if (cafe) {
            setFormData({
                name: cafe.name || '',
                description: cafe.description || '',
                logo_url: cafe.logo_url || '',
                telegram_bot_token: cafe.telegram_bot_token || '',
                telegram_chat_id: cafe.telegram_chat_id || ''
            })
        }
    }, [cafe])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!cafe) return

        try {
            await updateCafe.mutateAsync({
                id: cafe.id,
                ...formData
            })
            toast.success('Settings updated successfully!')
        } catch (error) {
            toast.error('Failed to update settings')
        }
    }

    const isPro = cafe?.subscription_plan === 'pro'

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white italic tracking-tighter uppercase">Intelligence Settings</h1>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">Manage your cafe profile, automated notifications, and subscription.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSave} className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-orange-600/10 dark:bg-orange-500/10 rounded-2xl border border-orange-600/10">
                                <Store className="w-5 h-5 text-orange-600 dark:text-orange-500" />
                            </div>
                            <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">Cafe Profile</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 pl-1">
                                    Cafe Signature Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-100 dark:border-white/5 rounded-2xl px-5 py-4 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-black uppercase italic tracking-tight"
                                    placeholder="e.g. THE COFFEE HOUSE"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 pl-1">
                                    Business Intelligence Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-100 dark:border-white/5 rounded-2xl px-5 py-4 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-medium min-h-[120px] resize-none"
                                    placeholder="Tell customers about your cafe mission..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 pl-1">
                                    Brand Identity (Logo URL)
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-orange-600 dark:group-focus-within:text-orange-500 transition-colors">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="url"
                                        value={formData.logo_url}
                                        onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                                        className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-100 dark:border-white/5 rounded-2xl pl-14 pr-5 py-4 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-medium"
                                        placeholder="https://brand.com/logo.png"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 flex justify-end">
                            <button
                                type="submit"
                                disabled={updateCafe.isPending}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all shadow-xl shadow-orange-600/20 active:scale-95 disabled:opacity-50 italic text-[10px]"
                            >
                                {updateCafe.isPending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                <span>Commit Profile Changes</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Telegram Notifications Settings */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-blue-600/10 dark:bg-blue-500/10 rounded-2xl border border-blue-600/10">
                                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">Command Alerts</h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">Receive real-time order alerts via Telegram Bot infrastructure.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 pl-1">
                                    Secured Bot Token
                                </label>
                                <input
                                    type="password"
                                    value={formData.telegram_bot_token}
                                    onChange={(e) => setFormData({ ...formData, telegram_bot_token: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-100 dark:border-white/5 rounded-2xl px-5 py-4 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                    placeholder="e.g. 1234567890:ABCdefGHI..."
                                />
                                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest pl-1 mt-1 opacity-60">
                                    Acquire this from @BotFather on Telegram
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 pl-1">
                                    Command Chat ID
                                </label>
                                <input
                                    type="text"
                                    value={formData.telegram_chat_id}
                                    onChange={(e) => setFormData({ ...formData, telegram_chat_id: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-100 dark:border-white/5 rounded-2xl px-5 py-4 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                    placeholder="e.g. -100123456789"
                                />
                                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest pl-1 mt-1 opacity-60">
                                    Utilize @userinfobot to locate your ID
                                </p>
                            </div>
                        </div>

                        <div className="mt-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-blue-600/5 dark:bg-blue-500/5 p-8 rounded-[2rem] border border-blue-600/10 dark:border-blue-500/10">
                            <p className="text-xs text-blue-700 dark:text-blue-400 font-black uppercase tracking-widest leading-relaxed max-w-md italic">
                                Initialize the bot and dispatch /start prior to saving protocol settings.
                            </p>
                            <button
                                onClick={handleSave}
                                disabled={updateCafe.isPending}
                                className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-black/10 dark:shadow-white/5 active:scale-95 disabled:opacity-50 italic"
                            >
                                {updateCafe.isPending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                <span>Save Intelligence</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Subscription Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
                        {/* Background Decoration */}
                        <div className={`absolute top-0 right-0 w-32 h-32 ${isPro ? 'bg-purple-600/10' : 'bg-zinc-500/10'} rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`} />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-10">
                                <div className={`p-3 ${isPro ? 'bg-purple-600/10 text-purple-600' : 'bg-zinc-500/10 text-zinc-500'} rounded-2xl border border-current/10`}>
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">Plan Intelligence</h3>
                            </div>

                            <div className="space-y-4">
                                <div className={`p-6 rounded-3xl border ${isPro
                                    ? 'bg-purple-600/10 border-purple-600/20 text-purple-600 dark:text-purple-400'
                                    : 'bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-500'
                                    } flex items-center justify-between`}>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                        Active tier
                                    </span>
                                    <span className="font-black text-2xl uppercase tracking-tighter italic">
                                        {cafe?.subscription_plan || 'Standard'}
                                    </span>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 px-1">Plan Benefits</p>

                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                        <p className="text-sm text-zinc-500 font-medium">Unlimited Digital Menus</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                        <p className="text-sm text-zinc-500 font-medium">Real-time Order System</p>
                                    </div>
                                    <div className={`flex items-start gap-3 ${!isPro ? 'opacity-40' : ''}`}>
                                        <div className="shrink-0 mt-0.5">
                                            {isPro ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            ) : (
                                                <Lock className="w-4 h-4 text-zinc-400" />
                                            )}
                                        </div>
                                        <p className="text-sm text-zinc-500 font-medium">Advanced Analytics Insights</p>
                                    </div>
                                    {!isPro && (
                                        <button className="w-full mt-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-purple-500/20 hover:scale-[1.02] transition-all active:scale-95">
                                            Upgrade to Pro
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-orange-600/5 dark:bg-orange-500/5 border border-orange-600/10 dark:border-orange-500/10 rounded-[2rem] p-8">
                        <p className="text-xs text-orange-700 dark:text-orange-400 font-black uppercase tracking-widest italic leading-relaxed">
                            Require assistance with enterprise-grade synchronization? Connect with our intelligence support for multi-location command or bespoke architecture solutions.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function SettingsPage() {
    return (
        <CafeGuard>
            <SettingsContent />
        </CafeGuard>
    )
}
