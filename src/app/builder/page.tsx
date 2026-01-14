import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FlowBuilder } from '@/components/builder';

export default function BuilderPage() {
    return (
        <div className="h-screen bg-gray-50 flex flex-col">
            {/* Minimal Header */}
            <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft size={18} />
                        Voltar ao Sistema
                    </Link>
                    <div className="h-4 w-[1px] bg-gray-300"></div>
                    <h1 className="text-lg font-semibold text-gray-800">Flow Builder</h1>
                </div>
            </header>

            {/* Fullscreen Canvas */}
            <div className="flex-1 overflow-hidden relative">
                <FlowBuilder />
            </div>
        </div>
    );
}
