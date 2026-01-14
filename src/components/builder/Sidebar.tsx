'use client';

import { DragEvent } from 'react';
import { MessageSquare, HelpCircle, UserCheck, XCircle } from 'lucide-react';
import { NodeType } from '@/store/flowStore';

interface BlockItem {
    type: NodeType;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

const blocks: BlockItem[] = [
    {
        type: 'message',
        label: 'Mensagem',
        description: 'Envia texto simples',
        icon: <MessageSquare className="w-5 h-5" />,
        color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400'
    },
    {
        type: 'question',
        label: 'Pergunta',
        description: 'Aguarda resposta com botões',
        icon: <HelpCircle className="w-5 h-5" />,
        color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400'
    },
    {
        type: 'handover',
        label: 'Transbordo',
        description: 'Transfere para humano',
        icon: <UserCheck className="w-5 h-5" />,
        color: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-400'
    },
    {
        type: 'disqualify',
        label: 'Descarte',
        description: 'Encerra o fluxo',
        icon: <XCircle className="w-5 h-5" />,
        color: 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400'
    }
];

export function BuilderSidebar() {
    const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: NodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="fixed left-64 top-16 bottom-0 w-72 glass-panel rounded-none border-l-0 border-t-0 border-b-0 p-4 z-40 overflow-y-auto">
            <div className="space-y-4">
                {/* Header */}
                <div>
                    <h2 className="text-sm font-semibold text-white">Blocos</h2>
                    <p className="text-xs text-white/50 mt-1">
                        Arraste para o canvas para criar nós
                    </p>
                </div>

                {/* Block List */}
                <div className="space-y-2">
                    {blocks.map((block) => (
                        <div
                            key={block.type}
                            draggable
                            onDragStart={(e) => onDragStart(e, block.type)}
                            className={`
                flex items-center gap-3 p-3 rounded-xl cursor-grab active:cursor-grabbing
                bg-gradient-to-r ${block.color} border
                hover:scale-[1.02] hover:shadow-lg
                transition-all duration-200
              `}
                        >
                            <div className="flex-shrink-0">
                                {block.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white">{block.label}</p>
                                <p className="text-xs text-white/50 truncate">{block.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tips */}
                <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                    <h3 className="text-xs font-semibold text-white/80 mb-2">💡 Dicas</h3>
                    <ul className="text-xs text-white/50 space-y-1">
                        <li>• Arraste blocos para o canvas</li>
                        <li>• Conecte arrastando das bolinhas</li>
                        <li>• Delete com Backspace</li>
                        <li>• Zoom com scroll do mouse</li>
                    </ul>
                </div>
            </div>
        </aside>
    );
}
