import React from 'react'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'

export default function LeadStatusBadge({ status }) {
    return (
        <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[status] || 'bg-surface-4 text-text-muted border-border-default'}`}>
            {STATUS_LABELS[status] || status}
        </span>
    )
}
