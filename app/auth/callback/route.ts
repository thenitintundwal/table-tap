
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.exchangeCodeForSession(code)

        if (user) {
            const { data: adminData } = await supabase
                .from('super_admins')
                .select('email')
                .eq('email', user.email!)
                .maybeSingle()

            if (adminData) {
                return NextResponse.redirect(`${requestUrl.origin}/admin`)
            }
        }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}
