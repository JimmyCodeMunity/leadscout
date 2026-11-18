import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClerkProvider, useAuth } from '@clerk/react'
import { Toaster } from 'react-hot-toast'
import AppLayout from '@/components/layout/AppLayout'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import DashboardPage from '@/pages/DashboardPage'
import LeadsPage from '@/pages/LeadsPage'
import DiscoveryPage from '@/pages/DiscoveryPage'
import PipelinePage from '@/pages/PipelinePage'
import SettingsPage from '@/pages/SettingsPage'
import useThemeStore from '@/store/themeStore'
import { getClerkAppearance } from '@/lib/clerkAppearance'
import { setAuthTokenGetter } from '@/lib/api'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

/** Keeps the axios client supplied with Clerk's latest session token. */
function AuthTokenBridge() {
  const { isSignedIn, getToken } = useAuth()

  useEffect(() => {
    if (isSignedIn) {
      setAuthTokenGetter((options) => getToken(options))
    } else {
      setAuthTokenGetter(null)
    }
    return () => setAuthTokenGetter(null)
  }, [isSignedIn, getToken])

  return null
}

/** ClerkProvider inside the router so Clerk can navigate with React Router. */
function ClerkRoot({ children }) {
  const navigate = useNavigate()
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme)

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={getClerkAppearance(resolvedTheme === 'dark')}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      afterSignOutUrl="/login"
      signInUrl="/login"
      signUpUrl="/signup"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      {children}
    </ClerkProvider>
  )
}

function MissingClerkConfig() {
  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-border-default bg-surface-2 p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-orange-400 mb-2">Configuration needed</p>
        <h1 className="text-xl font-bold text-text-primary mb-3">Add your Clerk publishable key</h1>
        <p className="text-sm text-text-muted mb-4">
          Create a key in the Clerk dashboard and add it to your frontend environment:
        </p>
        <pre className="rounded-lg bg-surface-3 border border-border-subtle p-4 text-sm text-text-secondary overflow-x-auto">
          <code>VITE_CLERK_PUBLISHABLE_KEY=pk_test_...</code>
        </pre>
        <p className="text-xs text-text-disabled mt-4">
          Restart the Vite dev server after saving the file. The matching secret key belongs in the backend{' '}
          <code className="text-orange-400">.env</code>.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  if (!PUBLISHABLE_KEY) return <MissingClerkConfig />

  return (
    <BrowserRouter>
      <ClerkRoot>
        <QueryClientProvider client={queryClient}>
          <AuthTokenBridge />
          <Routes>
            {/* Public marketing site */}
            <Route index element={<LandingPage />} />

            {/* Public — Clerk handles the sign-in / sign-up flow */}
            <Route path="/login/*" element={<LoginPage />} />
            <Route path="/signup/*" element={<SignupPage />} />

            {/* Protected */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/discovery" element={<DiscoveryPage />} />
              <Route path="/pipeline" element={<PipelinePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </QueryClientProvider>
      </ClerkRoot>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'var(--color-surface-2)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-default)',
            borderRadius: '8px',
            fontSize: '12px',
            padding: '10px 14px',
          },
          success: { iconTheme: { primary: 'var(--toast-success)', secondary: 'var(--color-surface-2)' } },
          error: { iconTheme: { primary: 'var(--toast-error)', secondary: 'var(--color-surface-2)' } },
        }}
      />
    </BrowserRouter>
  )
}
