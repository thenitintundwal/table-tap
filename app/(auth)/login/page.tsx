'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Coffee, Lock, Mail, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            alert(error.message)
        } else {
            router.push('/dashboard')
        }
        setLoading(false)
    }

    const handleGoogleLogin = async () => {
        setGoogleLoading(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
        if (error) {
            alert(error.message)
            setGoogleLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-white font-sans">
            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Brand Logo */}
                <div className="flex flex-col items-center justify-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/20 mb-6 rotate-3 hover:rotate-6 transition-transform duration-300">
                        <Coffee className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                        TableTap
                    </h1>
                    <p className="text-zinc-500 text-sm font-medium mt-2">admin portal</p>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl">
                    <div className="mb-8 text-center sm:text-left">
                        <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
                        <p className="text-zinc-500 text-sm">Please enter your details to sign in.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-4">Email</label>
                                <div className="relative group">
                                    <div className="absolute left-0 inset-y-0 w-12 flex items-center justify-center text-zinc-600 group-focus-within:text-orange-500 transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="you@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all font-medium"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-4">Password</label>
                                <div className="relative group">
                                    <div className="absolute left-0 inset-y-0 w-12 flex items-center justify-center text-zinc-600 group-focus-within:text-orange-500 transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all font-medium"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs px-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="w-4 h-4 rounded border border-zinc-700 bg-black/40 flex items-center justify-center transition-colors group-hover:border-zinc-500">
                                    <input type="checkbox" className="hidden peer" />
                                    <div className="w-2 h-2 bg-orange-500 rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity" />
                                </div>
                                <span className="text-zinc-500 font-medium group-hover:text-zinc-400 transition-colors">Remember me</span>
                            </label>
                            <button type="button" className="text-orange-500 font-bold hover:text-orange-400 transition-colors">
                                Forgot password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white p-4 rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>Sign in <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <div className="my-8 flex items-center gap-4">
                        <div className="h-px bg-white/10 flex-1" />
                        <span className="text-xs text-zinc-600 font-bold uppercase tracking-widest">Or continue with</span>
                        <div className="h-px bg-white/10 flex-1" />
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={googleLoading}
                        className="w-full bg-white hover:bg-zinc-200 text-black p-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-70"
                    >
                        {googleLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />
                        ) : (
                            <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Google
                            </>
                        )}
                    </button>

                    <div className="mt-8 text-center">
                        <p className="text-zinc-500 text-sm">
                            Don't have an account?{' '}
                            <Link href="/signup" className="text-orange-500 font-bold hover:text-orange-400 transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                        © {new Date().getFullYear()} TableTap Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    )
}
