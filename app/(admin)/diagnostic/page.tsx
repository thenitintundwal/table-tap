'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'

export default function DiagnosticPage() {
    const { user } = useUser()
    const [superAdmins, setSuperAdmins] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchSuperAdmins() {
            const { data, error } = await supabase
                .from('super_admins')
                .select('*')

            if (error) {
                console.error('Error fetching super admins:', error)
            } else {
                setSuperAdmins(data || [])
            }
            setLoading(false)
        }

        fetchSuperAdmins()
    }, [])

    const addCurrentUser = async () => {
        if (!user?.email) return

        const { error } = await supabase
            .from('super_admins')
            .insert({ email: user.email })

        if (error) {
            console.error('Error adding admin:', error)
            alert(`Error: ${error.message}`)
        } else {
            alert('Successfully added! Refresh the page.')
            window.location.reload()
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-white/10">
                    <h1 className="text-2xl font-bold mb-4">Admin Diagnostic Tool</h1>

                    <div className="space-y-4">
                        <div>
                            <h2 className="font-bold text-lg mb-2">Current User</h2>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Email: <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{user?.email || 'Not logged in'}</span>
                            </p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                                ID: <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs">{user?.id || 'N/A'}</span>
                            </p>
                        </div>

                        <div>
                            <h2 className="font-bold text-lg mb-2">Super Admins in Database</h2>
                            {loading ? (
                                <p className="text-sm text-zinc-500">Loading...</p>
                            ) : superAdmins.length === 0 ? (
                                <p className="text-sm text-red-500">⚠️ No super admins found in database!</p>
                            ) : (
                                <ul className="space-y-1">
                                    {superAdmins.map((admin) => (
                                        <li key={admin.id} className="text-sm font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                                            {admin.email}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div>
                            <h2 className="font-bold text-lg mb-2">Status</h2>
                            {user?.email && superAdmins.some(admin => admin.email === user.email) ? (
                                <p className="text-sm text-green-500">✅ You are a super admin!</p>
                            ) : (
                                <p className="text-sm text-red-500">❌ You are NOT a super admin</p>
                            )}
                        </div>

                        {user?.email && !superAdmins.some(admin => admin.email === user.email) && (
                            <button
                                onClick={addCurrentUser}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors"
                            >
                                Add My Email as Super Admin
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-white/10">
                    <h2 className="font-bold text-lg mb-4">Manual SQL (Run in Supabase Dashboard)</h2>
                    <pre className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-sm overflow-x-auto">
                        {`INSERT INTO super_admins (email)
VALUES ('${user?.email || 'your-email@example.com'}')
ON CONFLICT (email) DO NOTHING;`}
                    </pre>
                </div>
            </div>
        </div>
    )
}
