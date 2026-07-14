import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'

export function Progress({ className, value = 0, ...props }) {
    return (
        <ProgressPrimitive.Root
            className={cn('relative h-1.5 w-full overflow-hidden rounded-full bg-surface-4', className)}
            {...props}
        >
            <ProgressPrimitive.Indicator
                className="h-full bg-orange-500 transition-all duration-500 ease-out rounded-full"
                style={{ transform: `translateX(-${100 - Math.min(Math.max(value, 0), 100)}%)` }}
            />
        </ProgressPrimitive.Root>
    )
}
