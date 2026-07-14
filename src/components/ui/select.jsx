import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Select = SelectPrimitive.Root
export const SelectValue = SelectPrimitive.Value
export const SelectGroup = SelectPrimitive.Group

export function SelectTrigger({ className, children, ...props }) {
    return (
        <SelectPrimitive.Trigger
            className={cn(
                'flex h-8 w-full items-center justify-between gap-2 rounded-md border border-border-default bg-surface-2',
                'px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted',
                'focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'transition-colors duration-150 cursor-pointer',
                className
            )}
            {...props}
        >
            {children}
            <SelectPrimitive.Icon>
                <ChevronDown size={12} className="text-text-muted shrink-0" />
            </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
    )
}

export function SelectContent({ className, children, ...props }) {
    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                position="popper"
                sideOffset={4}
                className={cn(
                    'z-50 min-w-[8rem] overflow-hidden rounded-lg border border-border-default bg-surface-3 shadow-xl',
                    'data-[state=open]:animate-scale-in',
                    className
                )}
                {...props}
            >
                <SelectPrimitive.Viewport className="p-1">
                    {children}
                </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    )
}

export function SelectItem({ className, children, ...props }) {
    return (
        <SelectPrimitive.Item
            className={cn(
                'relative flex w-full cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm text-text-primary',
                'outline-none transition-colors',
                'data-[highlighted]:bg-surface-5 data-[highlighted]:text-text-primary',
                'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                className
            )}
            {...props}
        >
            <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                <SelectPrimitive.ItemIndicator>
                    <Check size={11} className="text-orange-400" />
                </SelectPrimitive.ItemIndicator>
            </span>
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
    )
}

export function SelectLabel({ className, children, ...props }) {
    return (
        <SelectPrimitive.Label
            className={cn('px-2 py-1 text-xs font-semibold text-text-muted', className)}
            {...props}
        >
            {children}
        </SelectPrimitive.Label>
    )
}
