'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { UserCheck, Plus, X } from 'lucide-react';
import { useFlowStore, CustomNodeData } from '@/store/flowStore';

interface NodeComponentProps {
    id: string;
    data: CustomNodeData;
    selected?: boolean;
}

function HandoverNodeComponent({ id, data, selected }: NodeComponentProps) {
    const { updateNode, setSelectedNode } = useFlowStore();

    const tags = data.tags || [];

    const addTag = () => {
        const tag = prompt('Nome da tag:');
        if (tag && !tags.includes(tag)) {
            updateNode(id, { tags: [...tags, tag.toUpperCase()] });
        }
    };

    const removeTag = (tagToRemove: string) => {
        updateNode(id, { tags: tags.filter(t => t !== tagToRemove) });
    };

    return (
        <div
            className={`min-w-[280px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 ${selected ? 'ring-2 ring-emerald-500 shadow-md' : 'hover:shadow-md'
                }`}
            onClick={() => setSelectedNode({ id, data, position: { x: 0, y: 0 }, type: 'handover' })}
        >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border-b border-emerald-100">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                    Transbordo
                </span>
                <span className="ml-auto text-xs text-gray-400 font-mono">#{id.split('_').pop()}</span>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3 bg-white">
                <textarea
                    value={data.content || ''}
                    onChange={(e) => updateNode(id, { content: e.target.value })}
                    placeholder="Mensagem de transferência..."
                    className="w-full min-h-[60px] bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-800 placeholder:text-gray-400 resize-none focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                />

                {/* Tags */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Tags do contato:</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); addTag(); }}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50 rounded transition-colors font-medium"
                        >
                            <Plus className="w-3 h-3" />
                            Adicionar
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-1">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full border border-emerald-100 font-medium"
                            >
                                {tag}
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                                    className="hover:text-red-500"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                        {tags.length === 0 && (
                            <span className="text-xs text-gray-400 italic">Nenhuma tag</span>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs text-emerald-700">
                        Transfere para atendimento humano
                    </span>
                </div>
            </div>

            {/* Handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white"
            />
        </div>
    );
}

export const HandoverNode = memo(HandoverNodeComponent);
