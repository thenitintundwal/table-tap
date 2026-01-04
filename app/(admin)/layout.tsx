'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import {
    LogOut,
    Coffee,
    Store,
    TrendingUp,
    LayoutDashboard,
    ChevronRight,
    Menu,
    X
} from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [user, setUser] = useState<any>(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Cafes', href: '/admin/cafes', icon: Store },
        { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
    ]

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black flex" suppressHydrationWarning>
            {/* Desktop Sidebar */}
            <aside
                className={`hidden md:flex flex-col border-r border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-950 sticky top-0 h-screen transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'
                    }`}
            >
                <div className="h-20 flex items-center px-6 border-b border-zinc-200 dark:border-white/5">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="min-w-[32px] h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Coffee className="w-5 h-5 text-white" />
                        </div>
                        {isSidebarOpen && <span className="font-black text-lg tracking-tighter whitespace-nowrap">TableTap</span>}
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${isActive
                                    ? 'bg-orange-500/10 text-orange-500'
                                    : 'text-zinc-500 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-white/5'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'group-hover:translate-x-1 transition-transform'}`} />
                                {isSidebarOpen && <span className="font-bold text-sm">{item.name}</span>}
                                {isActive && isSidebarOpen && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-zinc-200 dark:border-white/5">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors text-zinc-400"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-20 border-b border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-xl px-8 flex items-center justify-between z-[90]">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3 text-sm font-medium text-zinc-400">
                            <span className="hidden sm:inline">Super Admin</span>
                            <ChevronRight className="w-4 h-4 hidden sm:inline" />
                            <span className="text-foreground capitalize">{pathname.split('/').pop() || 'Overview'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-xs font-black uppercase tracking-widest text-orange-500">Root Access</span>
                            <span className="text-sm font-bold truncate max-w-[150px]">{user.email}</span>
                        </div>
                        <div className="h-8 w-px bg-zinc-200 dark:bg-white/5 mx-2" />
                        <ThemeToggle />
                        <button
                            onClick={handleSignOut}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 relative">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/[0.03] rounded-full blur-[120px] pointer-events-none -z-10" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/[0.03] rounded-full blur-[100px] pointer-events-none -z-10" />

                    <div className="max-w-7xl mx-auto min-h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
