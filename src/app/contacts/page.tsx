'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Search, Filter, MoreVertical, Loader2 } from 'lucide-react';
import { Sidebar, Header } from '@/components/layout';
import { Card, Badge, Input, Button } from '@/components/ui';
import { formatPhone, getStatusLabel } from '@/lib/utils';
import { getContacts, type Contact } from '@/lib/api';

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const data = await getContacts();
                setContacts(data);
            } catch (error) {
                console.error('Erro ao buscar contatos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContacts();
    }, []);

    const filteredContacts = contacts.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    );

    return (
        <div className="min-h-screen bg-black">
            <Sidebar />

            <main className="ml-64">
                <Header title="Contatos" subtitle={`${contacts.length} contatos cadastrados`} />

                <div className="p-6">
                    {/* Filters */}
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1">
                            <Input
                                placeholder="Buscar por nome ou telefone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                icon={<Search className="w-4 h-4" />}
                                className="glass-input"
                            />
                        </div>
                        <Button variant="secondary">
                            <Filter className="w-4 h-4 mr-2" />
                            Filtros
                        </Button>
                    </div>

                    {/* Table */}
                    <Card padding="none">
                        {loading ? (
                            <div className="flex justify-center p-12">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left p-4 text-sm font-medium text-gray-500">Nome</th>
                                            <th className="text-left p-4 text-sm font-medium text-gray-500">Telefone</th>
                                            <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                                            <th className="text-left p-4 text-sm font-medium text-gray-500">Tags</th>
                                            <th className="text-left p-4 text-sm font-medium text-gray-500">Última Interação</th>
                                            <th className="text-right p-4 text-sm font-medium text-gray-500">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredContacts.map((contact, index) => (
                                            <motion.tr
                                                key={contact.phone}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.03 }}
                                                className="border-b border-white/5 hover:bg-white/5"
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-medium">
                                                            {contact.name?.[0] || '?'}
                                                        </div>
                                                        <span className="text-white font-medium">{contact.name || 'Sem nome'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="flex items-center gap-2 text-gray-400">
                                                        <Phone className="w-4 h-4" />
                                                        {formatPhone(contact.phone)}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant={contact.status.toLowerCase() as 'pending' | 'bot' | 'finished' | 'disqualified'}>
                                                        {getStatusLabel(contact.status)}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-1">
                                                        {contact.tags?.slice(0, 2).map(tag => (
                                                            <Badge key={tag} variant="premium" className="text-xs">{tag}</Badge>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-gray-500 text-sm">
                                                    {contact.last_interaction_at ? new Date(contact.last_interaction_at).toLocaleDateString('pt-BR') : '-'}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}

                                        {filteredContacts.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="text-center py-12 text-gray-500">
                                                    Nenhum contato encontrado
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </div>
            </main>
        </div>
    );
}
