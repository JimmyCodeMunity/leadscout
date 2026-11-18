import { create } from 'zustand'

/**
 * The application user is the local Mongo User document returned by /api/auth/me.
 * Authentication itself is handled by Clerk; this store only caches the synced
 * profile that the rest of the UI (and lead ownership) depends on.
 */
const useAuthStore = create((set) => ({
    user: null,

    setUser: (user) => set({ user }),
    updateUser: (user) => set({ user }),
    clearUser: () => set({ user: null }),
}))

export default useAuthStore
