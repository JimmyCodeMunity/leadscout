import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/lib/utils'

export function Label({ className, ...props }) {
    return (
        <LabelPrimitive.Root
            data-slot="label"
            className={cn(
                'block text-xs font-medium text-text-secondary mb-1 select-none',
                className
            )}
            {...props}
        />
    )
}
