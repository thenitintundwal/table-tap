'use client'

import { useCafe } from '@/hooks/useCafe'
import CafeForm from './CafeForm'
import { Loader2 } from 'lucide-react'

export default function CafeGuard({ children }: { children: React.ReactNode }) {
    const { cafe, isLoading, createCafe } = useCafe()

    if (isLoading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-zinc-500 text-sm animate-pulse">Checking your cafe setup...</p>
            </div>
        )
    }

    if (!cafe) {
        return (
            <div className="flex h-[70vh] items-center justify-center p-6">
                <CafeForm
                    onSubmit={async (values) => {
                        await createCafe.mutateAsync(values)
                    }}
                />
            </div>
        )
    }

    return <>{children}</>
}
