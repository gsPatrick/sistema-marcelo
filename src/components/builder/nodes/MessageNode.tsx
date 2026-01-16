import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MessageSquareText } from 'lucide-react';

const MessageNode = ({ data, selected }: { data: any, selected: boolean }) => {
    return (
        <div className={`shadow-md rounded-md bg-white border-2 w-64 ${selected ? 'border-primary' : 'border-gray-200'}`}>
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-400" />

            <div className="flex items-center bg-blue-50 p-2 rounded-t-md border-b border-gray-100">
                <MessageSquareText className="w-4 h-4 text-blue-500 mr-2" />
                <span className="font-semibold text-xs text-gray-700">Mensagem</span>
            </div>

            <div className="p-3 text-sm text-gray-600">
                {data.content ? (
                    <p className="line-clamp-3 whitespace-pre-wrap">{data.content}</p>
                ) : (
                    <p className="italic text-gray-400">Sem conteúdo...</p>
                )}
            </div>

            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />
        </div>
    );
};

export default memo(MessageNode);
