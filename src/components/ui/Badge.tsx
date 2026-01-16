'use client';

import { cn } from '@/lib/utils';

export interface BadgeProps {
    variant?: 'default' | 'premium' | 'bot' | 'pending' | 'finished' | 'disqualified' | 'success';
    children: React.ReactNode;
    className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
    const variants = {
        default: 'bg-white/10 text-white/80 border-white/20',
        premium: 'badge-premium',
        bot: 'badge-bot',
        pending: 'badge-pending',
        finished: 'badge-finished',
        disqualified: 'badge-disqualified',
        success: 'bg-green-100 text-green-700 border-green-200'
    };

    return (
        <span className={cn('badge', variants[variant], className)}>
            {children}
        </span>
    );
}
