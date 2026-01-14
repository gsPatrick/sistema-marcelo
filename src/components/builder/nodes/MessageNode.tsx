'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MessageSquare } from 'lucide-react';
import { useFlowStore, CustomNodeData } from '@/store/flowStore';

interface NodeComponentProps {
    id: string;
    data: CustomNodeData;
    selected?: boolean;
}

function MessageNodeComponent({ id, data, selected }: NodeComponentProps) {
    const { updateNode, setSelectedNode } = useFlowStore();

    return (
        <div
            className={`min-w-[280px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 ${selected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-md'
                }`}
            onClick={() => setSelectedNode({ id, data, position: { x: 0, y: 0 }, type: 'message' })}
        >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-b border-blue-100">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                    Mensagem
                </span>
                <span className="ml-auto text-xs text-gray-400 font-mono">#{id.split('_').pop()}</span>
            </div>

            {/* Content */}
            <div className="p-4 bg-white">
                <textarea
                    value={data.content || ''}
                    onChange={(e) => updateNode(id, { content: e.target.value })}
                    placeholder="Digite a mensagem..."
                    className="w-full min-h-[80px] bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-800 placeholder:text-gray-400 resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
            </div>

            {/* Handles */}
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
            />
        </div>
    );
}

export const MessageNode = memo(MessageNodeComponent);
