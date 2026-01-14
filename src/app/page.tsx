'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Bot, Sparkles, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          {/* Header */}
          <nav className="flex items-center justify-between mb-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Bot Médico</span>
            </div>

            <Link href="/dashboard">
              <Button variant="secondary">
                Entrar no Sistema
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-400">Triagem Inteligente com IA</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="text-white">Automatize sua</span>
                <br />
                <span className="text-blue-500">Triagem Médica</span>
              </h1>

              <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
                Qualifique pacientes automaticamente via WhatsApp.
                Filtre por região, tipo de problema, interesse em tratamento e modalidade de atendimento.
              </p>

              <div className="flex items-center justify-center gap-4">
                <Link href="/dashboard">
                  <Button size="lg" className="px-8">
                    Acessar Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/builder">
                  <Button variant="secondary" size="lg">
                    Editar Fluxo
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-32 grid md:grid-cols-3 gap-6"
          >
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Triagem Automática"
              description="Robô filtra pacientes 24/7, qualificando apenas os que realmente se encaixam no perfil."
              color="bg-blue-500/10 text-blue-500"
            />
            <FeatureCard
              icon={<Bot className="w-6 h-6" />}
              title="Flow Builder Visual"
              description="Crie e edite fluxos de conversa visualmente, sem precisar programar uma linha de código."
              color="bg-white/5 text-white"
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="CRM Integrado"
              description="Dashboard completo para gerenciar atendimentos, visualizar histórico e acompanhar métricas."
              color="bg-green-500/10 text-green-500"
            />
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-600">
            © 2024 Bot Médico. Desenvolvido para clínicas ortopédicas.
          </p>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors group">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
