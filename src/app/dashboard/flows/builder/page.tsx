'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReactFlow, ReactFlowProvider, addEdge, useNodesState, useEdgesState, Controls, Background, Connection, Edge, Node, MarkerType, useReactFlow, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';

import { Save, ArrowLeft, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getFlow, createFlow, saveFlow, activateFlow } from '@/lib/api';
import { backendToReactFlow, reactFlowToBackend } from '@/lib/flowUtils';

import Toolbar from '@/components/builder/Toolbar';
import PropertiesPanel from '@/components/builder/PropertiesPanel';
import { nodeTypes } from '@/components/builder/nodes';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

function FlowBuilder() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const flowId = searchParams.get('id');
    const reactFlowInstance = useReactFlow();

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    // Metadata do fluxo
    const [flowName, setFlowName] = useState('Novo Fluxo');
    const [flowTrigger, setFlowTrigger] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (flowId) {
            loadFlow(flowId);
        }
    }, [flowId]);

    const loadFlow = async (id: string) => {
        setLoading(true);
        try {
            const flow = await getFlow(id);
            setFlowName(flow.name);
            setFlowTrigger(flow.trigger_keyword || '');

            if (flow.nodes) {
                const { nodes: rfNodes, edges: rfEdges } = backendToReactFlow(flow.nodes);
                setNodes(rfNodes);
                setEdges(rfEdges);

                // Ajustar viewport após carregar
                setTimeout(() => reactFlowInstance.fitView({ padding: 0.2 }), 100);
            }
        } catch (error) {
            console.error('Erro ao carregar fluxo:', error);
            alert('Erro ao carregar fluxo');
        } finally {
            setLoading(false);
        }
    };

    const onConnect = useCallback((params: Connection) => {
        setEdges((eds) => addEdge({ ...params, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } }, eds));
    }, [setEdges]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNodeId = `${type}_${Math.random().toString(36).substr(2, 9)}`;

            const newNode: Node = {
                id: newNodeId,
                type,
                position,
                data: { label: `${type} node`, content: '' },
            };

            setNodes((nds) => nds.concat(newNode));
            setSelectedNodeId(newNodeId);
        },
        [reactFlowInstance, setNodes],
    );

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedNodeId(node.id);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNodeId(null);
    }, []);

    const handleNodeUpdate = (id: string, data: any) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    // Se mudar o label nas options da pergunta, precisamos atualizar as arestas também (visual)
                    // Mas React Flow cuida dos handles se o ID mudar.
                    return { ...node, data: { ...data } };
                }
                return node;
            })
        );
    };

    const handleSave = async () => {
        if (!flowName) return alert('Nome do fluxo é obrigatório');

        setIsSaving(true);
        try {
            const formattedNodes = reactFlowToBackend(nodes, edges);

            const payload = {
                name: flowName,
                trigger_keyword: flowTrigger,
                nodes: formattedNodes
            };

            if (flowId) {
                await saveFlow(flowId, payload);
                alert('Fluxo salvo com sucesso!');
            } else {
                const newFlow = await createFlow(payload);
                router.replace(`/dashboard/flows/builder?id=${newFlow.id}`);
                alert('Fluxo criado com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao salvar fluxo:', error);
            alert('Erro ao salvar fluxo');
        } finally {
            setIsSaving(false);
        }
    };

    const handleActivate = async () => {
        if (!flowId) return alert('Salve o fluxo antes de ativar');
        if (!confirm('Deseja ativar este fluxo?')) return;

        try {
            await activateFlow(flowId);
            alert('Fluxo ativado com sucesso!');
        } catch (error) {
            alert('Erro ao ativar fluxo');
        }
    };

    const handleLayout = useCallback(() => {
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));
        dagreGraph.setGraph({ rankdir: 'LR' });

        nodes.forEach((node) => {
            dagreGraph.setNode(node.id, { width: 300, height: 150 });
        });

        edges.forEach((edge) => {
            dagreGraph.setEdge(edge.source, edge.target);
        });

        dagre.layout(dagreGraph);

        const layoutedNodes = nodes.map((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);
            return {
                ...node,
                targetPosition: Position.Left,
                sourcePosition: Position.Right,
                position: {
                    x: nodeWithPosition.x - 150,
                    y: nodeWithPosition.y - 75,
                },
            };
        });

        setNodes(layoutedNodes);
        setTimeout(() => {
            reactFlowInstance.fitView({ padding: 0.2 });
        }, 50);
    }, [nodes, edges, setNodes, reactFlowInstance]);

    // Encontra o nó selecionado
    const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

    if (loading) return <div className="p-10 text-center">Carregando editor...</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)]">
            {/* Header */}
            <div className="h-16 border-b bg-white px-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex flex-col">
                        <input
                            value={flowName}
                            onChange={(e) => setFlowName(e.target.value)}
                            className="font-bold text-lg focus:outline-none bg-transparent"
                            placeholder="Nome do Fluxo"
                        />
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Gatilho:</span>
                            <input
                                value={flowTrigger}
                                onChange={(e) => setFlowTrigger(e.target.value)}
                                className="text-xs text-gray-600 focus:outline-none bg-transparent border-b border-dashed border-gray-300 w-32"
                                placeholder="ex: oi, suporte"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {flowId && (
                        <Button variant="outline" onClick={handleActivate} className="gap-2">
                            <Play className="w-4 h-4 text-green-600" />
                            Ativar
                        </Button>
                    )}
                    <Button onClick={handleSave} disabled={isSaving} className="gap-2 bg-blue-600 hover:bg-blue-700">
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Salvando...' : 'Salvar'}
                    </Button>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex flex-1 overflow-hidden">
                <Toolbar
                    onSave={handleSave}
                    isSaving={isSaving}
                    onLayout={handleLayout}
                />

                <div className="flex-1 h-full bg-gray-50 relative" onDrop={onDrop} onDragOver={onDragOver}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        onPaneClick={onPaneClick}
                        nodeTypes={nodeTypes}
                        fitView
                    >
                        <Background />
                        <Controls />
                    </ReactFlow>
                </div>

                <PropertiesPanel
                    node={selectedNode}
                    onChange={handleNodeUpdate}
                />
            </div>
        </div>
    );
}

export default function BuilderPage() {
    return (
        <ReactFlowProvider>
            <FlowBuilder />
        </ReactFlowProvider>
    );
}
