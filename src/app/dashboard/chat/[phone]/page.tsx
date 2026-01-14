'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Phone, MapPin, Target, CreditCard, Stethoscope, Tag, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Sidebar, Header } from '@/components/layout';
import { Card, Badge, Button, Input } from '@/components/ui';
import { formatPhone, getStatusLabel } from '@/lib/utils';
import { getContact, getMessages, sendMessage, reactivateContact, type Contact, type Message } from '@/lib/api';

export default function ChatPage() {
    const params = useParams();
    const phone = params.phone as string;

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [contact, setContact] = useState<Contact | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [reactivating, setReactivating] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchData = async () => {
        try {
            const [contactData, messagesData] = await Promise.all([
                getContact(phone),
                getMessages(phone)
            ]);
            setContact(contactData);
            setMessages(messagesData);
        } catch (error) {
            console.error('Erro ao carregar chat:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Polling 5s
        return () => clearInterval(interval);
    }, [phone]);

    useEffect(() => {
        if (!loading) {
            scrollToBottom();
        }
    }, [messages, loading]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;

        try {
            setSending(true);
            // Otimistic update
            const tempMsg: Message = {
                id: Date.now().toString(),
                contact_phone: phone,
                direction: 'out',
                content: newMessage,
                message_type: 'text',
                created_at: new Date().toISOString()
            };
            setMessages([...messages, tempMsg]);
            setNewMessage('');

            await sendMessage(phone, tempMsg.content);
            await fetchData(); // Refresh real data
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            alert('Erro ao enviar mensagem');
        } finally {
            setSending(false);
        }
    };

    const handleReactivate = async () => {
        if (!confirm('Deseja reativar o bot para este contato?')) return;
        try {
            setReactivating(true);
            await reactivateContact(phone);
            await fetchData();
            alert('Bot reativado com sucesso!');
        } catch (error) {
            console.error('Erro ao reativar bot:', error);
            alert('Erro ao reativar bot');
        } finally {
            setReactivating(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (loading && !contact) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!contact) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                Contato não encontrado
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <Sidebar />

            <main className="ml-64">
                <Header
                    title={contact.name || 'Chat'}
                    subtitle={formatPhone(phone)}
                />

                <div className="flex h-[calc(100vh-64px)]">
                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col">
                        {/* Chat Header */}
                        <div className="p-4 border-b border-white/10 flex items-center gap-4 bg-black">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Voltar
                                </Button>
                            </Link>

                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-white">{contact.name || 'Sem nome'}</span>
                                    <Badge variant={(contact.status === 'HUMAN' ? 'disqualified' : contact.status.toLowerCase()) as any}>
                                        {contact.status === 'HUMAN' ? 'Bot Offline' : getStatusLabel(contact.status)}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {contact.status === 'HUMAN' && (
                                    <Button
                                        size="sm"
                                        onClick={handleReactivate}
                                        disabled={reactivating}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {reactivating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Stethoscope className="w-4 h-4 mr-2" />}
                                        Reativar Bot
                                    </Button>
                                )}
                                <Button variant="secondary" size="sm">
                                    Finalizar
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black">
                            {messages.map((message, index) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className={`flex ${message.direction === 'out' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${message.direction === 'out'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white/10 text-white/90'
                                        } ${(message.message_type === 'button' || message.message_type === 'list') && message.direction === 'out' ? 'border-2 border-blue-400 bg-blue-900/50' : ''}`}>

                                        {/* Renderiza conteudo especial se for botão */}
                                        {(message.message_type === 'button' || message.message_type === 'list') ? (
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium border-b border-white/20 pb-2 mb-2">{message.content}</p>
                                                <div className="flex flex-col gap-1 items-center opacity-70">
                                                    <div className="w-full text-center py-1 bg-white/10 rounded text-xs text-blue-200">
                                                        {message.message_type === 'button' ? 'Botões (WhatsApp)' : 'Lista de Opções'}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        )}

                                        <p className="text-xs text-white/50 mt-1 text-right">
                                            {new Date(message.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10 bg-black">
                            <div className="flex gap-3">
                                <Input
                                    placeholder="Digite sua mensagem..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="flex-1"
                                    disabled={sending}
                                />
                                <Button onClick={handleSend} disabled={!newMessage.trim() || sending}>
                                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Contact Info */}
                    <aside className="w-80 border-l border-white/10 p-4 overflow-y-auto bg-black">
                        <h3 className="text-sm font-semibold text-white mb-4">Resumo da Triagem</h3>

                        {/* Tags */}
                        <div className="mb-6">
                            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                Tags
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {contact.tags?.map((tag) => (
                                    <Badge key={tag} variant="premium">{tag}</Badge>
                                ))}
                                {(!contact.tags || contact.tags.length === 0) && (
                                    <span className="text-xs text-gray-600">Sem tags</span>
                                )}
                            </div>
                        </div>

                        {/* Variables */}
                        <div className="space-y-3">
                            {Object.entries(contact.variables || {}).map(([key, value]) => {
                                // Ignora variaveis internas longas ou json
                                if (typeof value !== 'string') return null;
                                return (
                                    <VariableCard
                                        key={key}
                                        icon={<Target className="w-4 h-4" />} // Generic icon
                                        label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        value={value}
                                    />
                                )
                            })}

                            {(!contact.variables || Object.keys(contact.variables).length === 0) && (
                                <span className="text-xs text-gray-600">Nenhuma variável coletada</span>
                            )}
                        </div>

                        {/* Actions Removed: Ligar para paciente */}
                    </aside>
                </div>
            </main>
        </div>
    );
}

interface VariableCardProps {
    icon: React.ReactNode;
    label: string;
    value?: string;
}

function VariableCard({ icon, label, value }: VariableCardProps) {
    if (!value) return null;

    return (
        <Card padding="sm" className="flex items-center gap-3">
            <div className="text-blue-500">{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm text-white truncate">{value}</p>
            </div>
        </Card>
    );
}
