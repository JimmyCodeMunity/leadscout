import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

export function DialogPortal({ children }) {
    return <DialogPrimitive.Portal>{children}</DialogPrimitive.Portal>
}

export function DialogOverlay({ className, ...props }) {
    return (
        <DialogPrimitive.Overlay
            className={cn(
                'fixed inset-0 z-50 bg-black/70 backdrop-blur-sm',
                'data-[state=open]:animate-fade-in data-[state=closed]:opacity-0 transition-opacity duration-200',
                className
            )}
            {...props}
        />
    )
}

export function DialogContent({ className, children, showClose = true, ...props }) {
    return (
        <DialogPortal>
            <DialogOverlay />
            <DialogPrimitive.Content
                className={cn(
                    'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
                    'w-full max-w-lg rounded-2xl border border-border-default bg-surface-2 shadow-2xl',
                    'data-[state=open]:animate-scale-in data-[state=closed]:opacity-0 transition-all duration-200',
                    'p-6 focus:outline-none',
                    className
                )}
                {...props}
            >
                {children}
                {showClose && (
                    <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-4 transition-colors">
                        <X size={16} />
                    </DialogPrimitive.Close>
                )}
            </DialogPrimitive.Content>
        </DialogPortal>
    )
}

export function DialogHeader({ className, children, ...props }) {
    return (
        <div className={cn('mb-5', className)} {...props}>
            {children}
        </div>
    )
}

export function DialogTitle({ className, children, ...props }) {
    return (
        <DialogPrimitive.Title
            className={cn('text-lg font-bold text-text-primary', className)}
            {...props}
        >
            {children}
        </DialogPrimitive.Title>
    )
}

export function DialogDescription({ className, children, ...props }) {
    return (
        <DialogPrimitive.Description
            className={cn('text-sm text-text-muted mt-1', className)}
            {...props}
        >
            {children}
        </DialogPrimitive.Description>
    )
}
