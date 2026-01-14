'use client';

import { useState } from 'react';
import { Settings, User, Bell, Lock, Palette, Globe, Save, Check } from 'lucide-react';
import { Sidebar, Header } from '@/components/layout';
import { Card, Button, Input } from '@/components/ui';

export default function SettingsPage() {
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="min-h-screen bg-black">
            <Sidebar />

            <main className="ml-64">
                <Header title="Configurações" subtitle="Preferências do sistema" />

                <div className="p-6 max-w-4xl">
                    {/* Profile Section */}
                    <Card className="mb-6">
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <User className="w-8 h-8 text-blue-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Perfil do Usuário</h2>
                                <p className="text-sm text-gray-500">Gerencie suas informações pessoais</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Nome" placeholder="Seu nome" defaultValue="Administrador" />
                            <Input label="Email" placeholder="seu@email.com" defaultValue="admin@botmedico.com" />
                            <Input label="Telefone" placeholder="(00) 00000-0000" defaultValue="(27) 99999-9999" />
                            <Input label="Cargo" placeholder="Seu cargo" defaultValue="Secretária" />
                        </div>
                    </Card>

                    {/* Notifications Section */}
                    <Card className="mb-6">
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
                                <Bell className="w-8 h-8 text-amber-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Notificações</h2>
                                <p className="text-sm text-gray-500">Configure alertas e avisos</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <SettingToggle
                                label="Notificações de novos contatos"
                                description="Receba alertas quando novos pacientes iniciarem triagem"
                                defaultChecked
                            />
                            <SettingToggle
                                label="Notificações de transbordo"
                                description="Alertas quando pacientes forem qualificados"
                                defaultChecked
                            />
                            <SettingToggle
                                label="Som de notificações"
                                description="Ativar som para alertas"
                                defaultChecked={false}
                            />
                        </div>
                    </Card>

                    {/* API Section */}
                    <Card className="mb-6">
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Globe className="w-8 h-8 text-green-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Integrações</h2>
                                <p className="text-sm text-gray-500">Configurações de API e Z-API</p>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <Input label="URL da API" placeholder="http://localhost:3000" defaultValue="http://localhost:3000" />
                            <Input label="Z-API Instance ID" placeholder="Sua instância" type="password" />
                            <Input label="Z-API Token" placeholder="Seu token" type="password" />
                        </div>
                    </Card>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <Button onClick={handleSave}>
                            {saved ? (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Salvo!
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Salvar Alterações
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}

interface SettingToggleProps {
    label: string;
    description: string;
    defaultChecked?: boolean;
}

function SettingToggle({ label, description, defaultChecked = false }: SettingToggleProps) {
    const [checked, setChecked] = useState(defaultChecked);

    return (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className="text-white font-medium">{label}</p>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
            <button
                onClick={() => setChecked(!checked)}
                className={`w-12 h-6 rounded-full transition-colors ${checked ? 'bg-blue-500' : 'bg-white/10'
                    }`}
            >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
            </button>
        </div>
    );
}
