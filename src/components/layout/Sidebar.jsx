import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
    LayoutDashboard, Users, Search, GitBranch, Settings,
    Radar, ChevronLeft, ChevronRight, LogOut, Menu, X,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import useAuthStore from '@/store/authStore'
import { authApi } from '@/lib/api'
import { Tooltip, TooltipProvider } from '@/components/ui/tooltip'
import toast from 'react-hot-toast'

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/leads', icon: Users, label: 'Leads' },
    { to: '/discovery', icon: Search, label: 'Discovery' },
    { to: '/pipeline', icon: GitBranch, label: 'Pipeline' },
    { to: '/settings', icon: Settings, label: 'Settings' },
]

/* ─────────────────────────────────────────────
   Shared nav link renderer
───────────────────────────────────────────── */
function NavItem({ to, icon: Icon, label, collapsed, onClick }) {
    if (collapsed) {
        return (
            <Tooltip content={label} side="right">
                <NavLink
                    to={to}
                    onClick={onClick}
                    className={({ isActive }) => cn(
                        'flex items-center justify-center h-11 w-full rounded-xl transition-colors duration-150',
                        isActive
                            ? 'bg-orange-500/15 text-orange-400'
                            : 'text-text-muted hover:text-text-primary hover:bg-surface-3'
                    )}
                >
                    <Icon size={20} />
                </NavLink>
            </Tooltip>
        )
    }

    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) => cn(
                'flex items-center gap-3 h-11 px-4 rounded-xl text-base font-medium transition-colors duration-150',
                isActive
                    ? 'bg-orange-500/15 text-orange-400'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-3'
            )}
        >
            <Icon size={20} className="shrink-0" />
            <span className="truncate">{label}</span>
        </NavLink>
    )
}

/* ─────────────────────────────────────────────
   Sidebar inner content (shared desktop + mobile)
───────────────────────────────────────────── */
function SidebarContent({ collapsed, onToggle, onNavClick }) {
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()

    const handleLogout = async () => {
        try { await authApi.logout() } catch (_) { }
        logout()
        navigate('/login')
        toast.success('Logged out')
    }

    return (
        <div className="flex flex-col h-full">
            {/* Logo row */}
            <div className={cn(
                'flex items-center h-16 px-4 border-b border-border-subtle shrink-0',
                collapsed ? 'justify-center' : 'gap-3'
            )}>
                <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
                    <Radar size={19} className="text-white" />
                </div>
                {!collapsed && (
                    <span className="text-lg font-bold text-text-primary tracking-tight animate-fade-in">
                        LeadScout
                    </span>
                )}
            </div>

            {/* Nav links */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavItem
                        key={item.to}
                        {...item}
                        collapsed={collapsed}
                        onClick={onNavClick}
                    />
                ))}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-border-subtle space-y-1 shrink-0">
                {/* User info */}
                {!collapsed && user && (
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl">
                        <div className="w-9 h-9 rounded-full bg-orange-500/20 border-2 border-orange-500/30 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-orange-400">{getInitials(user.name)}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-text-primary truncate">{user.name}</p>
                            <p className="text-xs text-text-muted truncate">{user.email}</p>
                        </div>
                    </div>
                )}

                {/* Logout */}
                {collapsed ? (
                    <Tooltip content="Logout" side="right">
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center h-11 w-full rounded-xl text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut size={20} />
                        </button>
                    </Tooltip>
                ) : (
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 h-11 w-full px-4 rounded-xl text-base text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                )}

                {/* Desktop collapse toggle — hidden on mobile */}
                {onToggle && (
                    <button
                        onClick={onToggle}
                        className={cn(
                            'hidden md:flex items-center h-9 w-full rounded-xl text-text-disabled hover:text-text-muted hover:bg-surface-3 transition-colors',
                            collapsed ? 'justify-center' : 'justify-end px-3'
                        )}
                    >
                        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                )}
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────
   Main export — handles both desktop & mobile
───────────────────────────────────────────── */
export default function Sidebar({ collapsed, onToggle }) {
    const [mobileOpen, setMobileOpen] = useState(false)
    const location = useLocation()

    // Close mobile drawer when route changes
    useEffect(() => {
        setMobileOpen(false)
    }, [location.pathname])

    // Lock body scroll when drawer is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [mobileOpen])

    return (
        <TooltipProvider>
            {/* ══════════════════════════════════
          DESKTOP sidebar (md and up)
      ══════════════════════════════════ */}
            <aside className={cn(
                'hidden md:flex flex-col h-full border-r border-border-subtle bg-surface-1 transition-all duration-200 shrink-0',
                collapsed ? 'w-16' : 'w-64'
            )}>
                <SidebarContent collapsed={collapsed} onToggle={onToggle} />
            </aside>

            {/* ══════════════════════════════════
          MOBILE — top header bar
      ══════════════════════════════════ */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 h-14 px-4 bg-surface-1 border-b border-border-subtle">
                {/* Hamburger */}
                <button
                    onClick={() => setMobileOpen(true)}
                    className="flex items-center justify-center w-10 h-10 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-3 active:bg-surface-4 transition-colors"
                    aria-label="Open menu"
                >
                    <Menu size={22} />
                </button>

                {/* Logo */}
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-md shadow-orange-500/30">
                        <Radar size={16} className="text-white" />
                    </div>
                    <span className="text-base font-bold text-text-primary tracking-tight">LeadScout</span>
                </div>
            </div>

            {/* ══════════════════════════════════
          MOBILE — drawer overlay
      ══════════════════════════════════ */}
            {/* Backdrop */}
            <div
                className={cn(
                    'md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-250',
                    mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                )}
                onClick={() => setMobileOpen(false)}
            />

            {/* Drawer panel */}
            <div
                className={cn(
                    'md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-surface-1 border-r border-border-subtle',
                    'transform transition-transform duration-250 ease-out',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Close button inside drawer */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="absolute top-3 right-3 flex items-center justify-center w-9 h-9 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors z-10"
                    aria-label="Close menu"
                >
                    <X size={18} />
                </button>

                <SidebarContent
                    collapsed={false}
                    onToggle={null}
                    onNavClick={() => setMobileOpen(false)}
                />
            </div>
        </TooltipProvider>
    )
}
