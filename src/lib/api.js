import axios from 'axios'

// Dev:        VITE_API_URL is empty → Vite proxy rewrites /api → http://localhost:5000
// Production: VITE_API_URL=https://leadserver.vercel.app → requests go to deployed backend
const _base = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '') // strip any trailing slashes
const BASE_URL = _base ? `${_base}/api` : '/api'

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
})

// Clerk's getToken() is registered by <AuthTokenBridge /> once ClerkProvider mounts.
// Keeping it in a getter lets every request use a fresh, auto-refreshed session token.
let tokenGetter = null

export function setAuthTokenGetter(getter) {
    tokenGetter = getter
}

// Effects can run in a different order than React Query, and Vite HMR can leave
// a stale copy of this module. Fall back to Clerk's global session so the very
// first /auth/me call after sign-in still carries a token.
async function resolveToken(options) {
    if (tokenGetter) return tokenGetter(options)

    const clerk = typeof window !== 'undefined' ? window.Clerk : null
    if (clerk?.session?.getToken) return clerk.session.getToken(options)

    return null
}

api.interceptors.request.use(async (config) => {
    if (config.headers?.Authorization) return config

    const hasGetter = Boolean(tokenGetter || (typeof window !== 'undefined' && window.Clerk?.session?.getToken))
    if (!hasGetter) {
        if (import.meta.env.DEV && config.url?.includes('/auth/me')) {
            console.warn('[auth] no Clerk session available — request sent unauthenticated')
        }
        return config
    }

    try {
        const token = await resolveToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
            if (import.meta.env.DEV && config.url?.includes('/auth/me')) {
                console.info(`[auth] attached Clerk token (${token.length} chars) to ${config.url}`)
            }
        } else if (import.meta.env.DEV && config.url?.includes('/auth/me')) {
            console.warn('[auth] Clerk returned no token — request sent unauthenticated')
        }
    } catch (err) {
        if (import.meta.env.DEV && config.url?.includes('/auth/me')) {
            console.warn('[auth] Clerk getToken() threw:', err?.message || err)
        }
        // Let the request go through unauthenticated; the API responds with 401.
    }
    return config
})

// Clerk refreshes session tokens roughly every minute. If the backend still sees
// an expired token, force a fresh one and retry the request exactly once.
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        // Only refresh when the failed request actually carried a token.
        // Without this, signed-out requests are retried pointlessly and flood
        // the console with identical 401s.
        const sentWithToken = Boolean(
            originalRequest?.headers?.Authorization ||
                originalRequest?.headers?.get?.('Authorization')
        )
        const canRefresh =
            tokenGetter ||
            (typeof window !== 'undefined' && window.Clerk?.session?.getToken)
        if (
            error.response?.status === 401 &&
            originalRequest &&
            sentWithToken &&
            !originalRequest._clerkRetry &&
            canRefresh
        ) {
            originalRequest._clerkRetry = true
            try {
                const token = await resolveToken({ skipCache: true })
                if (token) {
                    originalRequest.headers = originalRequest.headers || {}
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    return api(originalRequest)
                }
            } catch {
                // Fall through and reject with the original error.
            }
        }
        return Promise.reject(error)
    }
)

export default api

// --- Auth (sessions are managed by Clerk; the API syncs the local user) ---
export const authApi = {
    // The first call after sign-in must not depend on effect ordering, so the
    // caller can pass a freshly minted token explicitly.
    me: (token) =>
        api.get(
            '/auth/me',
            token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
        ),
    updateMe: (data) => api.patch('/auth/me', data),
}

// --- Leads ---
export const leadsApi = {
    list: (params) => api.get('/leads', { params }),
    get: (id) => api.get(`/leads/${id}`),
    update: (id, data) => api.patch(`/leads/${id}`, data),
    delete: (id) => api.delete(`/leads/${id}`),
    addNote: (id, text) => api.post(`/leads/${id}/notes`, { text }),
    addOutreach: (id, data) => api.post(`/leads/${id}/outreach`, data),
    bulkUpdate: (ids, updates) => api.post('/leads/bulk-update', { ids, updates }),
    export: () => api.get('/leads/export', { responseType: 'blob' }),
}

// --- Discovery ---
export const discoveryApi = {
    run: (data) => api.post('/discovery/run', data),
    getJob: (jobId) => api.get(`/discovery/jobs/${jobId}`),
}

// --- Saved Searches ---
export const savedSearchesApi = {
    list: () => api.get('/saved-searches'),
    create: (data) => api.post('/saved-searches', data),
    update: (id, data) => api.patch(`/saved-searches/${id}`, data),
    delete: (id) => api.delete(`/saved-searches/${id}`),
}

// --- Dashboard ---
export const dashboardApi = {
    summary: () => api.get('/dashboard/summary'),
}
