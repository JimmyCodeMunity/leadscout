import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export function formatDate(date) {
    if (!date) return '—'
    return new Intl.DateTimeFormat('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
    }).format(new Date(date))
}

export function formatRelativeTime(date) {
    if (!date) return '—'
    const now = Date.now()
    const diff = now - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 7) return `${days}d ago`
    return formatDate(date)
}

export function getInitials(name = '') {
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
}

export const STATUS_LABELS = {
    new: 'New',
    contacted: 'Contacted',
    replied: 'Replied',
    negotiating: 'Negotiating',
    won: 'Won',
    lost: 'Lost',
}

export const STATUS_COLORS = {
    new: 'status-new',
    contacted: 'status-contacted',
    replied: 'status-replied',
    negotiating: 'status-negotiating',
    won: 'status-won',
    lost: 'status-lost',
}

export const CHANNEL_LABELS = {
    tiktok_dm: 'TikTok DM',
    instagram_dm: 'Instagram DM',
    phone: 'Phone',
    email: 'Email',
    facebook_dm: 'Facebook DM',
    other: 'Other',
}

export const SOURCE_LABELS = {
    google_places: 'Google',
    yelp: 'Yelp',
    osm: 'OpenStreetMap',
    manual: 'Manual',
}

export const SOURCE_COLORS = {
    google_places: 'text-blue-400',
    yelp: 'text-red-400',
    osm: 'text-green-400',
    manual: 'text-gray-400',
}
