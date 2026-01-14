'use client';

import { Save, Undo, Redo, ZoomIn, ZoomOut, Maximize2, Trash2, MessageSquare, HelpCircle, User, Ban, Layout } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { Button } from '@/components/ui';
import { useFlowStore, NodeType, CustomNodeData } from '@/store/flowStore';

interface ToolbarProps {
    onSave: () => void;
    isSaving: boolean;
    onLayout: () => void;
}

export function Toolbar({ onSave, isSaving, onLayout }: ToolbarProps) {
    const { zoomIn, zoomOut, fitView } = useReactFlow();
    const { selectedNode, deleteNode, addNode } = useFlowStore();

    const handleDelete = () => {
        if (selectedNode) {
            deleteNode(selectedNode.id);
        }
    };

    const handleAddNode = (type: NodeType) => {
        let id = Date.now().toString();
        // Just center it roughly or randomize
        const position = { x: Math.random() * 200, y: Math.random() * 200 };

        const newNode: any = {
            id: `node_${id}`,
            type,
            position,
            data: {
                type,
                content: '',
                options: type === 'question' ? [] : undefined,
                tags: type === 'handover' ? [] : undefined,
            },
        };
        addNode(newNode);
        // Maybe trigger layout after?
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3 items-center">

            {/* Add Node Bar */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-full p-1 flex items-center gap-1">
                <button onClick={() => handleAddNode('message')} className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors" title="Adicionar Mensagem">
                    <MessageSquare size={18} />
                    <span className="text-sm font-medium">Mensagem</span>
                </button>
                <button onClick={() => handleAddNode('question')} className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-purple-50 text-gray-700 hover:text-purple-600 transition-colors" title="Adicionar Pergunta">
                    <HelpCircle size={18} />
                    <span className="text-sm font-medium">Pergunta</span>
                </button>
                <button onClick={() => handleAddNode('handover')} className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-emerald-50 text-gray-700 hover:text-emerald-600 transition-colors" title="Adicionar Transbordo">
                    <User size={18} />
                    <span className="text-sm font-medium">Transbordo</span>
                </button>
                <button onClick={() => handleAddNode('disqualify')} className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors" title="Adicionar Descarte">
                    <Ban size={18} />
                    <span className="text-sm font-medium">Descarte</span>
                </button>

                <div className="w-px h-6 bg-gray-200 mx-1" />

                <button onClick={onLayout} className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors" title="Organizar Horizontalmente">
                    <Layout size={18} />
                    <span className="text-sm font-medium">Auto-Layout</span>
                </button>
            </div>


            <div className="flex items-center gap-2">
                <div className="bg-white border border-gray-200 shadow-sm p-2 rounded-xl flex items-center gap-1">
                    {/* Zoom Controls */}
                    <button onClick={() => zoomOut()} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <button onClick={() => zoomIn()} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <button onClick={() => fitView({ padding: 0.2 })} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                        <Maximize2 className="w-4 h-4" />
                    </button>

                    <div className="w-px h-6 bg-gray-200 mx-1" />

                    {/* Delete */}
                    <button
                        onClick={handleDelete}
                        disabled={!selectedNode}
                        className={`p-2 rounded-lg transition-colors ${selectedNode
                            ? 'text-red-500 hover:bg-red-50'
                            : 'text-gray-300 cursor-not-allowed'
                            }`}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Save Button */}
                <Button
                    onClick={onSave}
                    isLoading={isSaving}
                    className="px-6 h-[46px] rounded-xl shadow-sm bg-blue-600 hover:bg-blue-700"
                >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                </Button>
            </div>
        </div>
    );
}
