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
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#0b141a] bg-opacity-95"
                            style={{
                                backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                                backgroundBlendMode: 'overlay',
                                backgroundRepeat: 'repeat',
                                backgroundSize: '400px'
                            }}>
                            {messages.map((message, index) => {
                                const nextMsg = messages[index + 1];
                                const selectedOption = (message.message_type === 'button' && nextMsg && nextMsg.direction === 'in')
                                    ? nextMsg.content
                                    : null;

                                return (
                                    <MessageBubble
                                        key={message.id}
                                        message={message}
                                        selectedOption={selectedOption}
                                    />
                                );
                            })}
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

function MessageBubble({ message, selectedOption }: { message: Message; selectedOption: string | null }) {
    const isOut = message.direction === 'out';
    const hasButtons = message.metadata?.buttons && message.metadata.buttons.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isOut ? 'justify-end' : 'justify-start'} group`}
        >
            <div className={`max-w-[85%] md:max-w-[65%] flex flex-col shadow-sm relative ${isOut ? 'items-end' : 'items-start'}`}>

                {/* Bubble Content */}
                <div className={`
                    rounded-lg px-3 py-2 text-sm text-white relative shadow-sm
                    ${isOut ? 'bg-[#005c4b] rounded-tr-none' : 'bg-[#202c33] rounded-tl-none'}
                    ${hasButtons ? 'rounded-b-none border-b border-white/5' : ''}
                `}>
                    {/* Tail SVG for realism (Optional, but adds to "WhatsApp-like") */}
                    {isOut ? (
                        <svg viewBox="0 0 8 13" height="13" width="8" className="absolute top-0 -right-2 text-[#005c4b] fill-current">
                            <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path>
                        </svg>
                    ) : (
                        <svg viewBox="0 0 8 13" height="13" width="8" className="absolute top-0 -left-2 text-[#202c33] fill-current scale-x-[-1]">
                            <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path>
                        </svg>
                    )}

                    <p className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                    </p>

                    <div className="flex items-center justify-end gap-1 mt-1 select-none">
                        <span className="text-[11px] text-white/60">
                            {new Date(message.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isOut && (
                            <span className="text-[#53bdeb]">
                                <svg viewBox="0 0 16 15" width="16" height="15" className="fill-current w-3 h-3">
                                    <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.473-.018l6.168-7.96a.417.417 0 0 0-.106-.541zm-3.051 6.568l-1.39-1.341a.365.365 0 0 0-.526 0l-.478.497a.418.418 0 0 0 0 .541l1.54 1.485c.13.126.33.125.464 0l.478-.456a.418.418 0 0 0 0-.541l-.088-.186z"></path>
                                </svg>
                            </span>
                        )}
                    </div>
                </div>

                {/* Buttons Attached Below */}
                {hasButtons && message.metadata?.buttons && (
                    <div className="w-full bg-[#202c33] bg-opacity-60 backdrop-blur-sm rounded-b-lg overflow-hidden flex flex-col mt-[1px]">
                        {message.metadata.buttons.map((btn) => {
                            const isSelected = selectedOption === btn.label;
                            return (
                                <div
                                    key={btn.id}
                                    className={`
                                        px-4 py-3 text-center text-[15px] cursor-default border-t border-white/5 transition-colors
                                        ${isSelected ? 'bg-[#005c4b]/30' : 'hover:bg-white/5'}
                                    `}
                                >
                                    <span className={`font-medium ${isSelected ? 'text-green-400' : 'text-[#53bdeb]'}`}>
                                        {isSelected && "✅ "} {btn.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
