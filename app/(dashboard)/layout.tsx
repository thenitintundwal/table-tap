'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import {
    LogOut,
    Coffee,
    Users,
    ShoppingBag,
    TrendingUp,
    LayoutDashboard,
    UtensilsCrossed,
    QrCode,
    ChevronRight,
    Lock as LockIcon,
    Menu,
    X,
    Settings
} from 'lucide-react'
import Link from 'next/link'
import { useCafe } from '@/hooks/useCafe'
import { useOrderRealtime } from '@/hooks/useOrderRealtime'

import { ThemeToggle } from '@/components/ThemeToggle'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [user, setUser] = useState<any>(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const { cafe } = useCafe()
    useOrderRealtime(cafe?.id)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                router.push('/login')
            } else {
                setUser(session.user)
            }
        })
    }, [router])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (!user) return null

    const navigation = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, plan: 'basic' },
        { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag, plan: 'basic' },
        { name: 'Menu Items', href: '/dashboard/menu', icon: UtensilsCrossed, plan: 'basic' },
        { name: 'QR Codes', href: '/dashboard/qr-code', icon: QrCode, plan: 'basic' },
        { name: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp, plan: 'pro' },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings, plan: 'basic' },
    ]

    const currentPlan = cafe?.subscription_plan || 'basic'

    return (
        <div className="min-h-screen bg-background text-foreground flex transition-colors duration-300">
            {/* Sidebar Overlay (Mobile) */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed md:sticky top-0 left-0 z-[70] md:z-50 h-screen ${isSidebarOpen ? 'w-64' : 'w-20'
                    } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                    } border-r border-black/5 dark:border-white/5 bg-zinc-50/50 dark:bg-black/50 backdrop-blur-xl transition-all duration-300 flex flex-col`}
            >
                <div className="h-16 flex items-center justify-between px-6 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="min-w-[32px] h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Coffee className="w-5 h-5 text-white" />
                        </div>
                        {isSidebarOpen && <span className="font-bold text-xl tracking-tight whitespace-nowrap">TableTap</span>}
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-zinc-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        const isLocked = item.plan === 'pro' && currentPlan === 'basic'

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${isActive
                                    ? 'bg-orange-500/10 text-orange-500'
                                    : isLocked
                                        ? 'opacity-60 cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-white/5'
                                        : 'text-zinc-500 dark:text-zinc-400 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
                                    }`}
                            >
                                <div className="relative">
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'group-hover:scale-110 transition-transform'}`} />
                                    {isLocked && (
                                        <div className="absolute -top-1.5 -right-1.5 bg-orange-500 rounded-full p-0.5 border border-white dark:border-black shadow-lg">
                                            <LockIcon className="w-2.5 h-2.5 text-white" />
                                        </div>
                                    )}
                                </div>
                                {isSidebarOpen && (
                                    <div className="flex items-center justify-between flex-1">
                                        <span className="font-medium">{item.name}</span>
                                        {isLocked && <span className="text-[10px] font-bold bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">Pro</span>}
                                    </div>
                                )}
                                {isActive && isSidebarOpen && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-black/5 dark:border-white/5">
                    {/* Desktop Collapse Button */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="hidden md:flex items-center justify-center w-full p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-zinc-400"
                    >
                        <Menu className={`w-4 h-4 transition-transform duration-300 ${!isSidebarOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-md px-4 md:px-8 flex items-center justify-between z-40">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 -ml-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-zinc-500"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-4 text-sm text-zinc-500">
                            <span className="hidden sm:inline">Dashboard</span>
                            <ChevronRight className="w-4 h-4 hidden sm:inline" />
                            <span className="text-foreground">
                                {navigation.find(n => n.href === pathname)?.name || 'Overview'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end gap-0.5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none">
                                Cafe
                            </span>
                            <span className="text-sm font-bold text-foreground leading-none">
                                {cafe?.name || 'Loading...'}
                            </span>
                        </div>
                        <div className="relative group cursor-pointer">
                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-orange-500 to-orange-400 border border-white/20 dark:border-white/10 flex items-center justify-center font-black text-white shadow-lg shadow-orange-500/20 uppercase transition-transform group-hover:scale-105 active:scale-95">
                                {cafe?.name?.[0] || user.email?.[0] || '?'}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-black rounded-full" />
                        </div>

                        <div className="h-8 w-px bg-black/5 dark:bg-white/5 mx-1" />

                        <div className="flex items-center gap-1.5">
                            <ThemeToggle />
                            <button
                                onClick={handleSignOut}
                                className="p-2.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl text-zinc-400 hover:text-red-500 transition-all active:scale-90"
                                title="Sign Out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                    {/* Decorative blurs */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
