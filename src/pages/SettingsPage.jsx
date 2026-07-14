import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi, savedSearchesApi } from '@/lib/api'
import useAuthStore from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
    CheckCircle2, Key, User, Search,
    Trash2, Play, PauseCircle, Globe, Zap,
} from 'lucide-react'
import { formatDate, getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
})

const passwordSchema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ['confirm'] })

const API_PROVIDERS = [
    {
        id: 'google_places',
        label: 'Google Places API',
        envKey: 'GOOGLE_PLACES_API_KEY',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        docs: 'https://developers.google.com/maps/documentation/places/web-service',
        note: 'Textsearch + Place Details endpoints. Billing required.',
    },
    {
        id: 'yelp',
        label: 'Yelp Fusion API',
        envKey: 'YELP_API_KEY',
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        docs: 'https://docs.developer.yelp.com/docs/fusion-intro',
        note: 'Business Search endpoint. Free tier: 500 req/day.',
    },
    {
        id: 'osm',
        label: 'OpenStreetMap Overpass',
        envKey: null,
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        docs: 'https://overpass-api.de/',
        note: 'Free — no API key needed.',
    },
]

export default function SettingsPage() {
    const { user, updateUser } = useAuthStore()
    const qc = useQueryClient()

    // Profile form
    const {
        register: regProfile,
        handleSubmit: submitProfile,
        formState: { errors: profileErrors, isSubmitting: savingProfile },
    } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: { name: user?.name || '' },
    })

    // Password form
    const {
        register: regPass,
        handleSubmit: submitPass,
        reset: resetPass,
        formState: { errors: passErrors, isSubmitting: savingPass },
    } = useForm({ resolver: zodResolver(passwordSchema) })

    const { data: savedData, isLoading: savedLoading } = useQuery({
        queryKey: ['saved-searches'],
        queryFn: () => savedSearchesApi.list().then((r) => r.data),
    })

    const deleteSavedMutation = useMutation({
        mutationFn: (id) => savedSearchesApi.delete(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['saved-searches'] }); toast.success('Deleted') },
    })

    const togglePauseMutation = useMutation({
        mutationFn: ({ id, isPaused }) => savedSearchesApi.update(id, { isPaused }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['saved-searches'] }),
    })

    const handleProfileSave = async (data) => {
        try {
            const res = await authApi.updateMe(data)
            updateUser(res.data.user)
            toast.success('Profile updated')
        } catch {
            toast.error('Update failed')
        }
    }

    const handlePasswordSave = async (data) => {
        try {
            await authApi.updateMe({ password: data.password })
            resetPass()
            toast.success('Password changed')
        } catch {
            toast.error('Password change failed')
        }
    }

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            <div>
                <h1 className="text-xl font-semibold">Settings</h1>
                <p className="text-xs text-text-muted mt-0.5">Manage your account, API keys, and saved searches.</p>
            </div>

            {/* Account */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User size={14} className="text-orange-400" />
                        Account
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    {/* Avatar + info */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-orange-500/20 border-2 border-orange-500/30 flex items-center justify-center shrink-0">
                            <span className="text-base font-bold text-orange-400">{getInitials(user?.name || 'U')}</span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-text-primary">{user?.name}</p>
                            <p className="text-xs text-text-muted">{user?.email}</p>
                            <p className="text-[10px] text-text-disabled mt-0.5">Member since {formatDate(user?.createdAt)}</p>
                        </div>
                    </div>

                    <Separator />

                    <form onSubmit={submitProfile(handleProfileSave)} className="space-y-3 max-w-md">
                        <div>
                            <Label>Display Name</Label>
                            <Input {...regProfile('name')} />
                            {profileErrors.name && <p className="mt-1 text-xs text-red-400">{profileErrors.name.message}</p>}
                        </div>
                        <Button type="submit" size="sm" loading={savingProfile}>Save changes</Button>
                    </form>

                    <Separator />

                    <form onSubmit={submitPass(handlePasswordSave)} className="space-y-3 max-w-md">
                        <p className="text-xs font-medium text-text-secondary">Change Password</p>
                        <div>
                            <Label>New Password</Label>
                            <Input type="password" placeholder="Min. 8 characters" {...regPass('password')} />
                            {passErrors.password && <p className="mt-1 text-xs text-red-400">{passErrors.password.message}</p>}
                        </div>
                        <div>
                            <Label>Confirm Password</Label>
                            <Input type="password" placeholder="Repeat password" {...regPass('confirm')} />
                            {passErrors.confirm && <p className="mt-1 text-xs text-red-400">{passErrors.confirm.message}</p>}
                        </div>
                        <Button type="submit" size="sm" variant="secondary" loading={savingPass}>Update password</Button>
                    </form>
                </CardContent>
            </Card>

            {/* API Keys */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key size={14} className="text-orange-400" />
                        API Keys &amp; Data Sources
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-xs text-text-muted">
                        API keys are configured via environment variables on the server — never stored in the UI.
                        The statuses below reflect which keys are currently set.
                    </p>
                    <div className="space-y-2">
                        {API_PROVIDERS.map((p) => (
                            <div
                                key={p.id}
                                className="flex items-start gap-3 p-3 rounded-lg border border-border-subtle bg-surface-1 hover:border-border-default transition-colors"
                            >
                                <div className={cn('w-7 h-7 rounded-md flex items-center justify-center shrink-0', p.bg)}>
                                    <Globe size={13} className={p.color} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-medium text-text-primary">{p.label}</span>
                                        {p.envKey ? (
                                            <Badge variant="default" className="text-[9px]">{p.envKey}</Badge>
                                        ) : (
                                            <Badge variant="lime" className="text-[9px]">No key needed</Badge>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-text-muted mt-0.5">{p.note}</p>
                                    <a
                                        href={p.docs}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-orange-400 hover:underline mt-0.5 inline-flex items-center gap-1"
                                    >
                                        View docs →
                                    </a>
                                </div>
                                <div className="shrink-0">
                                    {p.envKey === null ? (
                                        <CheckCircle2 size={14} className="text-lime-300" />
                                    ) : (
                                        <div className="flex items-center gap-1 text-[10px] text-text-muted">
                                            <span>Set in <code className="text-orange-400">.env</code></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-lg border border-border-subtle bg-surface-3 p-3 mt-2">
                        <p className="text-xs font-medium text-text-secondary mb-1.5 flex items-center gap-1.5">
                            <Zap size={11} className="text-orange-400" />
                            How to add API keys
                        </p>
                        <div className="text-[11px] text-text-muted space-y-1 font-mono bg-surface-0 rounded p-2">
                            <p className="text-text-secondary"># backend/.env</p>
                            <p>GOOGLE_PLACES_API_KEY=<span className="text-orange-400">your_key_here</span></p>
                            <p>YELP_API_KEY=<span className="text-orange-400">your_key_here</span></p>
                        </div>
                        <p className="text-[10px] text-text-disabled mt-1.5">Restart the server after updating .env</p>
                    </div>
                </CardContent>
            </Card>

            {/* Saved Searches */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search size={14} className="text-orange-400" />
                        Saved Searches
                        {savedData?.searches?.length > 0 && (
                            <Badge variant="default" className="text-[10px] ml-1">{savedData.searches.length}</Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {savedLoading ? (
                        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
                    ) : savedData?.searches?.length === 0 ? (
                        <p className="text-xs text-text-muted text-center py-6">
                            No saved searches. Save one from the Discovery page.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {savedData.searches.map((s) => (
                                <div
                                    key={s._id}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:border-border-default transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-text-primary">{s.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-text-muted flex-wrap">
                                            <span>{s.category}</span>
                                            <span>·</span>
                                            <span>{s.city}</span>
                                            <span>·</span>
                                            <span>{(s.radiusMeters / 1000).toFixed(0)}km radius</span>
                                            {s.lastRunAt && (
                                                <>
                                                    <span>·</span>
                                                    <span>Last run {formatDate(s.lastRunAt)}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {s.schedule && (
                                            <button
                                                onClick={() => togglePauseMutation.mutate({ id: s._id, isPaused: !s.isPaused })}
                                                className={cn(
                                                    'p-1.5 rounded transition-colors',
                                                    s.isPaused
                                                        ? 'text-text-muted hover:text-lime-300 hover:bg-lime-300/10'
                                                        : 'text-orange-400 hover:text-orange-300 hover:bg-orange-500/10'
                                                )}
                                                title={s.isPaused ? 'Resume schedule' : 'Pause schedule'}
                                            >
                                                {s.isPaused ? <Play size={12} /> : <PauseCircle size={12} />}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => { if (confirm('Delete this saved search?')) deleteSavedMutation.mutate(s._id) }}
                                            className="p-1.5 rounded text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Data & Privacy */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xs text-text-secondary">App Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 text-[11px] text-text-muted">
                    <p>LeadScout v1.0.0</p>
                    <p>Backend: Node.js + Express + MongoDB</p>
                    <p>Frontend: React + Vite + TailwindCSS</p>
                    <p className="text-text-disabled pt-1">Data is stored in your own MongoDB instance. No data is shared externally.</p>
                </CardContent>
            </Card>
        </div>
    )
}
