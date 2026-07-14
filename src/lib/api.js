import axios from 'axios'

// Dev:        VITE_API_URL is empty → Vite proxy rewrites /api → http://localhost:5000
// Production: VITE_API_URL=https://leadserver.vercel.app → requests go to deployed backend
const BASE_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api'

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
})

// Attach access token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Auto-refresh on 401 TOKEN_EXPIRED
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach((p) => {
        if (error) {
            p.reject(error)
        } else {
            p.resolve(token)
        }
    })
    failedQueue = []
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        const code = error.response?.data?.error?.code

        if (error.response?.status === 401 && code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`
                        return api(originalRequest)
                    })
                    .catch((err) => Promise.reject(err))
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                const res = await api.post('/auth/refresh')
                const newToken = res.data.accessToken
                localStorage.setItem('accessToken', newToken)
                api.defaults.headers.common.Authorization = `Bearer ${newToken}`
                processQueue(null, newToken)
                originalRequest.headers.Authorization = `Bearer ${newToken}`
                return api(originalRequest)
            } catch (refreshErr) {
                processQueue(refreshErr, null)
                localStorage.removeItem('accessToken')
                window.location.href = '/login'
                return Promise.reject(refreshErr)
            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    }
)

export default api

// --- Auth ---
export const authApi = {
    signup: (data) => api.post('/auth/signup', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
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
