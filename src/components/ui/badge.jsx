import * as React from 'react'
import { cn } from '@/lib/utils'

const variants = {
    default: 'bg-surface-4 text-text-secondary border-border-default',
    orange: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
    lime: 'bg-lime-300/15 text-lime-300 border-lime-300/25',
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    red: 'bg-red-500/15 text-red-400 border-red-500/25',
    yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
}

export function Badge({ className, variant = 'default', children, ...props }) {
    return (
        <span
            data-slot="badge"
            className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium leading-none',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </span>
    )
}
