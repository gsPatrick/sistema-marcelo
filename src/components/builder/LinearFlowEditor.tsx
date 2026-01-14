'use client';

import { useEffect, useState } from 'react';
import { useFlowStore } from '@/store/flowStore';
import { getFlows, getFlow, saveFlow } from '@/lib/api';
import { MessageSquare, HelpCircle, User, Ban, GripVertical, Settings2, Trash2 } from 'lucide-react';

// Icon mapper based on node type
const getNodeIcon = (type: string) => {
    switch (type) {
        case 'message': return <MessageSquare size={20} className="text-blue-400" />;
        case 'question': return <HelpCircle size={20} className="text-purple-400" />;
        case 'handover': return <User size={20} className="text-emerald-400" />;
        case 'disqualify': return <Ban size={20} className="text-red-400" />;
        default: return <Settings2 size={20} className="text-gray-400" />;
    }
};

const getNodeLabel = (type: string) => {
    switch (type) {
        case 'message': return 'Mensagem de Texto';
        case 'question': return 'Pergunta com Opções';
        case 'handover': return 'Transbordo para Humano';
        case 'disqualify': return 'Encerrar/Descartar';
        default: return 'Bloco Desconhecido';
    }
};

export function LinearFlowEditor() {
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Store
    const {
        nodes,
        flowId,
        flowName,
        setFlowId,
        setFlowName,
        fromBackendFormat,
        toBackendFormat,
        updateNode,
        deleteNode
    } = useFlowStore();

    // Load data
    useEffect(() => {
        const loadFlow = async () => {
            try {
                setIsLoading(true);
                const flows = await getFlows();
                const activeFlowMeta = flows.find(f => f.is_active) || flows[0];

                if (activeFlowMeta) {
                    const fullFlow = await getFlow(activeFlowMeta.id);
                    setFlowId(fullFlow.id);
                    setFlowName(fullFlow.name);
                    fromBackendFormat(fullFlow.nodes || {});
                }
            } catch (error) {
                console.error('Erro ao carregar fluxo:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadFlow();
    }, [setFlowId, setFlowName, fromBackendFormat]);

    // Save handler
    const handleSave = async () => {
        if (!flowId) return;
        setIsSaving(true);
        try {
            const nodesData = toBackendFormat();
            await saveFlow(flowId, { nodes: nodesData });
            // TODO: Show toast success
        } catch (error) {
            console.error('Erro ao salvar:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full text-white/50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                Carregando fluxo...
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#0a0a0f] text-white p-6 overflow-y-auto">

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Editor de Fluxo</h1>
                    <p className="text-white/60 text-sm">Edite as mensagens do seu bot sequencialmente.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>

            {/* List of Nodes */}
            <div className="max-w-3xl mx-auto w-full space-y-4">
                {nodes.length === 0 ? (
                    <div className="text-center py-12 glass-panel rounded-xl">
                        <p className="text-white/40">Nenhuma mensagem neste fluxo.</p>
                    </div>
                ) : (
                    nodes.map((node, index) => (
                        <div
                            key={node.id}
                            className="glass-panel p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all group"
                        >
                            <div className="flex items-start gap-4">
                                {/* Drag Handle (Visual only for now) */}
                                <div className="mt-2 text-white/20 cursor-grab active:cursor-grabbing">
                                    <GripVertical size={20} />
                                </div>

                                {/* Icon */}
                                <div className="mt-1 p-2 bg-white/5 rounded-lg border border-white/5">
                                    {getNodeIcon(node.data.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium text-white">{getNodeLabel(node.data.type)}</h3>
                                            <p className="text-xs text-white/40 font-mono mt-0.5">ID: {node.id}</p>
                                        </div>

                                        <button
                                            onClick={() => deleteNode(node.id)}
                                            className="text-white/20 hover:text-red-400 p-2 rounded hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"
                                            title="Excluir bloco"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    {/* Edit Content Area */}
                                    <div className="bg-[#050508] rounded-lg p-3 border border-white/5">

                                        {/* TEXT CONTENT */}
                                        <label className="block text-xs text-white/40 mb-1 uppercase tracking-wide">Mensagem</label>
                                        <textarea
                                            value={node.data.content as string}
                                            onChange={(e) => updateNode(node.id, { content: e.target.value })}
                                            className="w-full bg-transparent text-sm text-white/90 placeholder-white/20 resize-none outline-none min-h-[60px]"
                                            placeholder="Digite a mensagem que o bot enviará..."
                                        />

                                        {/* OPTIONS (If Question) */}
                                        {node.data.type === 'question' && (
                                            <div className="mt-3 pt-3 border-t border-white/5">
                                                <label className="block text-xs text-white/40 mb-2 uppercase tracking-wide">Opções de Resposta</label>
                                                <div className="space-y-2">
                                                    {(node.data.options || []).map((opt: any, optIdx: number) => (
                                                        <div key={opt.id} className="flex gap-2">
                                                            <input
                                                                value={opt.label}
                                                                // Simple read-only for now, full edit logic needed
                                                                readOnly
                                                                className="flex-1 bg-white/5 rounded px-3 py-2 text-sm text-white/80 border border-white/5"
                                                            />
                                                        </div>
                                                    ))}
                                                    <button className="text-xs text-blue-400 hover:text-blue-300 font-medium ml-1">
                                                        + Gerenciar Opções
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                    </div>

                                    {/* Next Step Logic (Simplified) */}
                                    {node.data.next_node && (
                                        <div className="flex items-center gap-2 text-xs text-white/40">
                                            <span>Próximo passo:</span>
                                            <span className="bg-white/10 px-2 py-0.5 rounded text-white/70 font-mono">
                                                {node.data.next_node}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Fab to add node */}
            {/* TODO: Add button logic */}
        </div>
    );
}
