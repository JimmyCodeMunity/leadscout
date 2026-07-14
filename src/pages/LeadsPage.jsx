import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { leadsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { SkeletonTable } from '@/components/ui/skeleton'
import LeadStatusBadge from '@/components/leads/LeadStatusBadge'
import LeadDrawer from '@/components/leads/LeadDrawer'
import { SOURCE_LABELS, SOURCE_COLORS, formatRelativeTime, STATUS_LABELS } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
    Search, Download, Trash2, RefreshCw,
    Phone, MapPin, SortAsc, SortDesc,
    ChevronLeft, ChevronRight, CheckSquare, Square, Map,
} from 'lucide-react'
import toast from 'react-hot-toast'

const STATUSES = ['new', 'contacted', 'replied', 'negotiating', 'won', 'lost']
const PAGE_SIZE = 50

function mapsUrl(lead) {
    const [lng, lat] = lead.location?.coordinates || [0, 0]
    if (lat !== 0 || lng !== 0) {
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    }
    if (lead.address) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.address)}`
    }
    return null
}

export default function LeadsPage() {
    const qc = useQueryClient()
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [cityFilter, setCityFilter] = useState('')
    const [page, setPage] = useState(1)
    const [sortBy, setSortBy] = useState('discoveredAt')
    const [sortDir, setSortDir] = useState('desc')
    const [selectedIds, setSelectedIds] = useState(new Set())
    const [activeLead, setActiveLead] = useState(null)

    const queryParams = {
        search: search || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        city: cityFilter || undefined,
        page, limit: PAGE_SIZE, sortBy, sortDir,
    }

    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['leads', queryParams],
        queryFn: () => leadsApi.list(queryParams).then((r) => r.data),
        keepPreviousData: true,
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => leadsApi.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['leads'] })
            toast.success('Lead deleted')
            setActiveLead(null)
        },
    })

    const bulkUpdateMutation = useMutation({
        mutationFn: ({ ids, updates }) => leadsApi.bulkUpdate(ids, updates),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: ['leads'] })
            setSelectedIds(new Set())
            toast.success(`Updated ${res.data.modifiedCount} leads`)
        },
    })

    const handleExport = async () => {
        try {
            const res = await leadsApi.export()
            const url = URL.createObjectURL(new Blob([res.data]))
            const a = document.createElement('a')
            a.href = url
            a.download = 'leadscout-leads.csv'
            a.click()
            URL.revokeObjectURL(url)
        } catch { toast.error('Export failed') }
    }

    const toggleSelect = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    const toggleSelectAll = () => {
        setSelectedIds(
            selectedIds.size === data?.leads?.length
                ? new Set()
                : new Set(data?.leads?.map((l) => l._id) || [])
        )
    }

    const handleSort = (col) => {
        if (sortBy === col) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
        else { setSortBy(col); setSortDir('desc') }
    }

    const SortIcon = ({ col }) =>
        sortBy === col
            ? sortDir === 'asc'
                ? <SortAsc size={13} className="text-orange-400" />
                : <SortDesc size={13} className="text-orange-400" />
            : null

    const leads = data?.leads || []
    const total = data?.total || 0
    const totalPages = Math.ceil(total / PAGE_SIZE)

    return (
        <div className="flex flex-col h-full">
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle bg-surface-1 sticky top-0 z-10 gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                    <h1 className="text-lg font-bold">Leads</h1>
                    <Badge variant="default">{total.toLocaleString()}</Badge>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-2 animate-fade-in">
                            <span className="text-sm text-text-muted">{selectedIds.size} selected</span>
                            <Select onValueChange={(status) => bulkUpdateMutation.mutate({ ids: [...selectedIds], updates: { status } })}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Set status…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Button size="sm" variant="danger" onClick={() => setSelectedIds(new Set())}>Clear</Button>
                        </div>
                    )}
                    <Button size="sm" variant="secondary" onClick={() => refetch()} className="gap-1.5">
                        <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} /> Refresh
                    </Button>
                    <Button size="sm" variant="secondary" onClick={handleExport} className="gap-1.5">
                        <Download size={14} /> Export CSV
                    </Button>
                </div>
            </div>

            {/* ── Filters ── */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-border-subtle bg-surface-1 flex-wrap">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <Input
                        placeholder="Search businesses…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        className="pl-9 w-56"
                    />
                </div>

                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === '_all' ? '' : v); setPage(1) }}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="_all">All statuses</SelectItem>
                        {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Input
                    placeholder="Category"
                    value={categoryFilter}
                    onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
                    className="w-40"
                />
                <Input
                    placeholder="City"
                    value={cityFilter}
                    onChange={(e) => { setCityFilter(e.target.value); setPage(1) }}
                    className="w-36"
                />

                {(search || statusFilter || categoryFilter || cityFilter) && (
                    <button
                        onClick={() => { setSearch(''); setStatusFilter(''); setCategoryFilter(''); setCityFilter(''); setPage(1) }}
                        className="text-sm text-text-muted hover:text-orange-400 transition-colors"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {/* ── Table ── */}
            <div className="flex-1 overflow-auto">
                {isLoading ? (
                    <SkeletonTable rows={12} />
                ) : leads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center gap-2">
                        <MapPin size={32} className="text-text-disabled" />
                        <p className="text-text-muted text-base">No leads found</p>
                        <p className="text-text-disabled text-sm">Run a discovery scan to find leads</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-surface-1 border-b border-border-subtle z-10">
                            <tr>
                                <th className="px-4 py-3 text-left w-10">
                                    <button onClick={toggleSelectAll} className="text-text-muted hover:text-text-primary transition-colors">
                                        {selectedIds.size === leads.length && leads.length > 0
                                            ? <CheckSquare size={15} className="text-orange-400" />
                                            : <Square size={15} />}
                                    </button>
                                </th>
                                <th className="px-4 py-3 text-left font-semibold text-text-muted cursor-pointer hover:text-text-primary select-none" onClick={() => handleSort('businessName')}>
                                    <span className="flex items-center gap-1.5">Business <SortIcon col="businessName" /></span>
                                </th>
                                <th className="px-4 py-3 text-left font-semibold text-text-muted hidden md:table-cell">Category</th>
                                <th className="px-4 py-3 text-left font-semibold text-text-muted hidden lg:table-cell">Location</th>
                                <th className="px-4 py-3 text-left font-semibold text-text-muted">Phone</th>
                                <th className="px-4 py-3 text-left font-semibold text-text-muted hidden sm:table-cell">Source</th>
                                <th className="px-4 py-3 text-left font-semibold text-text-muted cursor-pointer hover:text-text-primary select-none" onClick={() => handleSort('status')}>
                                    <span className="flex items-center gap-1.5">Status <SortIcon col="status" /></span>
                                </th>
                                <th className="px-4 py-3 text-left font-semibold text-text-muted hidden xl:table-cell cursor-pointer hover:text-text-primary select-none" onClick={() => handleSort('discoveredAt')}>
                                    <span className="flex items-center gap-1.5">Found <SortIcon col="discoveredAt" /></span>
                                </th>
                                <th className="px-4 py-3 text-right font-semibold text-text-muted">Map</th>
                                <th className="px-4 py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map((lead) => {
                                const mapUrl = mapsUrl(lead)
                                return (
                                    <tr
                                        key={lead._id}
                                        className={cn(
                                            'border-b border-border-subtle transition-colors cursor-pointer group',
                                            selectedIds.has(lead._id) ? 'bg-orange-500/5' : 'hover:bg-surface-2',
                                            activeLead?._id === lead._id && 'bg-surface-3'
                                        )}
                                        onClick={() => setActiveLead(lead)}
                                    >
                                        {/* Checkbox */}
                                        <td className="px-4 py-3" onClick={(e) => { e.stopPropagation(); toggleSelect(lead._id) }}>
                                            {selectedIds.has(lead._id)
                                                ? <CheckSquare size={15} className="text-orange-400" />
                                                : <Square size={15} className="text-text-disabled group-hover:text-text-muted transition-colors" />}
                                        </td>

                                        {/* Business name */}
                                        <td className="px-4 py-3">
                                            <span className="font-semibold text-text-primary group-hover:text-orange-400 transition-colors">
                                                {lead.businessName}
                                            </span>
                                        </td>

                                        {/* Category */}
                                        <td className="px-4 py-3 text-text-secondary hidden md:table-cell">{lead.category}</td>

                                        {/* Location */}
                                        <td className="px-4 py-3 text-text-muted hidden lg:table-cell max-w-[180px]">
                                            <span className="truncate block">{lead.address}</span>
                                        </td>

                                        {/* Phone — clickable tel: link */}
                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                            {lead.phone ? (
                                                <a
                                                    href={`tel:${lead.phone.replace(/\s/g, '')}`}
                                                    className="flex items-center gap-1.5 text-orange-400 hover:text-orange-300 font-medium transition-colors group/phone"
                                                    title={`Call ${lead.phone}`}
                                                >
                                                    <Phone size={13} className="shrink-0" />
                                                    <span className="hidden xl:inline">{lead.phone}</span>
                                                    <span className="xl:hidden text-xs">Call</span>
                                                </a>
                                            ) : (
                                                <span className="text-text-disabled">—</span>
                                            )}
                                        </td>

                                        {/* Source */}
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            <span className={cn('font-medium', SOURCE_COLORS[lead.source])}>
                                                {SOURCE_LABELS[lead.source] || lead.source}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3">
                                            <LeadStatusBadge status={lead.status} />
                                        </td>

                                        {/* Discovered */}
                                        <td className="px-4 py-3 text-text-muted hidden xl:table-cell">{formatRelativeTime(lead.discoveredAt)}</td>

                                        {/* Maps link */}
                                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                            {mapUrl ? (
                                                <a
                                                    href={mapUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-text-disabled hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                                    title="View on Google Maps"
                                                >
                                                    <Map size={14} />
                                                </a>
                                            ) : (
                                                <span className="text-text-disabled">—</span>
                                            )}
                                        </td>

                                        {/* Delete */}
                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => { if (confirm('Delete this lead?')) deleteMutation.mutate(lead._id) }}
                                                className="p-1.5 rounded-lg text-text-disabled hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-border-subtle bg-surface-1 text-sm text-text-muted flex-wrap gap-2">
                    <span>
                        {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString()} leads
                    </span>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                            <ChevronLeft size={14} /> Prev
                        </Button>
                        <span className="px-2 font-medium">{page} / {totalPages}</span>
                        <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                            Next <ChevronRight size={14} />
                        </Button>
                    </div>
                </div>
            )}

            {/* ── Lead drawer ── */}
            {activeLead && (
                <LeadDrawer
                    lead={activeLead}
                    onClose={() => setActiveLead(null)}
                    onUpdated={(updated) => setActiveLead(updated)}
                />
            )}
        </div>
    )
}
