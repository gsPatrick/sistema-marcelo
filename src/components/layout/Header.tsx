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
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-40 relative">
            {/* Title */}
            <div>
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
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
                        icon={<Search className="w-4 h-4 text-gray-400" />}
                        className="bg-gray-50 border-gray-200 text-gray-900 focus:bg-white transition-colors"
                    />
                </div>

                {/* Connection Status */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${isChecking
                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                    : isConnected
                        ? 'bg-green-50 text-green-600 border-green-200'
                        : 'bg-red-50 text-red-600 border-red-200'
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
                <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </button>
            </div>
        </header>
    );
}
