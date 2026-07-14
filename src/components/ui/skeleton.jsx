import * as React from 'react'
import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn('skeleton rounded-md', className)}
            {...props}
        />
    )
}

export function SkeletonTable({ rows = 6 }) {
    return (
        <div className="space-y-2 p-4">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16 ml-auto" />
                </div>
            ))}
        </div>
    )
}

export function SkeletonCard() {
    return (
        <div className="rounded-lg border border-border-subtle bg-surface-2 p-4 space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-48" />
        </div>
    )
}
