import React, { useState } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import {
    Phone, MapPin, Tag, Globe, ExternalLink,
    StickyNote, MessageSquare, X, Clock, Send,
    AtSign, Share2, Map,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import LeadStatusBadge from './LeadStatusBadge'
import { leadsApi } from '@/lib/api'
import { formatRelativeTime, formatDate, STATUS_LABELS, CHANNEL_LABELS, SOURCE_LABELS } from '@/lib/utils'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUSES = ['new', 'contacted', 'replied', 'negotiating', 'won', 'lost']
const CHANNELS = ['tiktok_dm', 'instagram_dm', 'phone', 'email', 'facebook_dm', 'other']

function getMapsUrl(lead) {
    const [lng, lat] = lead.location?.coordinates || [0, 0]
    if (lat !== 0 || lng !== 0) {
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    }
    if (lead.address) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.address)}`
    }
    return null
}

export default function LeadDrawer({ lead, onClose, onUpdated }) {
    const qc = useQueryClient()
    const [noteText, setNoteText] = useState('')
    const [outreachChannel, setOutreachChannel] = useState('phone')
    const [outreachMsg, setOutreachMsg] = useState('')
    const [outreachOutcome, setOutreachOutcome] = useState('')
    const [tab, setTab] = useState('notes')

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => leadsApi.update(id, data),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: ['leads'] })
            onUpdated?.(res.data.lead)
            toast.success('Lead updated')
        },
        onError: () => toast.error('Update failed'),
    })

    const noteMutation = useMutation({
        mutationFn: ({ id, text }) => leadsApi.addNote(id, text),
        onSuccess: (res) => { setNoteText(''); onUpdated?.(res.data.lead) },
        onError: () => toast.error('Failed to add note'),
    })

    const outreachMutation = useMutation({
        mutationFn: (data) => leadsApi.addOutreach(lead._id, data),
        onSuccess: (res) => {
            setOutreachMsg(''); setOutreachOutcome('')
            onUpdated?.(res.data.lead)
            toast.success('Outreach logged')
        },
        onError: () => toast.error('Failed to log outreach'),
    })

    if (!lead) return null

    const mapsUrl = getMapsUrl(lead)

    return (
        <div className="fixed inset-0 z-40 flex" onClick={onClose}>
            {/* Backdrop */}
            <div className="flex-1 bg-black/60 backdrop-blur-sm" />

            {/* Panel */}
            <div
                className="w-full max-w-lg h-full bg-surface-1 border-l border-border-default overflow-y-auto animate-slide-right flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-5 border-b border-border-subtle sticky top-0 bg-surface-1 z-10">
                    <div className="flex-1 min-w-0 pr-3">
                        <h2 className="text-base font-bold text-text-primary">{lead.businessName}</h2>
                        <p className="text-sm text-text-muted mt-0.5">{lead.category}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <LeadStatusBadge status={lead.status} />
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-4 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 p-5 space-y-5">
                    {/* Quick action buttons */}
                    <div className="flex gap-2 flex-wrap">
                        {lead.phone && (
                            <a
                                href={`tel:${lead.phone.replace(/\s/g, '')}`}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 hover:bg-orange-500/25 transition-colors text-sm font-medium"
                            >
                                <Phone size={15} />
                                {lead.phone}
                            </a>
                        )}
                        {mapsUrl && (
                            <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors text-sm font-medium"
                            >
                                <Map size={15} />
                                Open in Maps
                            </a>
                        )}
                    </div>

                    {/* Info rows */}
                    <div className="space-y-3 bg-surface-2 rounded-xl p-4 border border-border-subtle">
                        {lead.address && (
                            <InfoRow icon={<MapPin size={14} />} label="Address" text={lead.address} />
                        )}
                        <InfoRow icon={<Tag size={14} />} label="Source" text={SOURCE_LABELS[lead.source] || lead.source} />
                        {lead.rating && (
                            <InfoRow icon={<Globe size={14} />} label="Rating" text={`★ ${lead.rating} (${lead.reviewCount} reviews)`} />
                        )}
                        {lead.socialLinks?.instagram && (
                            <InfoRow icon={<AtSign size={14} />} label="Instagram" text={lead.socialLinks.instagram} link />
                        )}
                        {lead.socialLinks?.facebook && (
                            <InfoRow icon={<Share2 size={14} />} label="Facebook" text={lead.socialLinks.facebook} link />
                        )}
                        {lead.socialLinks?.tiktok && (
                            <InfoRow icon={<ExternalLink size={14} />} label="TikTok" text={lead.socialLinks.tiktok} link />
                        )}
                    </div>

                    <Separator />

                    {/* Status change */}
                    <div>
                        <p className="text-sm font-semibold text-text-secondary mb-2">Status</p>
                        <div className="flex flex-wrap gap-2">
                            {STATUSES.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => updateMutation.mutate({ id: lead._id, data: { status: s } })}
                                    disabled={lead.status === s || updateMutation.isPending}
                                    className={cn(
                                        'text-sm px-3 py-1.5 rounded-xl border font-medium transition-all duration-150',
                                        lead.status === s
                                            ? 'opacity-100 ring-2 ring-orange-500/50'
                                            : 'opacity-50 hover:opacity-80',
                                        `status-${s}`
                                    )}
                                >
                                    {STATUS_LABELS[s]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Follow-up date */}
                    <div>
                        <p className="text-sm font-semibold text-text-secondary mb-2">Follow-up Date</p>
                        <input
                            type="date"
                            defaultValue={lead.followUpDate ? new Date(lead.followUpDate).toISOString().split('T')[0] : ''}
                            onBlur={(e) => {
                                const newVal = e.target.value || null
                                const oldVal = lead.followUpDate ? new Date(lead.followUpDate).toISOString().split('T')[0] : null
                                if (newVal !== oldVal) {
                                    updateMutation.mutate({ id: lead._id, data: { followUpDate: newVal } })
                                }
                            }}
                            className="h-10 rounded-xl border border-border-default bg-surface-2 px-3 text-sm text-text-primary focus:outline-none focus:border-orange-500 transition-colors"
                        />
                    </div>

                    <Separator />

                    {/* Tabs */}
                    <div className="flex gap-0 border-b border-border-subtle">
                        {['notes', 'outreach'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={cn(
                                    'text-sm font-medium px-4 pb-2.5 pt-1 border-b-2 transition-colors capitalize',
                                    tab === t
                                        ? 'border-orange-500 text-orange-400'
                                        : 'border-transparent text-text-muted hover:text-text-secondary'
                                )}
                            >
                                {t === 'notes'
                                    ? <><StickyNote size={13} className="inline mr-1.5" />Notes ({lead.notes?.length || 0})</>
                                    : <><MessageSquare size={13} className="inline mr-1.5" />Outreach ({lead.outreachLog?.length || 0})</>}
                            </button>
                        ))}
                    </div>

                    {/* Notes tab */}
                    {tab === 'notes' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="space-y-2">
                                <Textarea
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    placeholder="Add a note…"
                                    rows={3}
                                    className="text-sm"
                                />
                                <Button
                                    size="sm"
                                    onClick={() => noteMutation.mutate({ id: lead._id, text: noteText })}
                                    disabled={!noteText.trim()}
                                    loading={noteMutation.isPending}
                                    className="gap-1.5"
                                >
                                    <Send size={13} /> Save Note
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {(lead.notes || []).slice().reverse().map((note, i) => (
                                    <div key={i} className="rounded-xl bg-surface-3 border border-border-subtle p-3.5">
                                        <p className="text-sm text-text-primary whitespace-pre-wrap">{note.text}</p>
                                        <p className="text-xs text-text-muted mt-2 flex items-center gap-1.5">
                                            <Clock size={10} /> {formatRelativeTime(note.createdAt)} · {note.author}
                                        </p>
                                    </div>
                                ))}
                                {!(lead.notes?.length) && (
                                    <p className="text-sm text-text-muted text-center py-6">No notes yet</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Outreach tab */}
                    {tab === 'outreach' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="space-y-3 p-4 rounded-xl border border-border-subtle bg-surface-2">
                                <p className="text-sm font-semibold text-text-secondary">Log an outreach attempt</p>
                                <Select value={outreachChannel} onValueChange={setOutreachChannel}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {CHANNELS.map((c) => <SelectItem key={c} value={c}>{CHANNEL_LABELS[c]}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Textarea
                                    value={outreachMsg}
                                    onChange={(e) => setOutreachMsg(e.target.value)}
                                    placeholder="Message or notes (optional)…"
                                    rows={2}
                                    className="text-sm"
                                />
                                <input
                                    value={outreachOutcome}
                                    onChange={(e) => setOutreachOutcome(e.target.value)}
                                    placeholder="Outcome (optional)"
                                    className="h-10 w-full rounded-xl border border-border-default bg-surface-3 px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-orange-500 transition-colors"
                                />
                                <Button
                                    loading={outreachMutation.isPending}
                                    onClick={() => outreachMutation.mutate({ channel: outreachChannel, message: outreachMsg, outcome: outreachOutcome })}
                                >
                                    Log Outreach
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {(lead.outreachLog || []).slice().reverse().map((log, i) => (
                                    <div key={i} className="rounded-xl bg-surface-3 border border-border-subtle p-3.5 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-orange-400">{CHANNEL_LABELS[log.channel]}</span>
                                            <span className="text-xs text-text-muted">{formatDate(log.date)}</span>
                                        </div>
                                        {log.message && <p className="text-sm text-text-secondary">{log.message}</p>}
                                        {log.outcome && <p className="text-sm text-lime-300">→ {log.outcome}</p>}
                                    </div>
                                ))}
                                {!(lead.outreachLog?.length) && (
                                    <p className="text-sm text-text-muted text-center py-6">No outreach logged yet</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer meta */}
                <div className="p-5 border-t border-border-subtle text-xs text-text-disabled space-y-1">
                    <p>Discovered: {formatDate(lead.discoveredAt)}</p>
                    <p>Last updated: {formatRelativeTime(lead.updatedAt)}</p>
                </div>
            </div>
        </div>
    )
}

function InfoRow({ icon, label, text, link }) {
    return (
        <div className="flex items-start gap-3">
            <span className="text-text-muted mt-0.5 shrink-0">{icon}</span>
            <div className="min-w-0 flex-1">
                <span className="text-xs text-text-muted block mb-0.5">{label}</span>
                {link ? (
                    <a
                        href={text.startsWith('http') ? text : `https://${text}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-orange-400 hover:underline break-all"
                    >
                        {text}
                    </a>
                ) : (
                    <span className="text-sm text-text-secondary break-words">{text}</span>
                )}
            </div>
        </div>
    )
}
