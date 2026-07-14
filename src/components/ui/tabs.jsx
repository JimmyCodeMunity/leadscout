import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

export const Tabs = TabsPrimitive.Root

export function TabsList({ className, children, ...props }) {
    return (
        <TabsPrimitive.List
            className={cn(
                'inline-flex h-8 items-center gap-0.5 rounded-lg bg-surface-3 p-0.5 border border-border-subtle',
                className
            )}
            {...props}
        >
            {children}
        </TabsPrimitive.List>
    )
}

export function TabsTrigger({ className, children, ...props }) {
    return (
        <TabsPrimitive.Trigger
            className={cn(
                'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium',
                'text-text-muted transition-all duration-150 cursor-pointer select-none',
                'data-[state=active]:bg-surface-5 data-[state=active]:text-text-primary data-[state=active]:shadow-sm',
                'hover:text-text-secondary',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
                className
            )}
            {...props}
        >
            {children}
        </TabsPrimitive.Trigger>
    )
}

export function TabsContent({ className, children, ...props }) {
    return (
        <TabsPrimitive.Content
            className={cn('mt-3 animate-fade-in', className)}
            {...props}
        >
            {children}
        </TabsPrimitive.Content>
    )
}
