import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Flow Builder | Bot Médico',
    description: 'Editor visual de fluxos de conversa',
};

export default function BuilderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
