'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'glass', padding = 'md', children, ...props }, ref) => {
        const variants = {
            default: 'bg-white border border-gray-200 shadow-sm',
            glass: 'glass-card',
        };

        const paddings = {
            none: '',
            sm: 'p-3',
            md: 'p-4',
            lg: 'p-6'
        };

        return (
            <div
                ref={ref}
                className={cn('rounded-xl', variants[variant], paddings[padding], className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

export { Card };
