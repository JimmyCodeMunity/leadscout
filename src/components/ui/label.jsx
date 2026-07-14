import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/lib/utils'

export function Label({ className, ...props }) {
    return (
        <LabelPrimitive.Root
            data-slot="label"
            className={cn(
                'block text-sm font-medium text-text-secondary mb-1.5 select-none',
                className
            )}
            {...props}
        />
    )
}
