import { create } from 'zustand';
import {
    Node,
    Edge,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    Connection
} from '@xyflow/react';

export type NodeType = 'message' | 'question' | 'handover' | 'disqualify';

export interface NodeOption {
    id: string;
    label: string;
    value?: string;
    next_node?: string;
    save_as?: string;
}

export interface CustomNodeData {
    type: NodeType;
    content: string;
    options?: NodeOption[];
    next_node?: string;
    save_as?: string;
    tags?: string[];
    title?: string;
    [key: string]: unknown;
}

interface FlowState {
    // Flow metadata
    flowId: string | null;
    flowName: string;
    isActive: boolean;

    // React Flow state
    nodes: Node<CustomNodeData>[];
    edges: Edge[];
    selectedNode: Node<CustomNodeData> | null;

    // Actions
    setFlowId: (id: string | null) => void;
    setFlowName: (name: string) => void;
    setIsActive: (active: boolean) => void;
    setNodes: (nodes: Node<CustomNodeData>[]) => void;
    setEdges: (edges: Edge[]) => void;
    setSelectedNode: (node: Node<CustomNodeData> | null) => void;

    // React Flow callbacks
    onNodesChange: OnNodesChange<Node<CustomNodeData>>;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;

    // Node operations
    addNode: (node: Node<CustomNodeData>) => void;
    updateNode: (id: string, data: Partial<CustomNodeData>) => void;
    deleteNode: (id: string) => void;

    // Serialization
    toBackendFormat: () => Record<string, object>;
    fromBackendFormat: (nodes: Record<string, object>) => void;

    // Reset
    reset: () => void;
}

export const useFlowStore = create<FlowState>((set, get) => ({
    // Initial state
    flowId: null,
    flowName: 'Novo Fluxo',
    isActive: false,
    nodes: [],
    edges: [],
    selectedNode: null,

    // Setters
    setFlowId: (id) => set({ flowId: id }),
    setFlowName: (name) => set({ flowName: name }),
    setIsActive: (active) => set({ isActive: active }),
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),
    setSelectedNode: (node) => set({ selectedNode: node }),

    // React Flow callbacks
    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes)
        });
    },

    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges)
        });
    },

    onConnect: (connection: Connection) => {
        // Update the source node's next_node or option.next_node based on handle
        const { nodes } = get();
        const sourceNode = nodes.find(n => n.id === connection.source);

        if (sourceNode && connection.target) {
            const sourceHandle = connection.sourceHandle;

            // If it's an option handle (format: option-{index})
            if (sourceHandle?.startsWith('option-')) {
                const optionIndex = parseInt(sourceHandle.replace('option-', ''));
                const updatedOptions = [...(sourceNode.data.options || [])];
                if (updatedOptions[optionIndex]) {
                    updatedOptions[optionIndex] = {
                        ...updatedOptions[optionIndex],
                        next_node: connection.target
                    };
                    get().updateNode(sourceNode.id, { options: updatedOptions });
                }
            } else {
                // Regular next_node connection
                get().updateNode(sourceNode.id, { next_node: connection.target });
            }
        }

        set({
            edges: addEdge({
                ...connection,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#00d4ff', strokeWidth: 2 }
            }, get().edges)
        });
    },

    // Node operations
    addNode: (node) => {
        set({ nodes: [...get().nodes, node] });
    },

    updateNode: (id, data) => {
        set({
            nodes: get().nodes.map(node =>
                node.id === id
                    ? { ...node, data: { ...node.data, ...data } }
                    : node
            )
        });
    },

    deleteNode: (id) => {
        set({
            nodes: get().nodes.filter(node => node.id !== id),
            edges: get().edges.filter(edge => edge.source !== id && edge.target !== id),
            selectedNode: get().selectedNode?.id === id ? null : get().selectedNode
        });
    },

    // Convert React Flow format to Backend format (preserving position + data)
    toBackendFormat: () => {
        const { nodes, edges } = get();
        const result: Record<string, object> = {};

        nodes.forEach(node => {
            result[node.id] = {
                type: node.data.type,
                content: node.data.content,
                options: node.data.options,
                next_node: node.data.next_node,
                save_as: node.data.save_as,
                tags: node.data.tags,
                title: node.data.title,
                // Preserve visual position for the builder
                _position: node.position,
                _edges: edges.filter(e => e.source === node.id).map(e => ({
                    target: e.target,
                    sourceHandle: e.sourceHandle
                }))
            };
        });

        return result;
    },

    // Convert Backend format to React Flow format
    fromBackendFormat: (backendNodes) => {
        const nodes: Node<CustomNodeData>[] = [];
        const edges: Edge[] = [];

        let yOffset = 0;
        const nodeSpacing = 200;

        const entries = Object.entries(backendNodes) as [string, Record<string, unknown>][];
        entries.forEach(([id, nodeData]) => {
            // Use saved position or calculate new one
            const position = (nodeData._position as { x: number; y: number }) || {
                x: 250,
                y: yOffset
            };
            yOffset += nodeSpacing;

            nodes.push({
                id,
                type: nodeData.type as string,
                position,
                data: {
                    type: nodeData.type as NodeType,
                    content: (nodeData.content as string) || '',
                    options: nodeData.options as NodeOption[],
                    next_node: nodeData.next_node as string,
                    save_as: nodeData.save_as as string,
                    tags: nodeData.tags as string[],
                    title: nodeData.title as string
                }
            });

            // Create edges from next_node
            if (nodeData.next_node) {
                edges.push({
                    id: `${id}-${nodeData.next_node}`,
                    source: id,
                    target: nodeData.next_node as string,
                    type: 'smoothstep',
                    animated: true,
                    style: { stroke: '#00d4ff', strokeWidth: 2 }
                });
            }

            // Create edges from options
            const options = nodeData.options as NodeOption[];
            if (options) {
                options.forEach((option, index) => {
                    if (option.next_node) {
                        edges.push({
                            id: `${id}-option-${index}-${option.next_node}`,
                            source: id,
                            sourceHandle: `option-${index}`,
                            target: option.next_node,
                            type: 'smoothstep',
                            animated: true,
                            style: { stroke: '#00d4ff', strokeWidth: 2 }
                        });
                    }
                });
            }
        });

        set({ nodes, edges });
    },

    reset: () => {
        set({
            flowId: null,
            flowName: 'Novo Fluxo',
            isActive: false,
            nodes: [],
            edges: [],
            selectedNode: null
        });
    }
}));
