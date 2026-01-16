'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Loader2, MessageSquare, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { getFlows, getFlow, saveFlow, Flow, FlowNode } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

export default function SimpleTextsPage() {
    const router = useRouter();
    const [activeFlow, setActiveFlow] = useState<Flow | null>(null);
    const [nodes, setNodes] = useState<Record<string, FlowNode>>({});
    const [sortedNodeKeys, setSortedNodeKeys] = useState<string[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadActiveFlow();
    }, []);

    async function loadActiveFlow() {
        try {
            const allFlows = await getFlows();

            // Tenta achar o ativo, senão pega o primeiro da lista, senão null
            const flowListItem = allFlows.find(f => f.is_active) || allFlows[0];

            if (flowListItem) {
                // PRECISAMOS buscar o fluxo completo pelo ID, pois a lista não retorna os 'nodes'
                const fullFlow = await getFlow(flowListItem.id);

                setActiveFlow(fullFlow);

                // Garante que nodes seja um objeto válido antes de clonar
                const nodesData = fullFlow.nodes || {};
                setNodes(JSON.parse(JSON.stringify(nodesData)));

                // Ordenação Inteligente (BFS) para seguir o fluxo da conversa
                const orderedKeys = orderNodesByFlow(nodesData);
                setSortedNodeKeys(orderedKeys);
            }
        } catch (error) {
            console.error('Erro ao carregar fluxo:', error);
            alert('Erro ao carregar fluxos.');
        } finally {
            setLoading(false);
        }
    }

    // Algoritmo BFS para ordenar os nós na ordem que aparecem no fluxo
    function orderNodesByFlow(nodes: Record<string, FlowNode>): string[] {
        const ordered: string[] = [];
        const visited = new Set<string>();
        const queue: string[] = [];

        // Começa pelo 'start' ou o primeiro que achar
        const startNode = nodes['start'] ? 'start' : Object.keys(nodes)[0];
        if (startNode) queue.push(startNode);

        while (queue.length > 0) {
            const id = queue.shift()!;
            if (visited.has(id)) continue;

            visited.add(id);
            ordered.push(id);

            const node = nodes[id];
            if (!node) continue;

            // Adiciona próximos nós à fila (prioriza next_node direto, depois options)
            if (node.next_node && !visited.has(node.next_node)) {
                queue.push(node.next_node);
            }

            if (node.options) {
                node.options.forEach(opt => {
                    if (opt.next_node && !visited.has(opt.next_node)) {
                        queue.push(opt.next_node);
                    }
                });
            }
        }

        // Adiciona nós desconectados que sobraram
        Object.keys(nodes).forEach(key => {
            if (!visited.has(key)) {
                ordered.push(key);
            }
        });

        return ordered;
    }

    const handleTextChange = (nodeId: string, newText: string) => {
        setNodes(prev => ({
            ...prev,
            [nodeId]: {
                ...prev[nodeId],
                content: newText
            }
        }));
    };

    const handleOptionLabelChange = (nodeId: string, optionIndex: number, newLabel: string) => {
        setNodes(prev => {
            const node = { ...prev[nodeId] };
            if (node.options) {
                const newOptions = [...node.options];
                newOptions[optionIndex] = { ...newOptions[optionIndex], label: newLabel };
                node.options = newOptions;
            }
            return {
                ...prev,
                [nodeId]: node
            };
        });
    };

    const handleSave = async () => {
        if (!activeFlow) return;
        setSaving(true);
        try {
            await saveFlow(activeFlow.id, {
                nodes: nodes
            });
            alert('Fluxo salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar alterações.');
        } finally {
            setSaving(false);
        }
    };

    const handleNext = () => {
        if (currentStep < sortedNodeKeys.length - 1) {
            setCurrentStep(c => c + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(c => c - 1);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                Carregando editor simplificado...
            </div>
        );
    }

    if (!activeFlow) {
        return (
            <div className="p-10 text-center">
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800">Nenhum fluxo encontrado</h2>
                <p className="text-gray-600 mt-2">Crie ou restaure um fluxo no menu "Fluxos (Builder)" para começar.</p>
                <Button className="mt-6" onClick={() => router.push('/dashboard/flows')}>
                    Ir para Fluxos
                </Button>
            </div>
        );
    }

    const currentNodeId = sortedNodeKeys[currentStep];
    const node = nodes[currentNodeId];

    if (sortedNodeKeys.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8 text-blue-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Fluxo sem mensagens</h2>
                    <p className="text-gray-500 mb-6">
                        Este fluxo ainda não possui mensagens salvas. Adicione mensagens no construtor visual e salve para vê-las aqui.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button onClick={() => router.push(`/dashboard/flows/builder?id=${activeFlow?.id}`)} className="w-full">
                            Ir para o Construtor Visual
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/dashboard')} className="w-full">
                            Voltar ao Menu
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!node) return <div>Erro: Nó não encontrado (ID: {currentNodeId})</div>;

    const nodeTypeLabels = {
        message: 'Mensagem de Texto',
        question: 'Pergunta / Menu',
        handover: 'Encaminhamento (Final)',
        disqualify: 'Descarte (Final)'
    };

    const progressPercentage = ((currentStep + 1) / sortedNodeKeys.length) * 100;

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header Fixo */}
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            Editor Passo a Passo
                            <Badge variant="success" className="text-xs">Simplificado</Badge>
                        </h1>
                        <p className="text-sm text-gray-500">
                            Editando fluxo: <span className="font-semibold">{activeFlow.name}</span>
                        </p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 min-w-[120px]">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    {saving ? 'Salvando...' : 'Salvar'}
                </Button>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-3xl mx-auto">
                {/* Progress Bar */}
                <div className="w-full mb-8">
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                        <span>Passo {currentStep + 1} de {sortedNodeKeys.length}</span>
                        <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>

                {/* Editor Card */}
                <Card className="w-full shadow-lg border-t-4 border-t-blue-500 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <CardHeader className="pb-3 border-b bg-gray-50/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <span className="bg-blue-100 p-2 rounded-full">
                                    <MessageSquare className="w-5 h-5 text-blue-600" />
                                </span>
                                {/* @ts-ignore */}
                                {nodeTypeLabels[node.type] || node.type}
                            </CardTitle>
                            <Badge variant="default" className="font-mono text-xs">
                                ID: {currentNodeId}
                            </Badge>
                        </div>
                        <CardDescription className="text-base mt-2">
                            Edite o texto abaixo. Este é o conteúdo que o paciente receberá.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-8 space-y-6">
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                Mensagem do Robô
                            </label>
                            <textarea
                                value={node.content}
                                onChange={(e) => handleTextChange(currentNodeId, e.target.value)}
                                rows={6}
                                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-gray-800 text-base leading-relaxed resize-none shadow-sm bg-white"
                                placeholder="Digite a mensagem aqui..."
                            />
                        </div>

                        {/* Opções (Botões) */}
                        {node.options && node.options.length > 0 && (
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">
                                    Botões de Resposta
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {node.options.map((option, idx) => (
                                        <div key={option.id} className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-xs font-mono text-gray-400">#{idx + 1}</span>
                                            </div>
                                            <Input
                                                value={option.label}
                                                onChange={(e) => handleOptionLabelChange(currentNodeId, idx, e.target.value)}
                                                className="pl-10 bg-white border-gray-200 focus:border-blue-500 h-11"
                                                placeholder="Texto do botão"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="bg-gray-50/50 p-6 flex justify-between border-t border-gray-100">
                        <Button
                            variant="outline"
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                            className="w-32"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Anterior
                        </Button>

                        <div className="text-sm text-gray-400">
                            Alterações são salvas ao clicar em "Salvar" no topo
                        </div>

                        <Button
                            onClick={handleNext}
                            disabled={currentStep === sortedNodeKeys.length - 1}
                            className="w-32 bg-blue-600 hover:bg-blue-700"
                        >
                            Próximo
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
