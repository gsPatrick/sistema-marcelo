'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Search, Clock, Loader2 } from 'lucide-react';
import { Sidebar, Header } from '@/components/layout';
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
        <div className="min-h-screen bg-black">
            <Sidebar />

            <main className="ml-64">
                <Header title="Mensagens" subtitle={`${contacts.length} conversas ativas`} />

                <div className="p-6">
                    {/* Search */}
                    <div className="mb-6">
                        <Input
                            placeholder="Buscar conversas..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            icon={<Search className="w-4 h-4" />}
                        />
                    </div>

                    {/* Conversations List */}
                    <div className="space-y-2">
                        {loading ? (
                            <div className="flex justify-center p-12">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
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
                                            <Card className="hover:border-white/20 cursor-pointer">
                                                <div className="flex items-center gap-4">
                                                    {/* Avatar */}
                                                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-semibold">
                                                        {contact.name ? contact.name[0].toUpperCase() : '?'}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-medium text-white">{contact.name || 'Sem nome'}</p>
                                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {contact.last_interaction_at ? new Date(contact.last_interaction_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 truncate mt-1">
                                                            {contact.phone}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    </motion.div>
                                ))}

                                {filteredContacts.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>Nenhuma conversa encontrada</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
