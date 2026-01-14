import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind classes with clsx
 * Handles conflicts and conditional classes properly
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format phone number for display
 */
export function formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 13) {
        // Format: +55 (11) 99999-9999
        return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`;
    }
    return phone;
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Get status label in Portuguese
 */
export function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        'BOT': 'Em Triagem',
        'PENDING': 'Aguardando',
        'FINISHED': 'Finalizado',
        'DISQUALIFIED': 'Descartado'
    };
    return labels[status] || status;
}

/**
 * Get status color class
 */
export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        'BOT': 'badge-bot',
        'PENDING': 'badge-pending',
        'FINISHED': 'badge-finished',
        'DISQUALIFIED': 'badge-disqualified'
    };
    return colors[status] || '';
}
