import { MessageSquareText, HelpCircle, UserCheck, XCircle } from 'lucide-react';

export default function Toolbar() {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col gap-4">
            <h2 className="font-bold text-lg text-gray-700">Ferramentas</h2>
            <p className="text-xs text-gray-500 mb-2">Arraste para o palco</p>

            <div className="grid gap-3">
                <div
                    className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded cursor-grab hover:bg-blue-100"
                    draggable
                    onDragStart={(event) => onDragStart(event, 'message')}
                >
                    <MessageSquareText className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-900">Mensagem</span>
                </div>

                <div
                    className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded cursor-grab hover:bg-purple-100"
                    draggable
                    onDragStart={(event) => onDragStart(event, 'question')}
                >
                    <HelpCircle className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-purple-900">Pergunta</span>
                </div>

                <div
                    className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded cursor-grab hover:bg-green-100"
                    draggable
                    onDragStart={(event) => onDragStart(event, 'handover')}
                >
                    <UserCheck className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Humano</span>
                </div>

                <div
                    className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded cursor-grab hover:bg-red-100"
                    draggable
                    onDragStart={(event) => onDragStart(event, 'disqualify')}
                >
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-900">Fim / Descarte</span>
                </div>
            </div>
        </aside>
    );
}
