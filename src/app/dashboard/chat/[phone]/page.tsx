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
        <div className="min-h-screen bg-gray-50">
            <Sidebar />

            <main className="ml-64">
                <Header
                    title={contact.name || 'Chat'}
                    subtitle={formatPhone(phone)}
                />

                <div className="flex h-[calc(100vh-64px)]">
                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col relative z-0">
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 flex items-center gap-4 bg-white shadow-sm z-10">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Voltar
                                </Button>
                            </Link>

                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900">{contact.name || 'Sem nome'}</span>
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
                                        className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                    >
                                        {reactivating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Stethoscope className="w-4 h-4 mr-2" />}
                                        Reativar Bot
                                    </Button>
                                )}
                                <Button variant="secondary" size="sm" className="bg-gray-100 hover:bg-gray-200 text-gray-700">
                                    Finalizar
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area - WhatsApp Light Background */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#efeae2]"
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
                        <div className="p-4 border-t border-gray-200 bg-white shadow-[0_-1px_5px_rgba(0,0,0,0.05)] z-10">
                            <div className="flex gap-3">
                                <Input
                                    placeholder="Digite sua mensagem..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="flex-1 bg-gray-50 border-gray-200 focus:bg-white transition-colors text-gray-900"
                                    disabled={sending}
                                />
                                <Button
                                    onClick={handleSend}
                                    disabled={!newMessage.trim() || sending}
                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                >
                                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Contact Info */}
                    <aside className="w-80 border-l border-gray-200 p-6 overflow-y-auto bg-white">
                        <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-600" />
                            Resumo da Triagem
                        </h3>

                        {/* Tags */}
                        <div className="mb-8">
                            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                Tags
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {contact.tags?.map((tag) => (
                                    <Badge key={tag} variant="premium" className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1">
                                        {tag}
                                    </Badge>
                                ))}
                                {(!contact.tags || contact.tags.length === 0) && (
                                    <span className="text-sm text-gray-400 italic">Sem tags</span>
                                )}
                            </div>
                        </div>

                        {/* Variables */}
                        <div className="space-y-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dados Coletados</p>

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
                                <span className="text-sm text-gray-400 italic">Nenhuma variável coletada</span>
                            )}
                        </div>
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
        <Card padding="md" className="flex items-start gap-3 bg-gray-50 border-gray-100 shadow-sm" variant="default">
            <div className="text-blue-600 mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-gray-900 break-words leading-relaxed">{value}</p>
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
            className={`flex ${isOut ? 'justify-end' : 'justify-start'} group mb-1`}
        >
            <div className={`max-w-[85%] md:max-w-[65%] flex flex-col shadow-sm relative ${isOut ? 'items-end' : 'items-start'}`}>

                {/* Bubble Content */}
                <div className={`
                    rounded-lg px-3 py-1.5 text-[14.2px] text-gray-900 relative shadow-[0_1px_0.5px_rgba(0,0,0,0.13)]
                    ${isOut ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'}
                    ${hasButtons ? 'rounded-b-none border-b border-gray-100' : ''}
                `}>
                    {/* Tail SVG for realism */}
                    {isOut ? (
                        <svg viewBox="0 0 8 13" height="13" width="8" className="absolute top-0 -right-2 text-[#d9fdd3] fill-current">
                            <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path>
                        </svg>
                    ) : (
                        <svg viewBox="0 0 8 13" height="13" width="8" className="absolute top-0 -left-2 text-white fill-current scale-x-[-1]">
                            <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path>
                        </svg>
                    )}

                    <p className="whitespace-pre-wrap leading-relaxed relative z-10">
                        {message.content}
                    </p>

                    <div className="flex items-center justify-end gap-1 mt-0.5 select-none relative z-10 opacity-70">
                        <span className="text-[10px] text-gray-500 font-medium">
                            {new Date(message.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isOut && (
                            <span className="text-blue-500">
                                {/* Double check icon */}
                                <svg viewBox="0 0 16 15" width="16" height="15" className="fill-current w-3 h-3">
                                    <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.473-.018l6.168-7.96a.417.417 0 0 0-.106-.541zm-3.051 6.568l-1.39-1.341a.365.365 0 0 0-.526 0l-.478.497a.418.418 0 0 0 0 .541l1.54 1.485c.13.126.33.125.464 0l.478-.456a.418.418 0 0 0 0-.541l-.088-.186z"></path>
                                </svg>
                            </span>
                        )}
                    </div>
                </div>

                {/* Buttons Attached Below */}
                {hasButtons && message.metadata?.buttons && (
                    <div className="w-full bg-white rounded-b-lg overflow-hidden flex flex-col mt-[1px] shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
                        {message.metadata.buttons.map((btn) => {
                            const isSelected = selectedOption === btn.label;
                            return (
                                <div
                                    key={btn.id}
                                    className={`
                                        px-4 py-3 text-center text-[15px] cursor-default border-t border-gray-100 transition-colors font-medium
                                        ${isSelected ? 'bg-green-50 text-green-700' : 'text-blue-500 hover:bg-gray-50'}
                                    `}
                                >
                                    <span>
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
