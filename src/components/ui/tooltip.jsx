import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils'

export const TooltipProvider = TooltipPrimitive.Provider

export function Tooltip({ children, content, side = 'top', ...props }) {
    return (
        <TooltipPrimitive.Root delayDuration={250} {...props}>
            <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
                <TooltipPrimitive.Content
                    side={side}
                    sideOffset={6}
                    className={cn(
                        'z-50 rounded-lg bg-surface-5 border border-border-default',
                        'px-3 py-1.5 text-sm text-text-primary shadow-lg',
                        'animate-fade-in select-none'
                    )}
                >
                    {content}
                    <TooltipPrimitive.Arrow className="fill-surface-5" />
                </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
    )
}
