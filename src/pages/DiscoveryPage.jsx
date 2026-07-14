import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { discoveryApi, savedSearchesApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
    Search, Play, Save, Trash2, Clock, CheckCircle2,
    XCircle, Loader2, Globe, Hash, RefreshCw, MapPin,
} from 'lucide-react'
import { cn, formatDate, formatRelativeTime } from '@/lib/utils'
import toast from 'react-hot-toast'

const PROVIDERS = [
    { id: 'google_places', label: 'Google Places', color: 'text-blue-400', desc: 'Most accurate — requires API key' },
    { id: 'yelp', label: 'Yelp Fusion', color: 'text-red-400', desc: 'Good US/Canada coverage' },
    { id: 'osm', label: 'OpenStreetMap', color: 'text-green-400', desc: 'Free, global — no key needed' },
]

const CATEGORY_PRESETS = [
    'Restaurant', 'Cafe', 'Salon', 'Barbershop', 'Auto Repair',
    'Gym', 'Plumber', 'Electrician', 'Dentist', 'Pharmacy',
    'Hotel', 'Cleaning Service', 'Photographer', 'Retail Store',
]

const schema = z.object({
    category: z.string().min(1, 'Category is required'),
    city: z.string().min(1, 'City is required'),
    radiusMeters: z.coerce.number().min(500).max(50000).default(5000),
    providers: z.array(z.string()).min(1, 'Select at least one provider'),
    maxLeads: z.coerce.number().min(1).max(5000).nullable().optional(),
})

export default function DiscoveryPage() {
    const qc = useQueryClient()
    const [activeJob, setActiveJob] = useState(null)
    const [jobResult, setJobResult] = useState(null)
    const pollRef = useRef(null)

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            category: '', city: '', radiusMeters: 5000,
            providers: ['osm'], maxLeads: null,
        },
    })

    const selectedProviders = watch('providers')
    const maxLeadsValue = watch('maxLeads')

    const { data: savedData, isLoading: savedLoading } = useQuery({
        queryKey: ['saved-searches'],
        queryFn: () => savedSearchesApi.list().then((r) => r.data),
    })

    const saveMutation = useMutation({
        mutationFn: (data) => savedSearchesApi.create(data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['saved-searches'] }); toast.success('Search saved') },
    })

    const deleteSavedMutation = useMutation({
        mutationFn: (id) => savedSearchesApi.delete(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['saved-searches'] }); toast.success('Deleted') },
    })

    // Poll job status every 1.5s
    useEffect(() => {
        if (!activeJob || activeJob.status === 'done' || activeJob.status === 'failed') return
        pollRef.current = setInterval(async () => {
            try {
                const res = await discoveryApi.getJob(activeJob.id)
                const job = res.data.job
                setActiveJob(job)
                if (job.status === 'done') {
                    setJobResult(job.result)
                    clearInterval(pollRef.current)
                    qc.invalidateQueries({ queryKey: ['leads'] })
                    qc.invalidateQueries({ queryKey: ['dashboard-summary'] })
                    toast.success(`Saved ${job.result?.saved ?? 0} new leads!`)
                } else if (job.status === 'failed') {
                    clearInterval(pollRef.current)
                    toast.error(`Discovery failed: ${job.error}`)
                }
            } catch { clearInterval(pollRef.current) }
        }, 1500)
        return () => clearInterval(pollRef.current)
    }, [activeJob?.id, activeJob?.status])

    const onSubmit = async (data) => {
        setJobResult(null)
        try {
            const payload = {
                ...data,
                maxLeads: data.maxLeads ? Number(data.maxLeads) : null,
            }
            const res = await discoveryApi.run(payload)
            setActiveJob({ id: res.data.jobId, status: 'queued', progress: { done: 0, total: 0, phase: 'Starting…' } })
        } catch (err) {
            toast.error(err.response?.data?.error?.message || 'Failed to start discovery')
        }
    }

    const toggleProvider = (id) => {
        const current = selectedProviders || []
        if (current.includes(id)) {
            if (current.length === 1) return
            setValue('providers', current.filter((p) => p !== id))
        } else {
            setValue('providers', [...current, id])
        }
    }

    const isRunning = activeJob && (activeJob.status === 'queued' || activeJob.status === 'running')
    const progressPct = activeJob?.progress?.total > 0
        ? Math.round((activeJob.progress.done / activeJob.progress.total) * 100)
        : activeJob?.status === 'running' ? 15 : 0

    const formValues = watch()

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold">Discovery</h1>
                <p className="text-sm text-text-muted mt-1">Find local businesses without websites using multiple data sources.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* ── Main scan form ── */}
                <div className="xl:col-span-2 space-y-5">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Search size={16} className="text-orange-400" />
                                New Discovery Scan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                {/* Category */}
                                <div>
                                    <Label className="text-sm mb-1.5">Business Category</Label>
                                    <Input placeholder="e.g. Restaurant, Salon, Auto Repair…" {...register('category')} className="h-11 text-base" />
                                    {errors.category && <p className="mt-1 text-sm text-red-400">{errors.category.message}</p>}
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {CATEGORY_PRESETS.map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setValue('category', cat)}
                                                className={cn(
                                                    'text-sm px-3 py-1 rounded-full border transition-colors',
                                                    watch('category') === cat
                                                        ? 'bg-orange-500/15 border-orange-500/40 text-orange-400'
                                                        : 'border-border-subtle text-text-muted hover:border-border-default hover:text-text-secondary'
                                                )}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* City + Radius */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm mb-1.5">City / Location</Label>
                                        <Input placeholder="e.g. Nairobi, Lagos, London…" {...register('city')} className="h-11 text-base" />
                                        {errors.city && <p className="mt-1 text-sm text-red-400">{errors.city.message}</p>}
                                    </div>
                                    <div>
                                        <Label className="text-sm mb-1.5">Search Radius (meters)</Label>
                                        <Input type="number" {...register('radiusMeters')} className="h-11 text-base" />
                                        <p className="text-xs text-text-muted mt-1">1000m = 1km. Max 50km.</p>
                                    </div>
                                </div>

                                {/* Max leads cap */}
                                <div>
                                    <Label className="text-sm mb-1.5 flex items-center gap-2">
                                        <Hash size={13} className="text-orange-400" />
                                        Max leads to save
                                        <span className="text-xs text-text-muted font-normal">(leave empty to save all)</span>
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <Input
                                            type="number"
                                            placeholder="e.g. 50, 100, 500…"
                                            min={1}
                                            max={5000}
                                            {...register('maxLeads')}
                                            className="h-11 text-base w-48"
                                        />
                                        <div className="flex gap-2 flex-wrap">
                                            {[25, 50, 100, 250].map((n) => (
                                                <button
                                                    key={n}
                                                    type="button"
                                                    onClick={() => setValue('maxLeads', n)}
                                                    className={cn(
                                                        'text-sm px-3 py-1.5 rounded-lg border transition-colors',
                                                        Number(maxLeadsValue) === n
                                                            ? 'bg-orange-500/15 border-orange-500/40 text-orange-400'
                                                            : 'border-border-subtle text-text-muted hover:border-border-default'
                                                    )}
                                                >
                                                    {n}
                                                </button>
                                            ))}
                                            {maxLeadsValue && (
                                                <button
                                                    type="button"
                                                    onClick={() => setValue('maxLeads', null)}
                                                    className="text-sm px-3 py-1.5 rounded-lg border border-border-subtle text-text-muted hover:text-orange-400 hover:border-orange-500/40 transition-colors"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Providers */}
                                <div>
                                    <Label className="text-sm mb-2">Data Sources</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {PROVIDERS.map((p) => {
                                            const active = (selectedProviders || []).includes(p.id)
                                            return (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => toggleProvider(p.id)}
                                                    className={cn(
                                                        'flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-150',
                                                        active
                                                            ? 'border-orange-500/50 bg-orange-500/8'
                                                            : 'border-border-subtle hover:border-border-default'
                                                    )}
                                                >
                                                    <div className={cn(
                                                        'mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                                                        active ? 'bg-orange-500 border-orange-500' : 'border-border-strong'
                                                    )}>
                                                        {active && <div className="w-2 h-2 bg-white rounded-sm" />}
                                                    </div>
                                                    <div>
                                                        <span className={cn('text-sm font-semibold', active ? p.color : 'text-text-secondary')}>
                                                            {p.label}
                                                        </span>
                                                        <p className="text-xs text-text-muted mt-0.5">{p.desc}</p>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                    {errors.providers && <p className="mt-1 text-sm text-red-400">{errors.providers.message}</p>}
                                </div>

                                {/* Submit row */}
                                <div className="flex items-center gap-3 pt-1">
                                    <Button type="submit" loading={isRunning} disabled={isRunning} size="lg" className="gap-2 flex-1 sm:flex-none sm:min-w-48">
                                        <Play size={15} />
                                        {isRunning ? 'Scanning…' : 'Run Discovery'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="lg"
                                        className="gap-2"
                                        onClick={() => {
                                            if (!formValues.category || !formValues.city) {
                                                toast.error('Fill in category and city first')
                                                return
                                            }
                                            saveMutation.mutate({
                                                name: `${formValues.category} in ${formValues.city}`,
                                                category: formValues.category,
                                                city: formValues.city,
                                                radiusMeters: formValues.radiusMeters,
                                                providers: formValues.providers,
                                            })
                                        }}
                                        loading={saveMutation.isPending}
                                    >
                                        <Save size={15} /> Save Search
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* ── Job progress card ── */}
                    {activeJob && (
                        <Card className={cn(
                            'border-2 transition-colors duration-300',
                            activeJob.status === 'done' ? 'border-lime-300/40' :
                                activeJob.status === 'failed' ? 'border-red-500/40' : 'border-orange-500/40'
                        )}>
                            <CardContent className="p-5 space-y-4">
                                <div className="flex items-center gap-3">
                                    {activeJob.status === 'done' ? (
                                        <CheckCircle2 size={20} className="text-lime-300 shrink-0" />
                                    ) : activeJob.status === 'failed' ? (
                                        <XCircle size={20} className="text-red-400 shrink-0" />
                                    ) : (
                                        <Loader2 size={20} className="text-orange-400 shrink-0 animate-spin" />
                                    )}
                                    <span className="text-base font-semibold text-text-primary">
                                        {activeJob.status === 'done' ? 'Scan Complete' :
                                            activeJob.status === 'failed' ? 'Scan Failed' : 'Scanning…'}
                                    </span>
                                    <Badge
                                        variant={activeJob.status === 'done' ? 'lime' : activeJob.status === 'failed' ? 'red' : 'orange'}
                                        className="ml-auto text-sm px-3"
                                    >
                                        {activeJob.status}
                                    </Badge>
                                </div>

                                {isRunning && (
                                    <>
                                        <p className="text-sm text-text-muted">{activeJob.progress?.phase}</p>
                                        <Progress value={progressPct} className="h-2" />
                                        {activeJob.progress?.total > 0 && (
                                            <p className="text-xs text-text-disabled">
                                                {activeJob.progress.done} of {activeJob.progress.total} checked — {progressPct}%
                                            </p>
                                        )}
                                    </>
                                )}

                                {activeJob.status === 'done' && jobResult && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                                        {[
                                            { label: 'Total Found', value: jobResult.found, color: 'text-blue-400' },
                                            { label: 'Unique', value: jobResult.deduplicated, color: 'text-purple-400' },
                                            { label: 'Newly Saved', value: jobResult.saved, color: 'text-lime-300' },
                                            { label: 'Already Stored', value: jobResult.skipped, color: 'text-text-muted' },
                                        ].map((s) => (
                                            <div key={s.label} className="text-center bg-surface-3 rounded-xl p-3">
                                                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                                                <p className="text-xs text-text-muted mt-1">{s.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {activeJob.status === 'done' && jobResult?.capped && (
                                    <p className="text-sm text-orange-400 flex items-center gap-1.5">
                                        <Hash size={13} /> Capped at your limit — more results were available.
                                    </p>
                                )}
                                {activeJob.status === 'failed' && (
                                    <p className="text-sm text-red-400">{activeJob.error}</p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* ── Saved searches + API status ── */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Clock size={15} className="text-text-muted" />
                                Saved Searches
                                {savedData?.searches?.length > 0 && (
                                    <Badge variant="default" className="ml-auto">{savedData.searches.length}</Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {savedLoading ? (
                                <div className="p-4 space-y-3">
                                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                                </div>
                            ) : !savedData?.searches?.length ? (
                                <p className="text-sm text-text-muted text-center py-8">No saved searches yet</p>
                            ) : (
                                <div className="divide-y divide-border-subtle">
                                    {savedData.searches.map((s) => (
                                        <div key={s._id} className="group p-4 hover:bg-surface-3 transition-colors">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-text-primary truncate">{s.name}</p>
                                                    <p className="text-xs text-text-muted mt-0.5">
                                                        {s.city} · {(s.radiusMeters / 1000).toFixed(1)}km
                                                    </p>
                                                    {s.lastRunAt && (
                                                        <p className="text-xs text-text-disabled mt-0.5">
                                                            Last run {formatRelativeTime(s.lastRunAt)}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            setValue('category', s.category)
                                                            setValue('city', s.city)
                                                            setValue('radiusMeters', s.radiusMeters)
                                                            setValue('providers', s.providers)
                                                            handleSubmit(onSubmit)()
                                                        }}
                                                        className="p-2 rounded-lg text-text-muted hover:text-lime-300 hover:bg-lime-300/10 transition-colors"
                                                        title="Run now"
                                                    >
                                                        <Play size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteSavedMutation.mutate(s._id)}
                                                        className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {s.providers.map((p) => {
                                                    const pv = PROVIDERS.find((x) => x.id === p)
                                                    return (
                                                        <span key={p} className={cn('text-xs font-medium', pv?.color || 'text-text-muted')}>
                                                            {pv?.label || p}
                                                        </span>
                                                    )
                                                }).reduce((acc, el, i) => i === 0 ? [el] : [...acc, <span key={`s${i}`} className="text-text-disabled">·</span>, el], [])}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* API Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm text-text-secondary">API Status</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-3">
                            {PROVIDERS.map((p) => (
                                <div key={p.id} className="flex items-center gap-3 text-sm">
                                    <div className={cn('w-2 h-2 rounded-full shrink-0', p.color.replace('text-', 'bg-'))} />
                                    <span className="text-text-secondary flex-1">{p.label}</span>
                                    {p.id === 'osm'
                                        ? <Badge variant="lime" className="text-xs">Free</Badge>
                                        : <span className="text-xs text-text-muted">Needs key</span>
                                    }
                                </div>
                            ))}
                            <p className="text-xs text-text-disabled pt-1">Configure API keys in Settings</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
