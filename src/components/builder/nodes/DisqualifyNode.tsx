import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { XCircle } from 'lucide-react';

const DisqualifyNode = ({ data, selected }: { data: any, selected: boolean }) => {
    return (
        <div className={`shadow-md rounded-md bg-white border-2 w-64 ${selected ? 'border-primary' : 'border-red-200'}`}>
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-400" />

            <div className="flex items-center bg-red-50 p-2 rounded-t-md border-b border-red-100">
                <XCircle className="w-4 h-4 text-red-600 mr-2" />
                <span className="font-semibold text-xs text-red-800">Descarte / Fim</span>
            </div>

            <div className="p-3 text-sm text-gray-600">
                <p>{data.content || "Fim do fluxo."}</p>
            </div>
        </div>
    );
};

export default memo(DisqualifyNode);
