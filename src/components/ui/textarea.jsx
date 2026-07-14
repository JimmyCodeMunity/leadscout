import * as React from 'react'
import { cn } from '@/lib/utils'

export function Textarea({ className, ...props }) {
    return (
        <textarea
            className={cn(
                'flex min-h-[88px] w-full rounded-lg border border-border-default bg-surface-2',
                'px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted resize-y',
                'focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30',
                'disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-150',
                className
            )}
            {...props}
        />
    )
}
