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
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <Bell className="w-8 h-8 text-red-500" />
                        Staff Notifications
                    </h1>
                    <p className="text-zinc-500 font-medium">Get real-time order alerts.</p>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8">
                    <div className="flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-lg font-bold text-red-500 mb-2">Browser Not Supported</h3>
                            <p className="text-sm text-zinc-400">
                                Your browser doesn't support push notifications. Please use a modern browser like Chrome, Firefox, or Edge.
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
                <div className="flex items-center gap-2 text-zinc-500 mb-2">
                    <Link href="/dashboard/settings" className="hover:text-white transition-colors">Settings</Link>
                    <span>/</span>
                    <span>Notifications</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                    <Bell className="w-8 h-8 text-blue-500" />
                    Staff Notifications
                </h1>
                <p className="text-zinc-500 font-medium">Get real-time order alerts on your device.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Status Card */}
                    <div className="bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-2 rounded-lg ${permission === 'granted' ? 'bg-emerald-500/10' : 'bg-orange-500/10'}`}>
                                <Bell className={`w-5 h-5 ${permission === 'granted' ? 'text-emerald-500' : 'text-orange-500'}`} />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">Notification Status</h3>
                        </div>

                        <div className="space-y-4">
                            {permission === 'granted' ? (
                                <div className="flex items-start gap-3 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-emerald-500">Notifications Enabled</p>
                                        <p className="text-sm text-zinc-400 mt-1">
                                            You'll receive alerts even when this tab is in the background or minimized.
                                        </p>
                                    </div>
                                </div>
                            ) : permission === 'denied' ? (
                                <div className="flex items-start gap-3 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                                    <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-red-500">Notifications Blocked</p>
                                        <p className="text-sm text-zinc-400 mt-1">
                                            You've blocked notifications. Please enable them in your browser settings.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-3 p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                                    <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-orange-500">Notifications Not Enabled</p>
                                        <p className="text-sm text-zinc-400 mt-1">
                                            Enable notifications to receive real-time order alerts.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-4">
                                {permission !== 'granted' && (
                                    <button
                                        onClick={handleEnableNotifications}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold uppercase tracking-widest flex items-center gap-3 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                                    >
                                        <Bell className="w-5 h-5" />
                                        Enable Notifications
                                    </button>
                                )}

                                {permission === 'granted' && (
                                    <button
                                        onClick={handleTestNotification}
                                        disabled={isTesting}
                                        className="text-zinc-400 hover:text-white font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                        {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                                        Send Test Notification
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* How it Works */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-6">
                        <h4 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            How Browser Notifications Work
                        </h4>
                        <ul className="text-sm text-zinc-400 space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">•</span>
                                <span>Notifications appear even when the dashboard tab is minimized or in the background</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">•</span>
                                <span>You'll see a system notification with order details (table number, amount, items)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">•</span>
                                <span>Click the notification to instantly focus the dashboard</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">•</span>
                                <span>Works on desktop browsers (Chrome, Firefox, Edge, Safari)</span>
                            </li>
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
