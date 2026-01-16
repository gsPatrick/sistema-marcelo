import { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Trash2, Plus } from 'lucide-react';

interface PropertiesPanelProps {
    node: Node | null;
    onChange: (id: string, data: any) => void;
}

export default function PropertiesPanel({ node, onChange }: PropertiesPanelProps) {
    const [localData, setLocalData] = useState<any>(null);

    useEffect(() => {
        if (node) {
            setLocalData({ ...node.data });
        } else {
            setLocalData(null);
        }
    }, [node]);

    if (!node || !localData) {
        return (
            <aside className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
                <div className="text-center text-gray-500 mt-10">
                    <p>Selecione um nó para editar</p>
                </div>
            </aside>
        );
    }

    const handleChange = (field: string, value: any) => {
        const newData = { ...localData, [field]: value };
        setLocalData(newData);
        onChange(node.id, newData);
    };

    const handleOptionChange = (index: number, field: string, value: any) => {
        const newOptions = [...(localData.options || [])];
        newOptions[index] = { ...newOptions[index], [field]: value };
        handleChange('options', newOptions);
    };

    const addOption = () => {
        const newOptions = [
            ...(localData.options || []),
            { id: Math.random().toString(36).substr(2, 9), label: 'Nova Opção' }
        ];
        handleChange('options', newOptions);
    };

    const removeOption = (index: number) => {
        const newOptions = [...(localData.options || [])];
        newOptions.splice(index, 1);
        handleChange('options', newOptions);
    };

    return (
        <aside className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto flex flex-col gap-4">
            <h2 className="font-bold text-lg text-gray-700 border-b pb-2">Propriedades</h2>

            <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">ID do Nó</label>
                <Input value={node.id} disabled className="bg-gray-100 font-mono text-xs" />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Conteúdo (Texto)</label>
                <textarea
                    className="w-full min-h-[100px] p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={localData.content || ''}
                    onChange={(e) => handleChange('content', e.target.value)}
                    placeholder="Digite a mensagem..."
                />
            </div>

            {node.type === 'question' && (
                <>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Salvar resposta em (variável)</label>
                        <Input
                            value={localData.save_as || ''}
                            onChange={(e) => handleChange('save_as', e.target.value)}
                            placeholder="Ex: nome, email, interesse"
                        />
                    </div>

                    <div className="space-y-2 pt-2 border-t text-sm">
                        <div className="flex justify-between items-center">
                            <label className="font-semibold text-gray-700">Opções</label>
                            <Button size="sm" variant="ghost" onClick={addOption} className="h-6 w-6 p-0">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {localData.options?.map((opt: any, idx: number) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <Input
                                        value={opt.label}
                                        onChange={(e) => handleOptionChange(idx, 'label', e.target.value)}
                                        placeholder="Texto do botão"
                                        className="h-8 text-sm"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeOption(idx)}
                                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            {(!localData.options || localData.options.length === 0) && (
                                <p className="text-xs text-gray-400 italic">Nenhuma opção adicionada.</p>
                            )}
                        </div>

                        <div className="pt-2">
                            <label className="flex items-center gap-2 text-xs text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={localData.accept_free_text || false}
                                    onChange={(e) => handleChange('accept_free_text', e.target.checked)}
                                />
                                Aceitar resposta livre (texto)
                            </label>
                        </div>
                    </div>
                </>
            )}

            {node.type === 'handover' && (
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">Tags (separadas por vírgula)</label>
                    <Input
                        value={localData.tags?.join(', ') || ''}
                        onChange={(e) => handleChange('tags', e.target.value.split(',').map((t: string) => t.trim()))}
                        placeholder="Ex: URGENTE, FINANCEIRO"
                    />
                </div>
            )}
        </aside>
    );
}
