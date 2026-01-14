'use client';

import { Bell, Search, Wifi, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui';
import { checkHealth } from '@/lib/api';

interface HeaderProps {
    title?: string;
    subtitle?: string;
}

export function Header({ title = 'Dashboard', subtitle }: HeaderProps) {
    const [isConnected, setIsConnected] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkConnection = async () => {
            try {
                await checkHealth();
                setIsConnected(true);
            } catch {
                setIsConnected(false);
            } finally {
                setIsChecking(false);
            }
        };

        checkConnection();
        const interval = setInterval(checkConnection, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="h-16 bg-black border-b border-white/10 flex items-center justify-between px-6">
            {/* Title */}
            <div>
                <h1 className="text-xl font-semibold text-white">{title}</h1>
                {subtitle && (
                    <p className="text-sm text-gray-500">{subtitle}</p>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="hidden md:block w-64">
                    <Input
                        placeholder="Buscar contato..."
                        icon={<Search className="w-4 h-4" />}
                    />
                </div>

                {/* Connection Status */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${isChecking
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : isConnected
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                    {isChecking ? (
                        <>
                            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <span>Conectando...</span>
                        </>
                    ) : isConnected ? (
                        <>
                            <Wifi className="w-3 h-3" />
                            <span>API Online</span>
                        </>
                    ) : (
                        <>
                            <WifiOff className="w-3 h-3" />
                            <span>Offline</span>
                        </>
                    )}
                </div>

                {/* Notifications */}
                <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
                </button>
            </div>
        </header>
    );
}
