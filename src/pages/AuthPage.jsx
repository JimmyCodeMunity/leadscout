import { Link, Navigate } from 'react-router-dom'
import { SignIn, SignUp, useAuth } from '@clerk/react'
import { Radar } from 'lucide-react'
import useThemeStore from '@/store/themeStore'
import { getClerkAppearance } from '@/lib/clerkAppearance'
import ThemeToggle from '@/components/layout/ThemeToggle'

function AuthLoading() {
    return (
        <div className="min-h-screen bg-surface-0 flex items-center justify-center">
            <div className="flex items-center gap-3 text-text-muted">
                <span className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-base">Loading…</span>
            </div>
        </div>
    )
}

export default function AuthPage({ mode = 'sign-in' }) {
    const { isLoaded, isSignedIn } = useAuth()
    const resolvedTheme = useThemeStore((s) => s.resolvedTheme)
    const isDark = resolvedTheme === 'dark'
    const appearance = getClerkAppearance(isDark)

    if (!isLoaded) return <AuthLoading />
    if (isSignedIn) return <Navigate to="/dashboard" replace />

    const isSignUp = mode === 'sign-up'

    return (
        <div className="min-h-screen bg-surface-0 flex flex-col">
            <header className="flex items-center justify-between px-5 py-4">
                <Link to="/" aria-label="Back to Prospectly home" className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                        <Radar size={18} className="text-white" />
                    </div>
                    <span className="text-lg font-bold text-text-primary tracking-tight">Prospectly</span>
                </Link>
                <ThemeToggle className="w-auto" />
            </header>

            <main className="flex-1 flex items-center justify-center px-4 pb-16">
                <div className="w-full max-w-md animate-fade-in">
                    {isSignUp ? (
                        <SignUp
                            routing="path"
                            path="/signup"
                            signInUrl="/login"
                            fallbackRedirectUrl="/dashboard"
                            appearance={appearance}
                        />
                    ) : (
                        <SignIn
                            routing="path"
                            path="/login"
                            signUpUrl="/signup"
                            fallbackRedirectUrl="/dashboard"
                            appearance={appearance}
                        />
                    )}
                </div>
            </main>

            <footer className="px-5 py-4 text-center text-xs text-text-disabled">
                Secured by Clerk · User data stored in your own database
            </footer>
        </div>
    )
}
