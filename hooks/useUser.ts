'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useEffect } from 'react'

export function useUser() {
    const queryClient = useQueryClient()

    const { data: user, isLoading, error } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            console.log('[useUser] Fetching user...')
            const { data: { user } } = await supabase.auth.getUser()
            console.log('[useUser] getUser result:', user?.email || 'null')
            if (user) return user

            // Fallback for fast redirects where getUser might lag
            console.log('[useUser] Trying getSession fallback...')
            const { data: { session } } = await supabase.auth.getSession()
            console.log('[useUser] getSession result:', session?.user?.email || 'null')
            return session?.user ?? null
        },
        staleTime: 1000 * 30, // 30 seconds
    })

    console.log('[useUser] Hook state:', { user: user?.email || 'null', isLoading, error })

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                queryClient.setQueryData(['user'], session?.user)
                queryClient.invalidateQueries({ queryKey: ['isAdmin'] })
            } else if (event === 'SIGNED_OUT') {
                queryClient.setQueryData(['user'], null)
                queryClient.invalidateQueries({ queryKey: ['isAdmin'] })
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [queryClient])

    return {
        user,
        isLoading,
        error
    }
}
