import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { UserCheck } from 'lucide-react';

const HandoverNode = ({ data, selected }: { data: any, selected: boolean }) => {
    return (
        <div className={`shadow-md rounded-md bg-white border-2 w-64 ${selected ? 'border-primary' : 'border-green-200'}`}>
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-400" />

            <div className="flex items-center bg-green-50 p-2 rounded-t-md border-b border-green-100">
                <UserCheck className="w-4 h-4 text-green-600 mr-2" />
                <span className="font-semibold text-xs text-green-800">Atendimento Humano</span>
            </div>

            <div className="p-3 text-sm text-gray-600">
                <p>{data.content || "Transferindo para atendente..."}</p>
                {data.tags && data.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {data.tags.map((tag: string) => (
                            <span key={tag} className="text-[10px] bg-green-100 text-green-700 px-1 rounded">{tag}</span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(HandoverNode);
