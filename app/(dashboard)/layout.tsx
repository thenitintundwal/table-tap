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
    ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { useCafe } from '@/hooks/useCafe'
import { useOrderRealtime } from '@/hooks/useOrderRealtime'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [user, setUser] = useState<any>(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

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
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
        { name: 'Menu Items', href: '/dashboard/menu', icon: UtensilsCrossed },
        { name: 'QR Codes', href: '/dashboard/qr-code', icon: QrCode },
        { name: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp },
    ]

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-64' : 'w-20'
                    } border-r border-white/5 bg-black/50 backdrop-blur-xl transition-all duration-300 flex flex-col z-50`}
            >
                <div className="h-16 flex items-center px-6 border-b border-white/5">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="min-w-[32px] h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Coffee className="w-5 h-5 text-white" />
                        </div>
                        {isSidebarOpen && <span className="font-bold text-xl tracking-tight whitespace-nowrap">TableTap</span>}
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
                                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'group-hover:scale-110 transition-transform'}`} />
                                {isSidebarOpen && <span className="font-medium">{item.name}</span>}
                                {isActive && isSidebarOpen && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition-all group"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        {isSidebarOpen && <span className="font-medium">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-md px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                        Dashboard <ChevronRight className="w-4 h-4" />
                        <span className="text-zinc-200">
                            {navigation.find(n => n.href === pathname)?.name || 'Overview'}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs text-zinc-500 leading-none">Logged in as</p>
                            <p className="text-sm font-medium text-zinc-300">{user.email}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/10 flex items-center justify-center font-bold text-zinc-400 shadow-inner">
                            {user.email?.[0].toUpperCase()}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 relative">
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
