'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, CheckCircle, XCircle, Phone } from 'lucide-react';
import Link from 'next/link';
import { Sidebar, Header } from '@/components/layout';
import { Card, Badge } from '@/components/ui';
import { formatPhone, getStatusLabel } from '@/lib/utils';
import { getContacts, type Contact } from '@/lib/api';

type TabKey = 'pending' | 'bot' | 'finished';

const tabs: { key: TabKey; label: string; statuses: string[] }[] = [
    { key: 'pending', label: 'Aguardando', statuses: ['PENDING'] },
    { key: 'bot', label: 'Em Triagem', statuses: ['BOT'] },
    { key: 'finished', label: 'Finalizados', statuses: ['FINISHED', 'DISQUALIFIED'] },
];

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<TabKey>('pending');
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchContacts();
        const interval = setInterval(fetchContacts, 10000); // Polling 10s
        return () => clearInterval(interval);
    }, []);

    const filteredContacts = contacts.filter(c =>
        tabs.find(t => t.key === activeTab)?.statuses.includes(c.status)
    );

    const stats = {
        pending: contacts.filter(c => c.status === 'PENDING').length,
        bot: contacts.filter(c => c.status === 'BOT').length,
        finished: contacts.filter(c => c.status === 'FINISHED').length,
        disqualified: contacts.filter(c => c.status === 'DISQUALIFIED').length,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />

            <main className="ml-64">
                <Header
                    title="Dashboard"
                    subtitle={`${contacts.length} contatos no sistema`}
                />

                <div className="p-6 max-w-7xl mx-auto">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatsCard
                            icon={<Clock className="w-5 h-5" />}
                            label="Aguardando"
                            value={stats.pending}
                            color="text-amber-600"
                            bgColor="bg-amber-100"
                        />
                        <StatsCard
                            icon={<Users className="w-5 h-5" />}
                            label="Em Triagem"
                            value={stats.bot}
                            color="text-blue-600"
                            bgColor="bg-blue-100"
                        />
                        <StatsCard
                            icon={<CheckCircle className="w-5 h-5" />}
                            label="Finalizados"
                            value={stats.finished}
                            color="text-green-600"
                            bgColor="bg-green-100"
                        />
                        <StatsCard
                            icon={<XCircle className="w-5 h-5" />}
                            label="Descartados"
                            value={stats.disqualified}
                            color="text-red-600"
                            bgColor="bg-red-100"
                        />
                    </div>

                    {/* Bot Offline Widget - Shows contacts in HUMAN status */}
                    <div className="mb-8 p-6 rounded-2xl bg-white border border-red-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />

                        <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2 relative z-10">
                            <div className={`w-2.5 h-2.5 rounded-full ${contacts.some(c => c.status === 'HUMAN') ? 'bg-red-500 animate-pulse shadow-lg shadow-red-200' : 'bg-gray-300'}`} />
                            Bot Desligado / Atendimento Humano
                        </h3>

                        {contacts.filter(c => c.status === 'HUMAN').length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                                {contacts.filter(c => c.status === 'HUMAN').map(contact => (
                                    <Link key={contact.phone} href={`/dashboard/chat/${contact.phone}`}>
                                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center justify-between hover:border-red-200 hover:shadow-md transition-all cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-red-500 shadow-sm">
                                                    <Users className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{contact.name || 'Sem nome'}</p>
                                                    <p className="text-xs text-red-600 flex items-center gap-1 font-medium">
                                                        <Phone className="w-3 h-3" />
                                                        {formatPhone(contact.phone)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="px-3 py-1 rounded-full bg-white text-xs font-bold text-red-600 border border-red-100 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-colors">
                                                Reativar
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500 flex items-center gap-2 relative z-10 bg-gray-50 p-3 rounded-lg inline-flex border border-gray-100">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                Todos os bots estão ativos. Nenhum contato aguardando reativação.
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-xl border border-gray-200 w-fit shadow-sm">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === tab.key
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                {tab.label}
                                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {contacts.filter(c => tab.statuses.includes(c.status)).length}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Contact List */}
                    <div className="grid gap-4">
                        {loading && contacts.length === 0 ? (
                            <div className="flex justify-center py-12">
                                <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {filteredContacts.map((contact, index) => (
                                    <motion.div
                                        key={contact.phone}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <ContactCard contact={contact} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}

                        {!loading && filteredContacts.length === 0 && (
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Users className="w-6 h-6 text-gray-400" />
                                </div>
                                <h3 className="text-gray-900 font-medium mb-1">Nenhum contato encontrado</h3>
                                <p className="text-sm text-gray-500">Não há contatos nesta categoria no momento.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

interface StatsCardProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
    bgColor: string;
}

function StatsCard({ icon, label, value, color, bgColor }: StatsCardProps) {
    return (
        <Card className="border-gray-100 shadow-sm" variant="default">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center ${color} shadow-sm`}>
                    {icon}
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-sm text-gray-500 font-medium">{label}</p>
                </div>
            </div>
        </Card>
    );
}

interface ContactCardProps {
    contact: Contact;
}

function ContactCard({ contact }: ContactCardProps) {
    return (
        <Link href={`/dashboard/chat/${contact.phone}`}>
            <Card className="hover:border-blue-300 hover:shadow-md cursor-pointer transition-all duration-300 group" variant="default">
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-100 shadow-sm group-hover:scale-105 transition-transform">
                        {contact.name ? contact.name[0].toUpperCase() : '?'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                {contact.name || 'Sem nome'}
                            </p>
                            <Badge variant={contact.status.toLowerCase() as 'pending' | 'bot' | 'finished' | 'disqualified'}>
                                {getStatusLabel(contact.status)}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-sm text-gray-500 font-medium">
                                <Phone className="w-3 h-3" />
                                {formatPhone(contact.phone)}
                            </span>
                            {contact.variables?.regiao && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                                    {contact.variables.regiao}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex gap-1">
                        {contact.tags?.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="premium" className="text-xs bg-blue-50 text-blue-700 border-blue-100">
                                {tag}
                            </Badge>
                        ))}
                    </div>

                    {/* Time */}
                    <div className="text-right pl-4 border-l border-gray-100">
                        <p className="text-xs text-gray-400 font-medium">Última atividade</p>
                        <p className="text-sm font-semibold text-gray-700">
                            {contact.last_interaction_at ? new Date(contact.last_interaction_at).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : '-'}
                        </p>
                    </div>
                </div>
            </Card>
        </Link>
    );
}
