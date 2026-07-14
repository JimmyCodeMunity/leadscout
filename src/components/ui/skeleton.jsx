import * as React from 'react'
import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }) {
    return (
        <div className={cn('skeleton rounded-lg', className)} {...props} />
    )
}

export function SkeletonTable({ rows = 6 }) {
    return (
        <div className="space-y-2 p-5">
            {/* Header row */}
            <div className="flex items-center gap-4 pb-2 border-b border-border-subtle">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20 ml-auto" />
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-1">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-5 w-44" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-6 w-20 ml-auto rounded-full" />
                </div>
            ))}
        </div>
    )
}

export function SkeletonCard() {
    return (
        <div className="rounded-xl border border-border-subtle bg-surface-2 p-5 space-y-3">
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-3.5 w-36" />
        </div>
    )
}
