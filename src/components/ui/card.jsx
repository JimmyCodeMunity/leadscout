import * as React from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, children, ...props }) {
    return (
        <div
            data-slot="card"
            className={cn(
                'rounded-lg border border-border-subtle bg-surface-2 shadow-sm',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

export function CardHeader({ className, children, ...props }) {
    return (
        <div className={cn('p-4 pb-3', className)} {...props}>
            {children}
        </div>
    )
}

export function CardTitle({ className, children, ...props }) {
    return (
        <h3 className={cn('text-sm font-semibold text-text-primary', className)} {...props}>
            {children}
        </h3>
    )
}

export function CardContent({ className, children, ...props }) {
    return (
        <div className={cn('p-4 pt-0', className)} {...props}>
            {children}
        </div>
    )
}
