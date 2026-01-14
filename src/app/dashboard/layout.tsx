import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard | Bot Médico',
    description: 'CRM de atendimento e triagem médica',
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
