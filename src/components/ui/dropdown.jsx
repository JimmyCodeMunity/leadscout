import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export const DropdownMenu = DropdownMenuPrimitive.Root
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
export const DropdownMenuSeparator = DropdownMenuPrimitive.Separator
export const DropdownMenuGroup = DropdownMenuPrimitive.Group

export function DropdownMenuContent({ className, sideOffset = 6, children, ...props }) {
    return (
        <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content
                sideOffset={sideOffset}
                className={cn(
                    'z-50 min-w-[180px] overflow-hidden rounded-xl border border-border-default bg-surface-3 p-1.5 shadow-xl',
                    'data-[state=open]:animate-scale-in data-[state=closed]:opacity-0 transition-opacity duration-150',
                    className
                )}
                {...props}
            >
                {children}
            </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
    )
}

export function DropdownMenuItem({ className, inset, children, ...props }) {
    return (
        <DropdownMenuPrimitive.Item
            className={cn(
                'relative flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-primary outline-none',
                'transition-colors duration-100',
                'data-[highlighted]:bg-surface-5',
                'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
                inset && 'pl-9',
                className
            )}
            {...props}
        >
            {children}
        </DropdownMenuPrimitive.Item>
    )
}

export function DropdownMenuLabel({ className, children, ...props }) {
    return (
        <DropdownMenuPrimitive.Label
            className={cn('px-3 py-1.5 text-xs font-semibold text-text-muted uppercase tracking-wider', className)}
            {...props}
        >
            {children}
        </DropdownMenuPrimitive.Label>
    )
}

export function DropdownMenuCheckboxItem({ className, children, checked, ...props }) {
    return (
        <DropdownMenuPrimitive.CheckboxItem
            className={cn(
                'relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 pl-9 text-sm text-text-primary outline-none',
                'transition-colors data-[highlighted]:bg-surface-5',
                className
            )}
            checked={checked}
            {...props}
        >
            <span className="absolute left-3 flex h-4 w-4 items-center justify-center">
                <DropdownMenuPrimitive.ItemIndicator>
                    <Check size={13} className="text-orange-400" />
                </DropdownMenuPrimitive.ItemIndicator>
            </span>
            {children}
        </DropdownMenuPrimitive.CheckboxItem>
    )
}
