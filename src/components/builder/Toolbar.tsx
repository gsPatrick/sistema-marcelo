import { MessageSquareText, HelpCircle, UserCheck, XCircle, Save, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';

interface ToolbarProps {
    onSave: () => void;
    isSaving: boolean;
    onLayout: () => void;
}

export default function Toolbar({ onSave, isSaving, onLayout }: ToolbarProps) {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2 mb-4">
                <Button
                    onClick={onSave}
                    disabled={isSaving}
                    className="w-full justify-center"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Salvar Fluxo
                        </>
                    )}
                </Button>
                <Button
                    variant="outline"
                    onClick={onLayout}
                    className="w-full justify-center"
                >
                    <LayoutTemplate className="w-4 h-4 mr-2" />
                    Organizar
                </Button>
            </div>

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
