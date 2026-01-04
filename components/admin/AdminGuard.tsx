'use client'

import { useAdmin } from '@/hooks/useAdmin'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2, ShieldAlert } from 'lucide-react'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { isAdmin, isLoading } = useAdmin()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAdmin) {
            router.push('/dashboard')
        }
    }, [isAdmin, isLoading, router])

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center gap-4 bg-zinc-50 dark:bg-black">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-zinc-500 text-sm animate-pulse">Verifying privileges...</p>
            </div>
        )
    }

    if (!isAdmin) {
        return null // Will redirect in useEffect
    }

    return <>{children}</>
}
