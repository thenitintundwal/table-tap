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
            className={`group relative overflow-hidden bg-zinc-900 border border-white/5 rounded-3xl p-6 transition-all duration-300 ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-800/50 hover:border-white/10 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1'
                }`}
        >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300 ${color.replace('text-', 'bg-').replace('500', '500/10')}`}>
                <Icon className={`w-7 h-7 ${color}`} />
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white group-hover:text-orange-500 transition-colors">
                        {title}
                    </h3>
                    {status === 'active' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    {status === 'coming_soon' && <Lock className="w-5 h-5 text-zinc-600" />}
                </div>

                <p className="text-zinc-500 text-sm leading-relaxed font-medium min-h-[60px]">
                    {description}
                </p>

                <div className="pt-4 flex items-center text-xs font-bold uppercase tracking-widest">
                    {status === 'active' ? (
                        <span className="text-emerald-500 flex items-center gap-2">
                            Installed
                        </span>
                    ) : status === 'coming_soon' ? (
                        <span className="text-zinc-600">Coming Soon</span>
                    ) : (
                        <span className="text-orange-500 flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                            Launch App <ArrowRight className="w-3 h-3" />
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
        <div className="p-8 max-w-7xl mx-auto space-y-10">
            <div className="space-y-2">
                <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">
                    Services Hub
                </h1>
                <p className="text-zinc-500 font-medium max-w-2xl">
                    Supercharge your TableTap experience with powerful add-on modules.
                    Manage everything from stock to staff in one place.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, i) => (
                    <ServiceCard key={i} {...service} />
                ))}
            </div>
        </div>
    )
}
