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

api.interceptors.request.use(async (config) => {
    if (config.headers?.Authorization || !tokenGetter) return config
    try {
        const token = await tokenGetter()
        if (token) config.headers.Authorization = `Bearer ${token}`
    } catch {
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
        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._clerkRetry &&
            tokenGetter
        ) {
            originalRequest._clerkRetry = true
            try {
                const token = await tokenGetter({ skipCache: true })
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
    me: () => api.get('/auth/me'),
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
