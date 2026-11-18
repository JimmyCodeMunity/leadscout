import { create } from 'zustand'

const STORAGE_KEY = 'leadscout-theme'
export const THEMES = ['light', 'dark', 'system']

const getStoredTheme = () => {
    if (typeof window === 'undefined') return 'system'
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return THEMES.includes(stored) ? stored : 'system'
}

export const resolveTheme = (theme) => {
    if (theme !== 'system') return theme
    if (typeof window === 'undefined') return 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const applyTheme = (theme) => {
    if (typeof document === 'undefined') return resolveTheme(theme)
    const resolved = resolveTheme(theme)
    const root = document.documentElement

    root.dataset.theme = resolved
    root.classList.toggle('dark', resolved === 'dark')
    root.style.colorScheme = resolved

    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', resolved === 'dark' ? '#0a0a0b' : '#f6f6f7')

    return resolved
}

const initialTheme = getStoredTheme()

const useThemeStore = create((set, get) => ({
    theme: initialTheme,
    resolvedTheme: resolveTheme(initialTheme),

    setTheme: (theme) => {
        if (!THEMES.includes(theme)) return
        window.localStorage.setItem(STORAGE_KEY, theme)
        const resolvedTheme = applyTheme(theme)
        set({ theme, resolvedTheme })
    },

    // Keep the UI in sync when the OS theme changes while "system" is selected.
    syncSystemTheme: () => {
        if (get().theme !== 'system') return
        const resolvedTheme = applyTheme('system')
        set({ resolvedTheme })
    },
}))

// Apply the persisted theme as soon as this module loads (before React paints).
applyTheme(initialTheme)

if (typeof window !== 'undefined') {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => useThemeStore.getState().syncSystemTheme()
    if (media.addEventListener) media.addEventListener('change', onChange)
    else media.addListener(onChange)
}

export default useThemeStore
