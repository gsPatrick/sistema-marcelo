import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { HelpCircle } from 'lucide-react';

const QuestionNode = ({ data, selected }: { data: any, selected: boolean }) => {
    return (
        <div className={`shadow-md rounded-md bg-white border-2 w-72 ${selected ? 'border-primary' : 'border-gray-200'}`}>
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-400" />

            <div className="flex items-center bg-purple-50 p-2 rounded-t-md border-b border-gray-100">
                <HelpCircle className="w-4 h-4 text-purple-500 mr-2" />
                <span className="font-semibold text-xs text-gray-700">Pergunta</span>
            </div>

            <div className="p-3 text-sm text-gray-600 border-b border-gray-100">
                {data.content ? (
                    <p className="line-clamp-3 whitespace-pre-wrap">{data.content}</p>
                ) : (
                    <p className="italic text-gray-400">Sem texto...</p>
                )}
            </div>

            <div className="bg-gray-50 p-2 space-y-2">
                {data.options && data.options.length > 0 ? (
                    data.options.map((option: any, index: number) => (
                        <div key={option.id || index} className="relative flex items-center justify-end">
                            <span className="text-xs text-gray-600 mr-3 truncate max-w-[180px]">{option.label}</span>
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={option.id}
                                className="w-3 h-3 bg-purple-500"
                                style={{ top: '50%', right: '-9px' }}
                            />
                        </div>
                    ))
                ) : (
                    <div className="text-xs text-gray-400 text-center italic">Adicione opções para criar saídas</div>
                )}
            </div>
            {/* Handle for free text if applicable, though usually questions branch by options */}
            {data.accept_free_text && (
                <div className="relative flex items-center justify-end p-2 border-t border-gray-200">
                    <span className="text-xs text-gray-500 mr-3">Qualquer Resposta (Texto)</span>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="default"
                        className="w-3 h-3 bg-gray-400"
                    />
                </div>
            )}
        </div>
    );
};

export default memo(QuestionNode);
