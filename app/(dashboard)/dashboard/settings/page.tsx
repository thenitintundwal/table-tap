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
                <h1 className="text-3xl font-black tracking-tight text-foreground">Settings</h1>
                <p className="text-zinc-500 font-medium">Manage your cafe profile and subscription.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Settings */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSave} className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <Store className="w-5 h-5 text-orange-500" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">Cafe Profile</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-black uppercase tracking-widest text-zinc-500 pl-1">
                                    Cafe Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-medium"
                                    placeholder="e.g. The Coffee House"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-black uppercase tracking-widest text-zinc-500 pl-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-medium min-h-[120px] resize-none"
                                    placeholder="Tell customers about your cafe..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-black uppercase tracking-widest text-zinc-500 pl-1">
                                    Logo URL
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-orange-500 transition-colors">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="url"
                                        value={formData.logo_url}
                                        onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                                        className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-2xl pl-14 pr-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-medium"
                                        placeholder="https://example.com/logo.png"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 flex justify-end">
                            <button
                                type="submit"
                                disabled={updateCafe.isPending}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50"
                            >
                                {updateCafe.isPending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Telegram Notifications Settings */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Globe className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Telegram Notifications</h3>
                                <p className="text-sm text-zinc-500 font-medium mt-0.5">Receive real-time order alerts via Telegram Bot.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-black uppercase tracking-widest text-zinc-500 pl-1">
                                    Telegram Bot Token
                                </label>
                                <input
                                    type="password"
                                    value={formData.telegram_bot_token}
                                    onChange={(e) => setFormData({ ...formData, telegram_bot_token: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                    placeholder="e.g. 1234567890:ABCdefGHI..."
                                />
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest pl-1">
                                    Get this from @BotFather on Telegram
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-black uppercase tracking-widest text-zinc-500 pl-1">
                                    Telegram Chat ID
                                </label>
                                <input
                                    type="text"
                                    value={formData.telegram_chat_id}
                                    onChange={(e) => setFormData({ ...formData, telegram_chat_id: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                    placeholder="e.g. -100123456789"
                                />
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest pl-1">
                                    Use @userinfobot to find your Chat ID
                                </p>
                            </div>
                        </div>

                        <div className="mt-10 flex justify-between items-center bg-blue-500/5 p-6 rounded-2xl border border-blue-500/10">
                            <p className="text-xs text-blue-600 dark:text-blue-400/80 font-medium leading-relaxed max-w-[70%]">
                                Make sure to start the bot and send /start to it before saving these settings.
                            </p>
                            <button
                                onClick={handleSave}
                                disabled={updateCafe.isPending}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                            >
                                {updateCafe.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                <span>Save Telegram</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Subscription Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-3xl p-8 shadow-sm relative overflow-hidden group">
                        {/* Background Decoration */}
                        <div className={`absolute top-0 right-0 w-32 h-32 ${isPro ? 'bg-purple-500/10' : 'bg-zinc-500/10'} rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`} />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-2 ${isPro ? 'bg-purple-500/10 text-purple-500' : 'bg-zinc-500/10 text-zinc-500'} rounded-lg`}>
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">Subscription</h3>
                            </div>

                            <div className="space-y-4">
                                <div className={`px-4 py-3 rounded-2xl border ${isPro
                                    ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400'
                                    : 'bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400'
                                    } flex items-center justify-between`}>
                                    <span className="text-sm font-black uppercase tracking-widest">
                                        Current Plan
                                    </span>
                                    <span className="font-black text-lg uppercase tracking-wider italic">
                                        {cafe?.subscription_plan || 'Basic'}
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

                    <div className="bg-orange-500/5 dark:bg-orange-500/[0.02] border border-orange-500/10 rounded-3xl p-6">
                        <p className="text-xs text-orange-600 dark:text-orange-400/80 font-medium leading-relaxed">
                            Need help with your business account? Contact our support team for assistance with multi-location management or custom enterprise solutions.
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
