import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
    useDroppable,
} from '@dnd-kit/core'
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { leadsApi } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import LeadDrawer from '@/components/leads/LeadDrawer'
import {
    STATUS_LABELS, formatRelativeTime,
    SOURCE_LABELS, SOURCE_COLORS,
} from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Phone, GripVertical, Calendar, Map } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUSES = ['new', 'contacted', 'replied', 'negotiating', 'won', 'lost']

const COLUMN_CONFIG = {
    new: { icon: '🔵', accent: 'border-blue-500/30', ring: 'ring-blue-500/20' },
    contacted: { icon: '🟣', accent: 'border-purple-500/30', ring: 'ring-purple-500/20' },
    replied: { icon: '🟢', accent: 'border-green-500/30', ring: 'ring-green-500/20' },
    negotiating: { icon: '🟡', accent: 'border-yellow-500/30', ring: 'ring-yellow-500/20' },
    won: { icon: '🏆', accent: 'border-lime-300/40', ring: 'ring-lime-300/20' },
    lost: { icon: '🔴', accent: 'border-red-500/30', ring: 'ring-red-500/20' },
}

function mapsUrl(lead) {
    const [lng, lat] = lead.location?.coordinates || [0, 0]
    if (lat !== 0 || lng !== 0) return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    if (lead.address) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lead.address)}`
    return null
}

export default function PipelinePage() {
    const qc = useQueryClient()
    const [activeDragId, setActiveDragId] = useState(null)
    const [activeDrawerLead, setActiveDrawerLead] = useState(null)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    )

    const { data, isLoading } = useQuery({
        queryKey: ['leads', { limit: 500 }],
        queryFn: () => leadsApi.list({ limit: 500 }).then((r) => r.data),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, status }) => leadsApi.update(id, { status }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['leads'] })
            qc.invalidateQueries({ queryKey: ['dashboard-summary'] })
        },
        onError: () => toast.error('Failed to update status'),
    })

    const leads = data?.leads || []

    const columns = useMemo(() => {
        const groups = {}
        STATUSES.forEach((s) => { groups[s] = [] })
        leads.forEach((lead) => {
            if (groups[lead.status]) groups[lead.status].push(lead)
        })
        return groups
    }, [leads])

    const activeLead = activeDragId ? leads.find((l) => l._id === activeDragId) : null

    const handleDragStart = ({ active }) => setActiveDragId(active.id)

    const handleDragEnd = ({ active, over }) => {
        setActiveDragId(null)
        if (!over) return

        // over.id can be a column status string OR a lead card id
        const newStatus = STATUSES.includes(over.id)
            ? over.id
            : (over.data?.current?.status ?? null)

        if (!newStatus) return
        const lead = leads.find((l) => l._id === active.id)
        if (!lead || lead.status === newStatus) return

        updateMutation.mutate({ id: active.id, status: newStatus })
        toast.success(`Moved to ${STATUS_LABELS[newStatus]}`)
    }

    if (isLoading) {
        return (
            <div className="p-5">
                <h1 className="text-lg font-bold mb-4">Pipeline</h1>
                <div className="flex gap-3 overflow-x-auto pb-3">
                    {STATUSES.map((s) => (
                        <div key={s} className="min-w-[240px] space-y-2">
                            <Skeleton className="h-10 w-full" />
                            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border-subtle bg-surface-1 shrink-0">
                <h1 className="text-xl font-bold">Pipeline</h1>
                <p className="text-sm text-text-muted mt-0.5">
                    Drag cards between columns to move leads through your sales stages.
                </p>
            </div>

            {/* Board */}
            <div className="flex-1 overflow-x-auto p-5">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div
                        className="flex gap-4 h-full"
                        style={{ minWidth: `${STATUSES.length * 264}px` }}
                    >
                        {STATUSES.map((status) => (
                            <KanbanColumn
                                key={status}
                                status={status}
                                leads={columns[status]}
                                onLeadClick={setActiveDrawerLead}
                                isDragging={activeDragId !== null}
                            />
                        ))}
                    </div>

                    <DragOverlay dropAnimation={{ duration: 120 }}>
                        {activeLead && (
                            <div className="rotate-1 scale-105 opacity-95 shadow-2xl shadow-black/60">
                                <LeadCard lead={activeLead} isDragging />
                            </div>
                        )}
                    </DragOverlay>
                </DndContext>
            </div>

            {/* Lead detail drawer */}
            {activeDrawerLead && (
                <LeadDrawer
                    lead={activeDrawerLead}
                    onClose={() => setActiveDrawerLead(null)}
                    onUpdated={(updated) => {
                        setActiveDrawerLead(updated)
                        qc.invalidateQueries({ queryKey: ['leads'] })
                    }}
                />
            )}
        </div>
    )
}

/* ─── Droppable column with real drop detection ─── */
function KanbanColumn({ status, leads, onLeadClick, isDragging }) {
    const { setNodeRef, isOver } = useDroppable({ id: status })
    const config = COLUMN_CONFIG[status]

    return (
        <div
            ref={setNodeRef}
            className={cn(
                'flex flex-col min-w-[252px] max-w-[252px] rounded-2xl border transition-all duration-150',
                isOver && isDragging
                    ? `${config.accent} bg-surface-3 ring-2 ${config.ring}`
                    : 'border-border-subtle bg-surface-1'
            )}
        >
            {/* Column header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{config.icon}</span>
                    <span className="text-sm font-bold text-text-primary">{STATUS_LABELS[status]}</span>
                </div>
                <span className="text-xs bg-surface-4 text-text-muted px-2 py-0.5 rounded-full font-semibold">
                    {leads.length}
                </span>
            </div>

            {/* Cards list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[100px]">
                <SortableContext
                    id={status}
                    items={leads.map((l) => l._id)}
                    strategy={verticalListSortingStrategy}
                >
                    {leads.map((lead) => (
                        <SortableLeadCard
                            key={lead._id}
                            lead={lead}
                            status={status}
                            onClick={() => onLeadClick(lead)}
                        />
                    ))}
                </SortableContext>

                {/* Empty drop zone */}
                {leads.length === 0 && (
                    <div className={cn(
                        'h-24 rounded-xl border-2 border-dashed flex items-center justify-center transition-all',
                        isOver && isDragging
                            ? `${config.accent} bg-surface-3`
                            : 'border-border-subtle'
                    )}>
                        <span className="text-xs text-text-disabled">Drop here</span>
                    </div>
                )}
            </div>
        </div>
    )
}

/* ─── Sortable wrapper ─── */
function SortableLeadCard({ lead, status, onClick }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: lead._id, data: { status } })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <LeadCard lead={lead} listeners={listeners} onClick={onClick} />
        </div>
    )
}

/* ─── Card UI ─── */
function LeadCard({ lead, listeners, onClick, isDragging }) {
    const mapUrl = mapsUrl(lead)

    return (
        <div
            onClick={onClick}
            className={cn(
                'group rounded-xl border bg-surface-2 p-3 cursor-pointer transition-all duration-150 select-none',
                isDragging
                    ? 'border-orange-500/60 shadow-xl ring-1 ring-orange-500/30'
                    : 'border-border-subtle hover:border-border-default hover:bg-surface-3 hover:shadow-md'
            )}
        >
            <div className="flex items-start gap-2">
                {/* Drag handle */}
                {listeners && (
                    <span
                        {...listeners}
                        className="mt-0.5 text-text-disabled hover:text-text-muted cursor-grab active:cursor-grabbing shrink-0 touch-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical size={14} />
                    </span>
                )}

                <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Business name */}
                    <p className="text-sm font-semibold text-text-primary truncate group-hover:text-orange-400 transition-colors">
                        {lead.businessName}
                    </p>

                    {/* Category + source */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={cn('text-xs font-medium', SOURCE_COLORS[lead.source])}>
                            {SOURCE_LABELS[lead.source]}
                        </span>
                        {lead.category && (
                            <>
                                <span className="text-text-disabled">·</span>
                                <span className="text-xs text-text-muted truncate max-w-[100px]">{lead.category}</span>
                            </>
                        )}
                    </div>

                    {/* Phone — clickable */}
                    {lead.phone && (
                        <a
                            href={`tel:${lead.phone.replace(/\s/g, '')}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors w-fit"
                        >
                            <Phone size={11} className="shrink-0" />
                            <span>{lead.phone}</span>
                        </a>
                    )}

                    {/* Follow-up date */}
                    {lead.followUpDate && (
                        <div className="flex items-center gap-1.5 text-xs text-yellow-400">
                            <Calendar size={11} className="shrink-0" />
                            {new Date(lead.followUpDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                    )}

                    {/* Footer row */}
                    <div className="flex items-center justify-between pt-0.5">
                        <span className="text-xs text-text-disabled">{formatRelativeTime(lead.discoveredAt)}</span>
                        <div className="flex items-center gap-1.5">
                            {lead.outreachLog?.length > 0 && (
                                <span className="text-xs text-purple-400">
                                    {lead.outreachLog.length}✉
                                </span>
                            )}
                            {mapUrl && (
                                <a
                                    href={mapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-text-disabled hover:text-blue-400 transition-colors"
                                    title="Open in Google Maps"
                                >
                                    <Map size={12} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
