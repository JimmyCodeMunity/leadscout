/**
 * Maps our design tokens onto Clerk's appearance API.
 * Values are computed from the active theme so the auth UI matches the app.
 */
export function getClerkAppearance(isDark) {
    return {
        variables: {
            colorPrimary: '#ff7a1a',
            colorPrimaryForeground: '#ffffff',
            colorBackground: isDark ? '#18181b' : '#ffffff',
            colorForeground: isDark ? '#fafafa' : '#18181b',
            colorMuted: isDark ? '#27272b' : '#f4f4f5',
            colorMutedForeground: isDark ? '#a1a1aa' : '#71717a',
            colorNeutral: isDark ? '#fafafa' : '#18181b',
            colorInput: isDark ? '#111113' : '#ffffff',
            colorInputForeground: isDark ? '#fafafa' : '#18181b',
            colorBorder: isDark ? '#313135' : '#d4d4d8',
            colorRing: '#ff7a1a',
            colorDanger: isDark ? '#f87171' : '#dc2626',
            colorSuccess: isDark ? '#c6ff3d' : '#4d7c0f',
            colorWarning: isDark ? '#fbbf24' : '#b45309',
            colorShadow: isDark ? 'rgba(0, 0, 0, 0.55)' : 'rgba(24, 24, 27, 0.10)',
            colorModalBackdrop: isDark ? 'rgba(0, 0, 0, 0.72)' : 'rgba(24, 24, 27, 0.35)',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontFamilyButtons: "'Inter', system-ui, sans-serif",
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
        },
        elements: {
            card: {
                boxShadow: 'none',
                border: `1px solid ${isDark ? '#27272b' : '#e4e4e7'}`,
            },
            headerTitle: {
                fontSize: '1.25rem',
                fontWeight: '700',
            },
            headerSubtitle: {
                color: isDark ? '#a1a1aa' : '#71717a',
            },
            footer: {
                background: 'transparent',
            },
            formButtonPrimary: {
                textTransform: 'none',
                fontWeight: '600',
            },
            socialButtonsBlockButton: {
                borderColor: isDark ? '#313135' : '#d4d4d8',
            },
        },
    }
}
