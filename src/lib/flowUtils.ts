import dagre from 'dagre';
import { Node, Edge, MarkerType } from '@xyflow/react';
import { FlowNode } from '@/lib/api';

/**
 * Converte o formato do Backend (Objeto de Nós) para React Flow (Nodes e Edges)
 * Usa Dagre para alinhar horizontalmente
 */
export function backendToReactFlow(nodes: Record<string, FlowNode>): { nodes: Node[], edges: Edge[] } {
    const rfNodes: Node[] = [];
    const rfEdges: Edge[] = [];

    const nodeKeys = Object.keys(nodes);

    // Configura o DAGRE graph
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'LR', nodesep: 100, ranksep: 200 }); // LR = Left to Right
    g.setDefaultEdgeLabel(() => ({}));

    // 1. Cria nós e edges lógicos para o Dagre calcular posições
    nodeKeys.forEach(key => {
        const node = nodes[key];
        // Largura e Altura aproximadas dos cards
        const width = node.type === 'question' ? 300 : 260;
        const height = node.type === 'question' ? (150 + (node.options?.length || 0) * 40) : 150;

        g.setNode(key, { width, height });

        if (node.next_node) {
            g.setEdge(key, node.next_node);
        }
        if (node.options) {
            node.options.forEach(opt => {
                if (opt.next_node) {
                    g.setEdge(key, opt.next_node);
                }
            });
        }
    });

    // 2. Calcula o layout
    dagre.layout(g);

    // 3. Monta o array final de Nodes e Edges do React Flow
    nodeKeys.forEach(key => {
        const node = nodes[key];
        const position = g.node(key);

        rfNodes.push({
            id: key,
            type: node.type,
            position: {
                x: position.x - (g.node(key).width / 2),
                y: position.y - (g.node(key).height / 2)
            },
            data: {
                content: node.content,
                options: node.options,
                tags: node.tags,
                save_as: node.save_as,
                label: node.content
            }
        });

        if (node.next_node) {
            rfEdges.push({
                id: `${key}-${node.next_node}`,
                source: key,
                target: node.next_node,
                type: 'smoothstep',
                markerEnd: { type: MarkerType.ArrowClosed }
            });
        }
        if (node.options) {
            node.options.forEach(opt => {
                if (opt.next_node) {
                    rfEdges.push({
                        id: `${key}-${opt.id}-${opt.next_node}`,
                        source: key,
                        sourceHandle: opt.id,
                        target: opt.next_node,
                        type: 'smoothstep',
                        label: opt.label,
                        markerEnd: { type: MarkerType.ArrowClosed }
                    });
                }
            });
        }
    });

    return { nodes: rfNodes, edges: rfEdges };
}

/**
 * Converte React Flow (Nodes e Edges) para o formato do Backend
 */
export function reactFlowToBackend(nodes: Node[], edges: Edge[]): Record<string, FlowNode> {
    const backendNodes: Record<string, FlowNode> = {};

    nodes.forEach(node => {
        const flowNode: FlowNode = {
            type: node.type as any,
            content: node.data.content as string,
            // Opcionais
            options: node.data.options as any,
            save_as: node.data.save_as as string,
            tags: node.data.tags as string[]
        };

        // Encontrar conexões (edges) saindo deste nó
        const outboundEdges = edges.filter(e => e.source === node.id);

        // Se for Message ou Handover ou Disqualify sem opções, pega o target normal
        if (flowNode.type === 'message') {
            const nextEdge = outboundEdges.find(e => !e.sourceHandle); // Edge padrão
            if (nextEdge) {
                flowNode.next_node = nextEdge.target;
            }
        }

        // Se for Question, atualiza os next_node dentro das options
        if (flowNode.type === 'question' && flowNode.options) {
            flowNode.options = flowNode.options.map((opt: any) => {
                const edge = outboundEdges.find(e => e.sourceHandle === opt.id);
                return {
                    ...opt,
                    next_node: edge ? edge.target : undefined
                };
            });
        }

        // Input livre (Question com accept_free_text)
        if (flowNode.type === 'question') {
            const defaultEdge = outboundEdges.find(e => e.sourceHandle === 'default' || !e.sourceHandle);
            if (defaultEdge) {
                flowNode.next_node = defaultEdge.target;
            }
        }

        backendNodes[node.id] = flowNode;
    });

    return backendNodes;
}
