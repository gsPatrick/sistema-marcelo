'use client';

import { useState, useEffect } from 'react';
import { Trash2, Plus, Phone, User, Save } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Button, Input } from '@/components/ui';
import {
    getNotificationSettings,
    createNotificationSetting,
    deleteNotificationSetting,
    type NotificationSetting
} from '@/lib/api';
// Force reload of styles if needed or ensuring consistent styling
import '@/app/globals.css';

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
            alert('Número adicionado com sucesso!');
            setNewName('');
            setNewPhone('');
            loadSettings();
        } catch (error) {
            console.error('Erro ao adicionar:', error);
            alert('Erro ao adicionar número. Verifique os logs.');
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
        <DashboardLayout title="Configurações" subtitle="Gerencie notificações e acessos">
            <div className="p-4 md:p-6 max-w-6xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Phone className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Notificações de Transbordo
                            </h2>
                            <p className="text-sm text-gray-500">
                                Quem deve receber aviso no WhatsApp quando um humano for solicitado?
                            </p>
                        </div>
                    </div>

                    {/* Add Form */}
                    <Card className="mb-8 border-blue-100 bg-white shadow-sm" variant="default">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nome do Médico/Atendente
                                </label>
                                <Input
                                    placeholder="Ex: Dr. Marcelo"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    icon={<User className="w-4 h-4 text-gray-400" />}
                                    className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    WhatsApp (com DDD)
                                </label>
                                <Input
                                    placeholder="Ex: 5527999887766"
                                    value={newPhone}
                                    onChange={(e) => setNewPhone(e.target.value)}
                                    icon={<Phone className="w-4 h-4 text-gray-400" />}
                                    className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white transition-colors"
                                />
                            </div>
                            <Button
                                onClick={handleAdd}
                                disabled={!newName || !newPhone}
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar Número
                            </Button>
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2 text-sm text-blue-700">
                            <span className="font-bold">Dica:</span>
                            Lembre-se de incluir o código do país (55) e o DDD. O número deve estar apto a receber mensagens do WhatsApp.
                        </div>
                    </Card>

                    {/* Grid of Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loading ? (
                            <p className="text-gray-500 col-span-full text-center py-8">Carregando...</p>
                        ) : settings.length === 0 ? (
                            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Phone className="w-6 h-6 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium">Nenhum número configurado.</p>
                                <p className="text-sm text-gray-400">Adicione acima para começar.</p>
                            </div>
                        ) : (
                            settings.map((item) => (
                                <Card
                                    key={item.id}
                                    className="group hover:border-blue-200 transition-all duration-300"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-lg shadow-sm">
                                                {item.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{item.name}</h3>
                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {item.phone}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Remover"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
