import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        })
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const isLogin = request.nextUrl.pathname === '/login'
    const isAdminPath = request.nextUrl.pathname.startsWith('/admin')
    const isDashboardPath = request.nextUrl.pathname.startsWith('/dashboard')

    // 1. Unauthenticated users
    if (!user) {
        if (isAdminPath || isDashboardPath) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        return response
    }

    // 2. Authenticated users - Check Admin status
    const { data: adminData } = await supabase
        .from('super_admins')
        .select('email')
        .eq('email', user.email!)
        .maybeSingle()

    const isAdmin = !!adminData

    if (isAdmin) {
        // Admins should be on /admin, not /dashboard or /login
        if (isDashboardPath || isLogin) {
            return NextResponse.redirect(new URL('/admin', request.url))
        }
    } else {
        // Non-admins should NOT be on /admin or /login
        if (isAdminPath || isLogin) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return response
}

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*', '/login'],
}
