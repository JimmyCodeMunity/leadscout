import React from 'react'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'

export default function LeadStatusBadge({ status, size = 'default' }) {
    const base = size === 'sm'
        ? 'text-xs px-2 py-0.5'
        : 'text-sm px-3 py-1'

    return (
        <span className={`inline-flex items-center rounded-full border font-medium ${base} ${STATUS_COLORS[status] || 'bg-surface-4 text-text-muted border-border-default'}`}>
            {STATUS_LABELS[status] || status}
        </span>
    )
}
