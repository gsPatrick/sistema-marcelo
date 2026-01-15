'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Search, Filter, MoreVertical, Loader2 } from 'lucide-react';
import { Sidebar, Header } from '@/components/layout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
        <DashboardLayout title="Contatos" subtitle={`${contacts.length} contatos cadastrados`}>
            <div className="p-4 md:p-6 max-w-7xl mx-auto">
                {/* Filters */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                        <Input
                            placeholder="Buscar por nome ou telefone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            icon={<Search className="w-4 h-4 text-gray-400" />}
                            className="bg-white border-gray-200 text-gray-900 focus:bg-white transition-colors shadow-sm"
                        />
                    </div>
                    <Button variant="secondary" className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtros
                    </Button>
                </div>

                {/* Table */}
                <Card padding="none" className="bg-white border-gray-200 shadow-sm overflow-hidden" variant="default">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
                                        <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Telefone</th>
                                        <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</th>
                                        <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Última Interação</th>
                                        <th className="text-right p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredContacts.map((contact, index) => (
                                        <motion.tr
                                            key={contact.phone}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="hover:bg-blue-50/30 transition-colors group"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shadow-sm">
                                                        {contact.name?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                    <span className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors">
                                                        {contact.name || 'Sem nome'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="flex items-center gap-2 text-gray-500 font-medium">
                                                    <Phone className="w-3.5 h-3.5" />
                                                    {formatPhone(contact.phone)}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant={contact.status.toLowerCase() as 'pending' | 'bot' | 'finished' | 'disqualified'}>
                                                    {getStatusLabel(contact.status)}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-1 flex-wrap">
                                                    {contact.tags?.slice(0, 2).map(tag => (
                                                        <Badge key={tag} variant="premium" className="text-xs bg-blue-50 text-blue-700 border-blue-100">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-500 text-sm">
                                                {contact.last_interaction_at ? new Date(contact.last_interaction_at).toLocaleDateString('pt-BR') : '-'}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-colors">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}

                                    {filteredContacts.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center py-16">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <Search className="w-8 h-8 mb-2 opacity-20" />
                                                    <p>Nenhum contato encontrado</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </DashboardLayout>
    );
}
