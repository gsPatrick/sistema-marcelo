'use client';

import { useState, useEffect } from 'react';
import { Trash2, Plus, Phone, User, Save } from 'lucide-react';
import { Sidebar, Header } from '@/components/layout';
import { Card, Button, Input } from '@/components/ui';
import {
    getNotificationSettings,
    createNotificationSetting,
    deleteNotificationSetting,
    type NotificationSetting
} from '@/lib/api';

export default function SettingsPage() {
    const [settings, setSettings] = useState<NotificationSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await getNotificationSettings();
            setSettings(data);
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newName || !newPhone) return;

        try {
            await createNotificationSetting({ name: newName, phone: newPhone });
            setNewName('');
            setNewPhone('');
            loadSettings();
        } catch (error) {
            console.error('Erro ao adicionar:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteNotificationSetting(id);
            loadSettings();
        } catch (error) {
            console.error('Erro ao deletar:', error);
        }
    };

    return (
        <div className="min-h-screen bg-black">
            <Sidebar />

            <main className="ml-64">
                <Header
                    title="Configurações"
                    subtitle="Gerencie notificações e acessos"
                />

                <div className="p-6 max-w-4xl">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Phone className="w-5 h-5 text-blue-500" />
                            Notificações de Transbordo
                        </h2>
                        <p className="text-gray-400 mb-6">
                            Adicione os números que receberão um aviso no WhatsApp quando o bot transferir um atendimento para humano.
                        </p>

                        {/* Add Form */}
                        <Card className="mb-8 border-blue-500/20 bg-blue-500/5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        Nome do Médico/Atendente
                                    </label>
                                    <Input
                                        placeholder="Ex: Dr. Marcelo"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        icon={<User className="w-4 h-4" />}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        WhatsApp (com DDD)
                                    </label>
                                    <Input
                                        placeholder="Ex: 5527999887766"
                                        value={newPhone}
                                        onChange={(e) => setNewPhone(e.target.value)}
                                        icon={<Phone className="w-4 h-4" />}
                                    />
                                </div>
                                <Button onClick={handleAdd} disabled={!newName || !newPhone}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Adicionar
                                </Button>
                            </div>
                        </Card>

                        {/* List */}
                        <div className="space-y-4">
                            {loading ? (
                                <p className="text-gray-500 text-center py-4">Carregando...</p>
                            ) : settings.length === 0 ? (
                                <p className="text-gray-500 text-center py-4 bg-white/5 rounded-xl border border-white/5 border-dashed">
                                    Nenhum número configurado.
                                </p>
                            ) : (
                                settings.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                                <Phone className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{item.name}</p>
                                                <p className="text-sm text-gray-500">{item.phone}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Remover"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
