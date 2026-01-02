import { createServerClient, type CookieOptions } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export function createClient() {
    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                async get(name: string) {
                    const cookieStore = await cookies()
                    return cookieStore.get(name)?.value
                },
                async set(name: string, value: string, options: CookieOptions) {
                    const cookieStore = await cookies()
                    try {
                        cookieStore.set({ name, value, ...options })
                    } catch (error) {
                        // This can be ignored if you have middleware refreshing user sessions.
                    }
                },
                async remove(name: string, options: CookieOptions) {
                    const cookieStore = await cookies()
                    try {
                        cookieStore.set({ name, value: '', ...options })
                    } catch (error) {
                        // This can be ignored if you have middleware refreshing user sessions.
                    }
                },
            },
        }
    )
}
