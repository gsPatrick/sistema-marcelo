'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    GitBranch,
    Settings,
    Users,
    MessageSquare,
    LogOut,
    Stethoscope
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        label: 'Editor de Textos',
        href: '/dashboard/texts',
        icon: GitBranch, // Usando ícone de Branch para Editor de Textos, ou mante-lo
    },
    {
        label: 'Contatos',
        href: '/contacts',
        icon: Users,
    },
    {
        label: 'Mensagens',
        href: '/messages',
        icon: MessageSquare,
    },
    {
        label: 'Configurações',
        href: '/dashboard/settings',
        icon: Settings,
    },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className={cn(
            "fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col z-50 transition-transform duration-300 ease-in-out md:translate-x-0",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            {/* Logo */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
                        <Stethoscope className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Bot Médico</h1>
                        <p className="text-xs text-gray-500">Triagem Inteligente</p>
                    </div>
                </Link>
                {/* Close button for mobile */}
                <button onClick={onClose} className="md:hidden p-1 text-gray-400 hover:text-gray-600">
                    <LogOut className="w-5 h-5 rotate-180" /> {/* Reusing LogOut as back icon for now or just X */}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose} // Close sidebar on mobile when link clicked
                            className={cn(
                                'relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
                                isActive
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-l-full"
                                    transition={{ type: 'spring', duration: 0.5 }}
                                />
                            )}
                            <item.icon className={cn(
                                'w-5 h-5 transition-colors',
                                isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                            )} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200">
                    <LogOut className="w-5 h-5" />
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    );
}
