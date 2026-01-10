'use client'

import { useState, useEffect } from 'react'
import { useCafe } from '@/hooks/useCafe'
import CafeGuard from '@/components/dashboard/CafeGuard'
import {
    Bell,
    Check,
    X,
    AlertCircle,
    MessageSquare,
    Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { pushNotifications } from '@/lib/notifications/push'

function NotificationSettingsContent() {
    const { cafe } = useCafe()
    const [permission, setPermission] = useState<NotificationPermission>('default')
    const [isSupported, setIsSupported] = useState(false)
    const [isTesting, setIsTesting] = useState(false)

    useEffect(() => {
        setIsSupported(pushNotifications.isSupported())
        if (pushNotifications.isSupported()) {
            setPermission(Notification.permission)
        }
    }, [])

    const handleEnableNotifications = async () => {
        const granted = await pushNotifications.requestPermission()
        if (granted) {
            setPermission('granted')
            toast.success('Notifications enabled!')
        } else {
            toast.error('Notification permission denied')
        }
    }

    const handleTestNotification = async () => {
        setIsTesting(true)
        try {
            await pushNotifications.notifyNewOrder({
                tableNumber: 5,
                customerName: 'Test Customer',
                totalAmount: 25.50,
                itemCount: 3
            })
            toast.success('Test notification sent! Check your system notifications.')
        } catch (error) {
            toast.error('Failed to send test notification')
        } finally {
            setIsTesting(false)
        }
    }

    if (!isSupported) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white italic tracking-tighter uppercase flex items-center gap-3">
                        <Bell className="w-8 h-8 text-rose-600 dark:text-rose-500" />
                        Intelligence Alerts
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">Get real-time order protocol alerts.</p>
                </div>

                <div className="bg-rose-600/5 dark:bg-rose-500/5 border border-rose-600/10 dark:border-rose-500/10 rounded-[2.5rem] p-8">
                    <div className="flex items-start gap-5">
                        <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-500 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-xl font-black text-rose-600 dark:text-rose-500 uppercase italic tracking-tighter mb-2">Protocol Unsupported</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                                Your current browser architecture does not support push intelligence. Please utilize a modern environment like Chrome, Firefox, or Edge.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-4">
                    <Link href="/dashboard/settings" className="hover:text-orange-600 dark:hover:text-orange-500 transition-colors">Settings</Link>
                    <span className="opacity-30">/</span>
                    <span className="text-zinc-900 dark:text-white">Alerts</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white italic tracking-tighter uppercase flex items-center gap-3">
                    <Bell className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                    Intelligence Alerts
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Configure real-time order protocol alerts on your device.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Card */}
                    <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className={`p-3 rounded-2xl border ${permission === 'granted' ? 'bg-emerald-600/10 border-emerald-600/10 text-emerald-600' : 'bg-orange-600/10 border-orange-600/10 text-orange-600'}`}>
                                <Bell className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">Satellite Status</h3>
                        </div>

                        <div className="space-y-6">
                            {permission === 'granted' ? (
                                <div className="flex items-start gap-4 p-6 bg-emerald-600/5 dark:bg-emerald-500/5 rounded-[2rem] border border-emerald-600/10 dark:border-emerald-500/10">
                                    <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-black text-emerald-600 dark:text-emerald-500 uppercase italic tracking-tighter">Communication Link Active</p>
                                        <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm mt-1 leading-relaxed">
                                            Intelligence alerts will be dispatched even when the terminal is in hibernate mode.
                                        </p>
                                    </div>
                                </div>
                            ) : permission === 'denied' ? (
                                <div className="flex items-start gap-4 p-6 bg-rose-600/5 dark:bg-rose-500/5 rounded-[2rem] border border-rose-600/10 dark:border-rose-500/10">
                                    <X className="w-6 h-6 text-rose-600 dark:text-rose-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-black text-rose-600 dark:text-rose-500 uppercase italic tracking-tighter">Intelligence Blocked</p>
                                        <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm mt-1 leading-relaxed">
                                            Access protocols denied. Please re-authorize through your system architecture.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-4 p-6 bg-orange-600/5 dark:bg-orange-500/5 rounded-[2rem] border border-orange-600/10 dark:border-orange-500/10">
                                    <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-black text-orange-600 dark:text-orange-500 uppercase italic tracking-tighter">Connection Pending</p>
                                        <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm mt-1 leading-relaxed">
                                            Activate intelligence protocols to begin receiving real-time command alerts.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-white/5">
                                {permission !== 'granted' && (
                                    <button
                                        onClick={handleEnableNotifications}
                                        className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-black/10 dark:shadow-white/5 active:scale-95 italic"
                                    >
                                        <Bell className="w-5 h-5" />
                                        Initialize Protocols
                                    </button>
                                )}

                                {permission === 'granted' && (
                                    <button
                                        onClick={handleTestNotification}
                                        disabled={isTesting}
                                        className="text-zinc-400 dark:text-zinc-500 hover:text-orange-600 dark:hover:text-orange-500 font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all disabled:opacity-50 italic"
                                    >
                                        {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                                        Dispatch Signal Test
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* How it Works */}
                    <div className="bg-blue-600/5 dark:bg-blue-500/5 border border-blue-600/10 dark:border-blue-500/10 rounded-[2.5rem] p-8">
                        <h4 className="font-black text-blue-700 dark:text-blue-400 uppercase italic tracking-tighter mb-6 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5" />
                            Intelligence Protocol Information
                        </h4>
                        <ul className="space-y-4">
                            {[
                                "Alerts materialize even with the terminal architecture hibernated",
                                "System intelligence payloads contain critical order datasets",
                                "Single-action focus to refocus the intelligence dashboard",
                                "Compatible with all modern command environments"
                            ].map((text, i) => (
                                <li key={i} className="flex items-start gap-4">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600/40 dark:bg-blue-500/40 mt-2" />
                                    <span className="text-zinc-500 dark:text-zinc-400 font-medium text-sm leading-relaxed">{text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function NotificationSettingsPage() {
    return (
        <CafeGuard>
            <NotificationSettingsContent />
        </CafeGuard>
    )
}
