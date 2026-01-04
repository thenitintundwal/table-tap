'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'

export function useAdmin() {
    const { user, isLoading: isUserLoading } = useUser()

    const { data: isAdmin, isLoading: isAdminLoading, isFetched, error } = useQuery({
        queryKey: ['isAdmin', user?.email],
        queryFn: async () => {
            if (!user?.email) {
                console.log('[useAdmin] No user email found')
                return false
            }

            console.log('[useAdmin] Checking admin status for:', user.email)

            const { data, error } = await supabase
                .from('super_admins')
                .select('email')
                .eq('email', user.email)
                .maybeSingle()

            if (error) {
                console.error('[useAdmin] Error checking admin status:', error)
                return false
            }

            console.log('[useAdmin] Query result:', data)
            console.log('[useAdmin] Is admin:', !!data)

            return !!data
        },
        enabled: !!user?.email,
        staleTime: 0,
        gcTime: 1000 * 60 * 5,
        retry: 2,
        refetchOnWindowFocus: true,
    })

    console.log('[useAdmin] Hook state:', {
        user: user?.email,
        isAdmin,
        isUserLoading,
        isAdminLoading,
        isFetched,
        error
    })

    return {
        isAdmin: !!isAdmin,
        user,
        isLoading: isUserLoading || (!!user?.email && !isFetched),
        isFetched,
        isInitialLoading: isUserLoading || (!!user?.email && isAdminLoading),
        error
    }
}
