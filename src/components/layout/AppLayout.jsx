import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import useAuthStore from '@/store/authStore'
import { authApi } from '@/lib/api'

export default function AppLayout() {
    const { isAuthenticated, setAuth, user } = useAuthStore()
    const navigate = useNavigate()
    const [collapsed, setCollapsed] = useState(false)
    const [loading, setLoading] = useState(!user)

    useEffect(() => {
        if (isAuthenticated && !user) {
            authApi.me()
                .then((res) => setAuth(res.data.user, localStorage.getItem('accessToken')))
                .catch(() => navigate('/login'))
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
            if (!isAuthenticated) navigate('/login')
        }
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-surface-0 flex items-center justify-center">
                <div className="flex items-center gap-3 text-text-muted">
                    <span className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-base">Loading…</span>
                </div>
            </div>
        )
    }

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
