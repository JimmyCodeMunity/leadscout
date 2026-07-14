import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

const variants = {
    default: 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 shadow-sm',
    secondary: 'bg-surface-3 text-text-primary border border-border-default hover:bg-surface-4 hover:border-border-strong',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-3',
    danger: 'bg-red-900/40 text-red-400 border border-red-900/50 hover:bg-red-900/60',
    outline: 'border border-border-default bg-transparent text-text-primary hover:bg-surface-3',
    lime: 'bg-lime-300 text-surface-0 font-semibold hover:bg-lime-400 active:bg-lime-500 shadow-sm',
    link: 'text-orange-400 underline-offset-4 hover:underline p-0 h-auto',
}

const sizes = {
    default: 'h-10 px-4 py-2 text-sm gap-2',
    sm: 'h-8 px-3 py-1.5 text-sm gap-1.5',
    lg: 'h-12 px-5 py-2.5 text-base gap-2',
    icon: 'h-10 w-10 p-0',
    'icon-sm': 'h-8 w-8 p-0',
}

export function Button({
    className,
    variant = 'default',
    size = 'default',
    asChild = false,
    loading = false,
    disabled,
    children,
    ...props
}) {
    const Comp = asChild ? Slot : 'button'

    return (
        <Comp
            data-slot="button"
            disabled={disabled || loading}
            className={cn(
                'inline-flex items-center justify-center rounded-md font-medium transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 focus-visible:ring-offset-surface-0',
                'disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {loading && (
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
            )}
            {children}
        </Comp>
    )
}
