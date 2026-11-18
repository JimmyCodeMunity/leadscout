import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import useThemeStore from '@/store/themeStore'

/**
 * Quick light/dark switch used in the sidebar and auth screens.
 * Hidden on the settings page? It renders a full 3-way picker there.
 */
export default function ThemeToggle({ collapsed = false, className }) {
    const resolvedTheme = useThemeStore((s) => s.resolvedTheme)
    const setTheme = useThemeStore((s) => s.setTheme)
    const isDark = resolvedTheme === 'dark'
    const nextTheme = isDark ? 'light' : 'dark'
    const label = isDark ? 'Light mode' : 'Dark mode'

    return (
        <button
            type="button"
            onClick={() => setTheme(nextTheme)}
            title={label}
            aria-label={`Switch to ${label}`}
            className={cn(
                'flex items-center h-11 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors',
                collapsed ? 'justify-center w-full' : 'gap-3 w-full px-4 text-base',
                className
            )}
        >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {!collapsed && <span>{label}</span>}
        </button>
    )
}
