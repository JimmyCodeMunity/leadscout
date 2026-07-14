import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils'

export const TooltipProvider = TooltipPrimitive.Provider

export function Tooltip({ children, content, side = 'top', ...props }) {
    return (
        <TooltipPrimitive.Root delayDuration={300} {...props}>
            <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
                <TooltipPrimitive.Content
                    side={side}
                    sideOffset={5}
                    className={cn(
                        'z-50 rounded-md bg-surface-5 border border-border-default',
                        'px-2.5 py-1.5 text-xs text-text-primary shadow-md',
                        'animate-fade-in'
                    )}
                >
                    {content}
                    <TooltipPrimitive.Arrow className="fill-surface-5" />
                </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
    )
}
