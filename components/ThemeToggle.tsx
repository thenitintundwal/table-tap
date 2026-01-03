"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <button className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 text-zinc-500">
                <Sun className="h-5 w-5" />
            </button>
        )
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-foreground transition-colors"
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
                <Moon className="h-5 w-5 text-orange-500" />
            ) : (
                <Sun className="h-5 w-5 text-orange-500" />
            )}
        </button>
    )
}
