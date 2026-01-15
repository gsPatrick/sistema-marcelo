'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Search, Clock, Loader2 } from 'lucide-react';
import { Sidebar, Header } from '@/components/layout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Input } from '@/components/ui';
import Link from 'next/link';
import { getContacts, type Contact } from '@/lib/api';

export default function MessagesPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const data = await getContacts();
                // Filtra contatos que já interagiram
                setContacts(data.filter(c => c.last_interaction_at));
            } catch (error) {
                console.error('Erro ao buscar conversas:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, []);

    const filteredContacts = contacts.filter(c =>
        (c.name?.toLowerCase().includes(search.toLowerCase()) || '') ||
        c.phone.includes(search)
    );

    return (
        <DashboardLayout title="Mensagens" subtitle={`${contacts.length} conversas ativas`}>
            <div className="p-4 md:p-6 max-w-4xl mx-auto">
                {/* Search */}
                <div className="mb-6">
                    <Input
                        placeholder="Buscar conversas..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        icon={<Search className="w-4 h-4 text-gray-400" />}
                        className="bg-white border-gray-200 text-gray-900 focus:bg-white transition-colors shadow-sm"
                    />
                </div>

                {/* Conversations List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                    ) : (
                        <>
                            {filteredContacts.map((contact, index) => (
                                <motion.div
                                    key={contact.phone}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link href={`/dashboard/chat/${contact.phone}`}>
                                        <Card className="hover:border-blue-300 hover:shadow-md cursor-pointer transition-all duration-300 group bg-white border-gray-200 shadow-sm" variant="default">
                                            <div className="flex items-center gap-4">
                                                {/* Avatar */}
                                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-50 group-hover:scale-105 transition-transform">
                                                    {contact.name ? contact.name[0].toUpperCase() : '?'}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{contact.name || 'Sem nome'}</p>
                                                        <span className="text-xs text-gray-400 font-medium flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                                                            <Clock className="w-3 h-3" />
                                                            {contact.last_interaction_at ? new Date(contact.last_interaction_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 truncate mt-1 flex items-center gap-1">
                                                        <span className="font-medium text-gray-400">WhatsApp:</span>
                                                        {contact.phone}
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))}

                            {filteredContacts.length === 0 && (
                                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                                    <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                                    <p className="text-gray-500 font-medium">Nenhuma conversa encontrada</p>
                                    <p className="text-sm text-gray-400">Verifique os filtros ou aguarde novas mensagens.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
