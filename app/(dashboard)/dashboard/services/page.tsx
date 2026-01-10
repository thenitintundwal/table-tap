'use client'

import {
    LayoutGrid,
    ChefHat,
    Users,
    BarChart3,
    Truck,
    Megaphone,
    ArrowRight,
    CheckCircle2,
    Lock
} from 'lucide-react'
import Link from 'next/link'

interface ServiceCardProps {
    title: string
    description: string
    icon: React.ElementType
    color: string
    status: 'active' | 'available' | 'coming_soon'
    href: string
}

function ServiceCard({ title, description, icon: Icon, color, status, href }: ServiceCardProps) {
    const isLocked = status === 'coming_soon'

    return (
        <Link
            href={isLocked ? '#' : href}
            className={`group relative overflow-hidden bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-[2.5rem] p-8 transition-all duration-500 shadow-sm ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-50 dark:hover:bg-white/[0.07] hover:border-orange-500/30 hover:-translate-y-1'
                }`}
        >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500 ${color.replace('text-', 'bg-').replace('500', '500/10')} border border-current/10`}>
                <Icon className={`w-8 h-8 ${color}`} />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-zinc-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors uppercase tracking-tight italic">
                        {title}
                    </h3>
                    {status === 'active' && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />}
                    {status === 'coming_soon' && <Lock className="w-5 h-5 text-zinc-400 dark:text-zinc-600" />}
                </div>

                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed font-medium min-h-[60px]">
                    {description}
                </p>

                <div className="pt-6 flex items-center text-[10px] font-black uppercase tracking-[0.2em]">
                    {status === 'active' ? (
                        <span className="text-emerald-600 dark:text-emerald-500 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-500/10">
                            Active Application
                        </span>
                    ) : status === 'coming_soon' ? (
                        <span className="text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-zinc-100 dark:border-white/5">Reserved Access</span>
                    ) : (
                        <span className="text-orange-600 dark:text-orange-500 flex items-center gap-2 group-hover:translate-x-1 transition-transform bg-orange-50 dark:bg-orange-500/10 px-5 py-2.5 rounded-xl border border-orange-100 dark:border-orange-500/10 italic">
                            Launch Module <ArrowRight className="w-4 h-4" />
                        </span>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default function ServicesPage() {
    const services: ServiceCardProps[] = [
        {
            title: "InventoryOS",
            description: "Track ingredients, manage stock levels, and get low-stock alerts automatically based on orders.",
            icon: LayoutGrid,
            color: "text-blue-500",
            status: "active",
            href: "/dashboard/inventory"
        },
        {
            title: "Kitchen Display",
            description: "Replace paper tickets with a digital KDS. Real-time order syncying for your kitchen staff.",
            icon: ChefHat,
            color: "text-orange-500",
            status: "active",
            href: "/dashboard/kds"
        },
        {
            title: "Staff Command",
            description: "Manage employee shifts, roles, and access permissions. Track performance per server.",
            icon: Users,
            color: "text-purple-500",
            status: "active",
            href: "/dashboard/staff"
        },
        {
            title: "CRM & Loyalty",
            description: "Build a customer database automatically. Send offers and manage loyalty points.",
            icon: Megaphone,
            color: "text-pink-500",
            status: "active",
            href: "/dashboard/crm"
        },
        {
            title: "Supplier Hub",
            description: "Connect with local ingredient suppliers. Automate purchase orders when stock is low.",
            icon: Truck,
            color: "text-emerald-500",
            status: "active",
            href: "/dashboard/suppliers"
        },
        {
            title: "Advanced Analytics",
            description: "Deep dive into item profitability, peak hours, and customer retention metrics.",
            icon: BarChart3,
            color: "text-cyan-500",
            status: "active",
            href: "/dashboard/analytics/pro"
        }
    ]

    return (
        <div className="p-10 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
            <div className="space-y-4">
                <h1 className="text-5xl font-black text-zinc-900 dark:text-white italic tracking-tighter uppercase">
                    Services Hub
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl text-xl leading-relaxed">
                    Supercharge your TableTap experience with powerful add-on modules.
                    Manage everything from stock to staff in one central intelligence command.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service, i) => (
                    <ServiceCard key={i} {...service} />
                ))}
            </div>
        </div>
    )
}
