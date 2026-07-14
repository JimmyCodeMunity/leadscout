import { create } from 'zustand'

const useAuthStore = create((set) => ({
    user: null,
    accessToken: localStorage.getItem('accessToken') || null,
    isAuthenticated: !!localStorage.getItem('accessToken'),

    setAuth: (user, accessToken) => {
        localStorage.setItem('accessToken', accessToken)
        set({ user, accessToken, isAuthenticated: true })
    },

    updateUser: (user) => set({ user }),

    logout: () => {
        localStorage.removeItem('accessToken')
        set({ user: null, accessToken: null, isAuthenticated: false })
    },
}))

export default useAuthStore
