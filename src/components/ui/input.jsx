import * as React from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, type = 'text', ...props }) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                'flex h-10 w-full rounded-lg border border-border-default bg-surface-2',
                'px-3 py-2 text-sm text-text-primary placeholder:text-text-muted',
                'transition-colors duration-150',
                'focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}
        />
    )
}
