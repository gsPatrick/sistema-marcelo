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
        <div className="min-h-screen bg-black">
            <Sidebar />

            <main className="ml-64">
                <Header
                    title="Dashboard"
                    subtitle={`${contacts.length} contatos no sistema`}
                />

                <div className="p-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        <StatsCard
                            icon={<Clock className="w-5 h-5" />}
                            label="Aguardando"
                            value={stats.pending}
                            color="text-amber-500"
                            bgColor="bg-amber-500/10"
                        />
                        <StatsCard
                            icon={<Users className="w-5 h-5" />}
                            label="Em Triagem"
                            value={stats.bot}
                            color="text-gray-400"
                            bgColor="bg-white/5"
                        />
                        <StatsCard
                            icon={<CheckCircle className="w-5 h-5" />}
                            label="Finalizados"
                            value={stats.finished}
                            color="text-green-500"
                            bgColor="bg-green-500/10"
                        />
                        <StatsCard
                            icon={<XCircle className="w-5 h-5" />}
                            label="Descartados"
                            value={stats.disqualified}
                            color="text-red-500"
                            bgColor="bg-red-500/10"
                        />
                    </div>

                    {/* Bot Offline Widget - Shows contacts in HUMAN status */}
                    <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${contacts.some(c => c.status === 'HUMAN') ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
                            Bot Desligado / Atendimento Humano
                        </h3>

                        {contacts.filter(c => c.status === 'HUMAN').length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {contacts.filter(c => c.status === 'HUMAN').map(contact => (
                                    <Link key={contact.phone} href={`/dashboard/chat/${contact.phone}`}>
                                        <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:border-red-500/50 transition-all cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                                                    <Users className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{contact.name || 'Sem nome'}</p>
                                                    <p className="text-xs text-red-300 flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />
                                                        {formatPhone(contact.phone)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="px-3 py-1 rounded-full bg-red-500/20 text-xs text-red-300 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                                Reativar
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Todos os bots estão ativos. Nenhum contato aguardando reativação.
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {tab.label}
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key ? 'bg-white/20' : 'bg-white/10'
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
                                <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
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
                            <div className="text-center py-12 text-gray-500">
                                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhum contato nesta categoria</p>
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
        <Card>
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center ${color}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-2xl font-bold text-white">{value}</p>
                    <p className="text-sm text-gray-500">{label}</p>
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
            <Card className="hover:border-white/20 cursor-pointer">
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-semibold">
                        {contact.name ? contact.name[0].toUpperCase() : '?'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="font-medium text-white truncate">
                                {contact.name || 'Sem nome'}
                            </p>
                            <Badge variant={contact.status.toLowerCase() as 'pending' | 'bot' | 'finished' | 'disqualified'}>
                                {getStatusLabel(contact.status)}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                                <Phone className="w-3 h-3" />
                                {formatPhone(contact.phone)}
                            </span>
                            {contact.variables?.regiao && (
                                <span className="text-sm text-gray-500">
                                    {contact.variables.regiao}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex gap-1">
                        {contact.tags?.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="premium" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                    </div>

                    {/* Time */}
                    <div className="text-right">
                        <p className="text-xs text-gray-600">
                            {contact.last_interaction_at ? new Date(contact.last_interaction_at).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : ''}
                        </p>
                    </div>
                </div>
            </Card>
        </Link>
    );
}
