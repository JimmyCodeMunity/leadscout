import { useEffect, useRef, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth, useClerk } from '@clerk/react'
import { useQuery } from '@tanstack/react-query'
import Sidebar from './Sidebar'
import useAuthStore from '@/store/authStore'
import { authApi, setAuthTokenGetter } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function LoadingScreen({ label = 'Loading…' }) {
    return (
        <div className="min-h-screen bg-surface-0 flex items-center justify-center">
            <div className="flex items-center gap-3 text-text-muted">
                <span className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-base">{label}</span>
            </div>
        </div>
    )
}

export default function AppLayout() {
    const { isLoaded, isSignedIn, userId, getToken } = useAuth()
    const { signOut } = useClerk()
    const user = useAuthStore((s) => s.user)
    const setUser = useAuthStore((s) => s.setUser)
    const clearUser = useAuthStore((s) => s.clearUser)
    const [collapsed, setCollapsed] = useState(false)

    // Keep a stable reference so effects/queryFns don't re-subscribe on every render.
    const getTokenRef = useRef(getToken)
    useEffect(() => {
        getTokenRef.current = getToken
    }, [getToken])

    // Register the token getter for all API requests as soon as we are signed in.
    useEffect(() => {
        if (isSignedIn) {
            setAuthTokenGetter((options) => getTokenRef.current(options))
        } else {
            setAuthTokenGetter(null)
            clearUser()
        }
        return () => setAuthTokenGetter(null)
    }, [isSignedIn, clearUser])

    // Sync Clerk's account with the local Mongo user that owns leads/searches.
    const {
        data: syncedUser,
        error,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ['auth-me', userId],
        enabled: isLoaded && isSignedIn && Boolean(userId),
        retry: 1,
        staleTime: 5 * 60_000,
        queryFn: async () => {
            setAuthTokenGetter((options) => getTokenRef.current(options))
            const res = await authApi.me()
            return res.data.user
        },
    })

    // Mirror the synced profile into the shared Zustand store for the rest of the UI.
    useEffect(() => {
        if (syncedUser) setUser(syncedUser)
    }, [syncedUser, setUser])

    if (!isLoaded) return <LoadingScreen />

    if (!isSignedIn) return <Navigate to="/login" replace />

    if (isLoading && !user) return <LoadingScreen label="Syncing your account…" />

    if (error && !user) {
        return (
            <div className="min-h-screen bg-surface-0 flex items-center justify-center p-6">
                <div className="w-full max-w-md rounded-2xl border border-border-default bg-surface-2 p-8 text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                        <AlertCircle size={22} className="text-red-400" />
                    </div>
                    <h1 className="text-lg font-bold text-text-primary">We couldn't load your account</h1>
                    <p className="text-sm text-text-muted mt-2">
                        {error.response?.data?.error?.message || 'Please check your connection and try again.'}
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <Button onClick={() => refetch()}>Try again</Button>
                        <Button
                            variant="secondary"
                            onClick={async () => {
                                try {
                                    await signOut({ redirectUrl: '/login' })
                                } catch {
                                    toast.error('Could not sign out')
                                }
                            }}
                        >
                            Sign out
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // Query succeeded but the store mirror hasn't committed yet.
    if (!user) return <LoadingScreen label="Syncing your account…" />

    return (
        <div className="flex h-screen overflow-hidden bg-surface-0">
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
            {/*
        pt-14 = clears the fixed 56px mobile top header (h-14)
        md:pt-0 = no offset needed on desktop (sidebar is static, not fixed)
      */}
            <main className="flex-1 overflow-y-auto min-w-0 pt-14 md:pt-0">
                <Outlet />
            </main>
        </div>
    )
}
