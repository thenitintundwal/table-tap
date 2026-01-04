'use client'

import { useCafe } from '@/hooks/useCafe'
import { Loader2, Lock } from 'lucide-react'
import Link from 'next/link'

interface FeatureGuardProps {
    children: React.ReactNode
    requiredPlan?: 'basic' | 'pro'
    featureName?: string
    mode?: 'block' | 'blur'
    minimal?: boolean
}

export default function FeatureGuard({
    children,
    requiredPlan = 'pro',
    featureName = 'Analytics',
    mode = 'block',
    minimal = false
}: FeatureGuardProps) {
    const { cafe, isLoading } = useCafe()

    if (isLoading) {
        return (
            <div className="flex h-full min-h-[200px] items-center justify-center">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        )
    }

    const currentPlan = cafe?.subscription_plan || 'basic'
    const hasAccess = requiredPlan === 'basic' || (requiredPlan === 'pro' && currentPlan === 'pro')

    if (!hasAccess) {
        if (mode === 'blur') {
            return (
                <div className="relative group overflow-hidden rounded-2xl h-full w-full transition-all duration-500">
                    {/* Content is visible but softly blurred */}
                    <div className="blur-[4px] opacity-60 pointer-events-none select-none h-full w-full grayscale-[0.5] transition-all">
                        {children}
                    </div>
                    {/* Elegant Glassmorphic Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-transparent animate-in fade-in duration-700">
                        {!minimal && (
                            <>
                                <div className="p-4 rounded-3xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-white/5 group-hover:scale-110 transition-transform duration-500">
                                    <Lock className="w-8 h-8 text-orange-500" />
                                </div>
                                <div className="text-center px-4 space-y-1">
                                    <h3 className="text-lg font-bold text-foreground tracking-tight">Pro Statistics</h3>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium max-w-[200px] leading-relaxed">
                                        Get deep insights with {featureName} on Pro.
                                    </p>
                                </div>
                            </>
                        )}
                        <button className="px-6 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-orange-500/40 active:scale-95 border-b-2 border-orange-700 dark:border-orange-400/20">
                            Upgrade to Pro
                        </button>
                    </div>
                </div>
            )
        }

        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-6 text-center px-4 animate-in fade-in zoom-in duration-500">
                <div className="p-6 rounded-full bg-zinc-100 dark:bg-zinc-900 border-4 border-white dark:border-black shadow-xl">
                    <Lock className="w-12 h-12 text-zinc-400" />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">{featureName} is Locked</h2>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Upgrade to the <span className="font-bold text-orange-500">Pro</span> plan to unlock enhanced features like {featureName}, detailed reports, and more.
                    </p>
                </div>
                <button className="px-8 py-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all">
                    Upgrade to Pro
                </button>
            </div>
        )
    }

    return <>{children}</>
}
