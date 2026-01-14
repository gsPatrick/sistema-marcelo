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

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-black border-r border-white/10 flex flex-col z-50">
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">Bot Médico</h1>
                        <p className="text-xs text-gray-500">Triagem Inteligente</p>
                    </div>
                </Link>
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
                            className={cn(
                                'relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
                                isActive
                                    ? 'text-white bg-white/10'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full"
                                    transition={{ type: 'spring', duration: 0.5 }}
                                />
                            )}
                            <item.icon className={cn(
                                'w-5 h-5 transition-colors',
                                isActive ? 'text-blue-500' : 'text-gray-500 group-hover:text-white'
                            )} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/10">
                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200">
                    <LogOut className="w-5 h-5" />
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    );
}
