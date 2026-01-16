'use client';

import { useCallback, useRef, DragEvent, useEffect, useState } from 'react';
import dagre from 'dagre';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    ReactFlowProvider,
    Node,
    BackgroundVariant,
    Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { MessageNode, QuestionNode, HandoverNode, DisqualifyNode } from './nodes';
import Toolbar from './Toolbar';
import { useFlowStore, CustomNodeData, NodeType } from '@/store/flowStore';
import { getFlows, getFlow, saveFlow } from '@/lib/api';

// Define node types for React Flow
const nodeTypes = {
    message: MessageNode,
    question: QuestionNode,
    handover: HandoverNode,
    disqualify: DisqualifyNode,
};

let id = 0;
const getId = () => `node_${Date.now()}_${id++}`;

function FlowBuilderCanvas() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [isSaving, setIsSaving] = useState(false);

    const {
        nodes,
        edges,
        flowId,
        flowName,
        setNodes,
        setFlowId,
        setFlowName,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
        toBackendFormat,
        fromBackendFormat,
        setSelectedNode
    } = useFlowStore();

    // --- AUTO LAYOUT ---
    const onLayout = useCallback((direction = 'LR') => {
        const { nodes: currentNodes, edges: currentEdges, setNodes } = useFlowStore.getState();

        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));

        const isHorizontal = direction === 'LR';
        dagreGraph.setGraph({ rankdir: direction });

        currentNodes.forEach((node) => {
            dagreGraph.setNode(node.id, { width: 300, height: 150 });
        });

        currentEdges.forEach((edge) => {
            dagreGraph.setEdge(edge.source, edge.target);
        });

        dagre.layout(dagreGraph);

        const layoutedNodes = currentNodes.map((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);
            return {
                ...node,
                targetPosition: isHorizontal ? Position.Left : Position.Top,
                sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
                position: {
                    x: nodeWithPosition.x - 150,
                    y: nodeWithPosition.y - 75,
                },
            };
        });

        setNodes(layoutedNodes);
    }, [setNodes]);

    // Load flow on mount
    useEffect(() => {
        const loadFlow = async () => {
            try {
                const flows = await getFlows();
                const activeFlowMeta = flows.find(f => f.is_active) || flows[0];

                if (activeFlowMeta) {
                    const fullFlow = await getFlow(activeFlowMeta.id);
                    setFlowId(fullFlow.id);
                    setFlowName(fullFlow.name);

                    fromBackendFormat(fullFlow.nodes || {});

                    // Trigger layout shortly after loading
                    setTimeout(() => onLayout('LR'), 100);
                }
            } catch (error) {
                console.error('Erro ao carregar fluxo:', error);
            }
        };

        loadFlow();
    }, [setFlowId, setFlowName, fromBackendFormat, onLayout]);

    // Handle drag over (still needed for React Flow internal logic if we drag stuff?)
    const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // Save flow
    const handleSave = async () => {
        if (!flowId) return;

        setIsSaving(true);
        try {
            const nodesData = toBackendFormat();
            await saveFlow(flowId, { nodes: nodesData });
            console.log('Fluxo salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar fluxo:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Deselect on canvas click
    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, [setSelectedNode]);

    return (
        <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDragOver={onDragOver}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                fitView
                defaultEdgeOptions={{
                    type: 'smoothstep',
                    animated: true,
                    style: { stroke: '#9ca3af', strokeWidth: 2 }
                }}
                className="bg-gray-50"
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1}
                    color="#00000010"
                />
                <Controls
                    className="!bg-white !border-gray-200 !shadow-sm !text-gray-600"
                    showZoom={true}
                    showFitView={true}
                    showInteractive={false}
                />
                <MiniMap
                    nodeColor={(node) => {
                        switch (node.type) {
                            case 'message': return '#3b82f6';
                            case 'question': return '#7c3aed';
                            case 'handover': return '#10b981';
                            case 'disqualify': return '#ef4444';
                            default: return '#9ca3af';
                        }
                    }}
                    maskColor="rgba(255, 255, 255, 0.8)"
                    className="!bg-white !border !border-gray-200 !shadow-sm opacity-80 hover:opacity-100 transition-opacity"
                />
            </ReactFlow>

            <Toolbar onSave={handleSave} isSaving={isSaving} onLayout={() => onLayout('LR')} />

            {/* Flow Name Display */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur border border-gray-200 shadow-sm rounded-lg px-4 py-2 pointer-events-none">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Editando</span>
                <span className="block text-sm font-semibold text-gray-800">{flowName}</span>
            </div>
        </div>
    );
}

export function FlowBuilder() {
    return (
        <ReactFlowProvider>
            <div className="flex h-[calc(100vh-64px)] w-full">
                <FlowBuilderCanvas />
            </div>
        </ReactFlowProvider>
    );
}
