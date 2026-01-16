'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Play, Copy, Trash2, Edit, ArrowLeft } from 'lucide-react';
import { getFlows, deleteFlow, activateFlow, duplicateFlow, seedFlow, Flow } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function FlowsPage() {
    const router = useRouter();
    const [flows, setFlows] = useState<Flow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFlows();
    }, []);

    async function loadFlows() {
        try {
            const data = await getFlows();
            setFlows(data);
        } catch (error) {
            console.error('Error loading flows:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSeed() {
        setLoading(true);
        try {
            await seedFlow();
            await loadFlows();
            alert('Fluxo padrão restaurado com sucesso!');
        } catch (error) {
            console.error(error);
            alert('Erro ao restaurar fluxo padrão.');
        }
    }

    async function handleActivate(id: string) {
        if (!confirm('Tem certeza que deseja ativar este fluxo? Os outros serão desativados.')) return;
        try {
            await activateFlow(id);
            await loadFlows();
        } catch (error) {
            alert('Erro ao ativar fluxo');
        }
    }

    async function handleDuplicate(id: string) {
        try {
            await duplicateFlow(id);
            await loadFlows();
        } catch (error) {
            alert('Erro ao duplicar fluxo');
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Tem certeza? Isso não pode ser desfeito.')) return;
        try {
            await deleteFlow(id);
            await loadFlows();
        } catch (error) {
            alert('Erro ao deletar fluxo');
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Fluxos de Conversa</h1>
                        <p className="text-gray-500">Gerencie os fluxos de automação do seu bot.</p>
                    </div>
                </div>
                <Button onClick={() => router.push('/dashboard/flows/builder')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Fluxo
                </Button>
            </div>

            {loading ? (
                <div>Carregando...</div>
            ) : flows.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 mb-4">Nenhum fluxo encontrado.</p>
                    <Button onClick={handleSeed} variant="outline">
                        <Copy className="w-4 h-4 mr-2" />
                        Restaurar Fluxo Padrão
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {flows.map((flow) => (
                        <Card key={flow.id} className={flow.is_active ? 'border-green-500 border-2' : ''}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle>{flow.name}</CardTitle>
                                    {flow.is_active && <Badge variant="success">Ativo</Badge>}
                                </div>
                                <CardDescription className="line-clamp-2 h-10">
                                    {flow.description || 'Sem descrição'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-gray-500">
                                    <p>Gatilho: <span className="font-mono font-bold">{flow.trigger_keyword || 'Nenhum'}</span></p>
                                    <p>Nós: {Object.keys(flow.nodes || {}).length}</p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between gap-2">
                                <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/flows/builder?id=${flow.id}`)}>
                                    <Edit className="w-4 h-4 mr-1" /> Editar
                                </Button>
                                <div className="flex gap-1">
                                    {!flow.is_active && (
                                        <Button variant="ghost" size="icon" title="Ativar" onClick={() => handleActivate(flow.id)}>
                                            <Play className="w-4 h-4 text-green-600" />
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" title="Duplicar" onClick={() => handleDuplicate(flow.id)}>
                                        <Copy className="w-4 h-4 text-blue-600" />
                                    </Button>
                                    <Button variant="ghost" size="icon" title="Excluir" onClick={() => handleDelete(flow.id)}>
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
