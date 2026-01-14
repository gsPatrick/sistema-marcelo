'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { XCircle } from 'lucide-react';
import { useFlowStore, CustomNodeData } from '@/store/flowStore';

interface NodeComponentProps {
    id: string;
    data: CustomNodeData;
    selected?: boolean;
}

function DisqualifyNodeComponent({ id, data, selected }: NodeComponentProps) {
    const { updateNode, setSelectedNode } = useFlowStore();

    return (
        <div
            className={`min-w-[280px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 ${selected ? 'ring-2 ring-red-500 shadow-md' : 'hover:shadow-md'
                }`}
            onClick={() => setSelectedNode({ id, data, position: { x: 0, y: 0 }, type: 'disqualify' })}
        >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border-b border-red-100">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                    Descarte
                </span>
                <span className="ml-auto text-xs text-gray-400 font-mono">#{id.split('_').pop()}</span>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3 bg-white">
                <textarea
                    value={data.content || ''}
                    onChange={(e) => updateNode(id, { content: e.target.value })}
                    placeholder="Mensagem de despedida..."
                    className="w-full min-h-[60px] bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-800 placeholder:text-gray-400 resize-none focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-all"
                />

                {/* Info */}
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-100">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-red-700">
                        Encerra o fluxo e marca como descartado
                    </span>
                </div>
            </div>

            {/* Handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-red-500 !border-2 !border-white"
            />
        </div>
    );
}

export const DisqualifyNode = memo(DisqualifyNodeComponent);
