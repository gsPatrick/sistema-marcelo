'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { HelpCircle, Plus, Trash2 } from 'lucide-react';
import { useFlowStore, CustomNodeData, NodeOption } from '@/store/flowStore';

interface NodeComponentProps {
    id: string;
    data: CustomNodeData;
    selected?: boolean;
}

function QuestionNodeComponent({ id, data, selected }: NodeComponentProps) {
    const { updateNode, setSelectedNode } = useFlowStore();

    const options = data.options || [];

    const addOption = () => {
        const newOption: NodeOption = {
            id: `opt_${Date.now()}`,
            label: `Opção ${options.length + 1}`,
            value: `opcao_${options.length + 1}`
        };
        updateNode(id, { options: [...options, newOption] });
    };

    const removeOption = (index: number) => {
        const newOptions = options.filter((_, i) => i !== index);
        updateNode(id, { options: newOptions });
    };

    const updateOption = (index: number, field: keyof NodeOption, value: string) => {
        const newOptions = [...options];
        newOptions[index] = { ...newOptions[index], [field]: value };
        updateNode(id, { options: newOptions });
    };

    return (
        <div
            className={`min-w-[300px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 ${selected ? 'ring-2 ring-purple-500 shadow-md' : 'hover:shadow-md'
                }`}
            onClick={() => setSelectedNode({ id, data, position: { x: 0, y: 0 }, type: 'question' })}
        >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border-b border-purple-100">
                <HelpCircle className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                    Pergunta
                </span>
                <span className="ml-auto text-xs text-gray-400 font-mono">#{id.split('_').pop()}</span>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3 bg-white">
                {/* Question Text */}
                <textarea
                    value={data.content || ''}
                    onChange={(e) => updateNode(id, { content: e.target.value })}
                    placeholder="Digite a pergunta..."
                    className="w-full min-h-[60px] bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-800 placeholder:text-gray-400 resize-none focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
                />

                {/* Save As Input */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Salvar como:</span>
                    <input
                        type="text"
                        value={data.save_as || ''}
                        onChange={(e) => updateNode(id, { save_as: e.target.value })}
                        placeholder="nome_variavel"
                        className="flex-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30"
                    />
                </div>

                {/* Options */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">Opções de resposta:</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); addOption(); }}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-purple-600 hover:bg-purple-50 rounded transition-colors font-medium"
                        >
                            <Plus className="w-3 h-3" />
                            Adicionar
                        </button>
                    </div>

                    {options.map((option, index) => (
                        <div key={option.id} className="relative group">
                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 border border-gray-200 hover:border-purple-200 transition-colors">
                                <input
                                    type="text"
                                    value={option.label}
                                    onChange={(e) => updateOption(index, 'label', e.target.value)}
                                    placeholder="Texto do botão"
                                    className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none font-medium"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeOption(index); }}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>

                            {/* Option Handle */}
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={`option-${index}`}
                                className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white !right-[-6px]"
                                style={{ top: '50%' }}
                            />
                        </div>
                    ))}

                    {options.length === 0 && (
                        <div className="text-center py-3 text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                            Clique em &quot;Adicionar&quot; para criar opções
                        </div>
                    )}
                </div>
            </div>

            {/* Handles */}
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white"
            />
        </div>
    );
}

export const QuestionNode = memo(QuestionNodeComponent);
