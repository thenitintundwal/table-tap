'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Load POSContent only on the client side to bypass hydration errors caused by browser extensions
const POSContent = dynamic(() => import('./POSContent'), {
    ssr: false,
    loading: () => (
        <div className="h-[60vh] flex items-center justify-center bg-transparent">
            <Loader2 className="w-8 h-8 text-orange-600 dark:text-orange-500 animate-spin" />
        </div>
    )
})

export default function POSPage() {
    return <POSContent />
}
