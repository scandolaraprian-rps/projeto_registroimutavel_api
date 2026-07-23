/**
 * @file App.tsx
 * @description Componente Principal da aplicação "Registro Imutável de Eventos".
 * Integra a UI do formulário de submissão, listagem de auditoria, modal de configuração Pinata e verificações Web3.
 */

import React, { useState, useEffect } from 'react';
import { AuditLogItem } from './types';
import { Header } from './components/Header';
import { ApiKeyModal } from './components/ApiKeyModal';
import { FormularioEvento } from './components/FormularioEvento';
import { TabelaLogs } from './components/TabelaLogs';
import { ModalVerificacao } from './components/ModalVerificacao';
import { ExplicacaoCodigo } from './components/ExplicacaoCodigo';
import { ShieldCheck, Lock, Activity, Sparkles, CheckCircle2 } from 'lucide-react';

// Dados iniciais demonstrativos para enriquecer a primeira visualização
const SEED_LOGS: AuditLogItem[] = [
  {
    id: 'EVT-1785000001-982',
    ipfsHash: 'bafkreic3k2pl9z7x4n8m0p1q2r3s4t5u6v7w8x9y0z1a2b3c4d5e6f7g8h',
    pinSize: 342,
    dadosEvento: {
      id: 'EVT-1785000001-982',
      usuario: 'maria.security@empresa.com',
      acao: 'Exclusão da tabela de logs legados `db_audit_2025`',
      nivel: 'CRITICO',
      categoria: 'BANCO_DE_DADOS',
      detalhes: 'Exclusão autorizada sob chamado TICKET-88912 para conformidade com período de retenção LGPD.',
      timestampISO: new Date(Date.now() - 3600000 * 4).toISOString(),
      timestampUnix: Date.now() - 3600000 * 4,
      hashLocalSHA256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    },
    registradoEm: new Date(Date.now() - 3600000 * 4).toISOString(),
    isSimulated: true,
    gatewayUrl: 'https://gateway.pinata.cloud/ipfs/bafkreic3k2pl9z7x4n8m0p1q2r3s4t5u6v7w8x9y0z1a2b3c4d5e6f7g8h',
  },
  {
    id: 'EVT-1785000002-144',
    ipfsHash: 'bafkreih8v7w6u5t4s3r2q1p0o9n8m7l6k5j4i3h2g1f0e9d8c7b6a5z4y3',
    pinSize: 288,
    dadosEvento: {
      id: 'EVT-1785000002-144',
      usuario: 'carlos.financeiro@empresa.com',
      acao: 'Transferência de Tesouraria - R$ 250.000,00',
      nivel: 'CRITICO',
      categoria: 'FINANCEIRO',
      detalhes: 'Transferência entre contas de liquidação bancária via aprovação multifator.',
      timestampISO: new Date(Date.now() - 3600000 * 2).toISOString(),
      timestampUnix: Date.now() - 3600000 * 2,
      hashLocalSHA256: 'f0e9d8c7b6a543210987654321fedcba0123456789abcdef0123456789abcdef',
    },
    registradoEm: new Date(Date.now() - 3600000 * 2).toISOString(),
    isSimulated: true,
    gatewayUrl: 'https://gateway.pinata.cloud/ipfs/bafkreih8v7w6u5t4s3r2q1p0o9n8m7l6k5j4i3h2g1f0e9d8c7b6a5z4y3',
  },
  {
    id: 'EVT-1785000003-512',
    ipfsHash: 'bafkreib9a8z7y6x5w4v3u2t1s0r9q8p7o6n5m4l3k2j1i0h9g8f7e6d5c4',
    pinSize: 210,
    dadosEvento: {
      id: 'EVT-1785000003-512',
      usuario: 'devops.bot@empresa.com',
      acao: 'Atualização de Certificado TLS Wildcard (*.empresa.com)',
      nivel: 'ALTO',
      categoria: 'INFRAESTRUTURA',
      detalhes: 'Renovação automatizada de chave RSA 4096-bit em cluster Kubernetes de produção.',
      timestampISO: new Date(Date.now() - 1800000).toISOString(),
      timestampUnix: Date.now() - 1800000,
      hashLocalSHA256: '123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0',
    },
    registradoEm: new Date(Date.now() - 1800000).toISOString(),
    isSimulated: true,
    gatewayUrl: 'https://gateway.pinata.cloud/ipfs/bafkreib9a8z7y6x5w4v3u2t1s0r9q8p7o6n5m4l3k2j1i0h9g8f7e6d5c4',
  },
];

export default function App() {
  // Estado do Token JWT Pinata armazenado no navegador
  const [pinataToken, setPinataToken] = useState<string>(() => {
    return localStorage.getItem('PINATA_JWT_TOKEN') || '';
  });

  // Modo de simulação caso o usuário queira testar sem token
  const [isSimulated, setIsSimulated] = useState<boolean>(() => {
    const saved = localStorage.getItem('PINATA_SIMULATED_MODE');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Lista de logs registrados
  const [logs, setLogs] = useState<AuditLogItem[]>(() => {
    const savedLogs = localStorage.getItem('AUDIT_LOGS_IPFS');
    if (savedLogs) {
      try {
        return JSON.parse(savedLogs);
      } catch {
        return SEED_LOGS;
      }
    }
    return SEED_LOGS;
  });

  // Estados dos modais
  const [isModalConfigOpen, setIsModalConfigOpen] = useState(false);
  const [selectedLogInspec, setSelectedLogInspec] = useState<AuditLogItem | null>(null);

  // Persistência local no localStorage
  useEffect(() => {
    localStorage.setItem('PINATA_JWT_TOKEN', pinataToken);
  }, [pinataToken]);

  useEffect(() => {
    localStorage.setItem('PINATA_SIMULATED_MODE', JSON.stringify(isSimulated));
  }, [isSimulated]);

  useEffect(() => {
    localStorage.setItem('AUDIT_LOGS_IPFS', JSON.stringify(logs));
  }, [logs]);

  // Função disparada quando um novo evento é registrado com sucesso no IPFS
  const handleNovoLogSuccess = (novoLog: AuditLogItem) => {
    setLogs((prev) => [novoLog, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Cabeçalho da Aplicação */}
      <Header
        hasApiToken={Boolean(pinataToken.trim())}
        isSimulated={isSimulated}
        totalLogs={logs.length}
        onOpenConfig={() => setIsModalConfigOpen(true)}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner Informativo de Conectividade */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Conformidade & Imutabilidade Garantidas por IPFS
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Pinata Cloud Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Os logs abaixo foram selados com hashes criptográficos CIDs no armazenamento descentralizado.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalConfigOpen(true)}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shrink-0"
          >
            {pinataToken ? 'Chave Pinata Ativa' : 'Configurar Chave API Pinata'}
          </button>
        </div>

        {/* Grid Principal: Formulário de Registro e Lista de Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Coluna da Esquerda: Formulário de Registro (Requisitos 1, 2, 3 e 4) */}
          <section className="lg:col-span-5">
            <FormularioEvento
              tokenBearer={pinataToken}
              isSimulated={isSimulated}
              onSuccess={handleNovoLogSuccess}
              onOpenConfigPinata={() => setIsModalConfigOpen(true)}
            />
          </section>

          {/* Coluna da Direita: Lista / Tabela de Logs Recentes (Requisito 5) */}
          <section className="lg:col-span-7">
            <TabelaLogs
              logs={logs}
              onInspect={(log) => setSelectedLogInspec(log)}
            />
          </section>

        </div>

        {/* Painel Didático de Engenharia e Explicação do Código */}
        <ExplicacaoCodigo />

      </main>

      {/* Rodapé da Aplicação */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-slate-400">
              Registro Imutável de Eventos • Web3 & Compliance
            </span>
          </div>
          <p>
            Construído com React, TypeScript, Tailwind CSS & Pinata IPFS API
          </p>
        </div>
      </footer>

      {/* Modal de Configuração da API Pinata */}
      <ApiKeyModal
        isOpen={isModalConfigOpen}
        onClose={() => setIsModalConfigOpen(false)}
        tokenAtual={pinataToken}
        onSaveToken={(novoToken) => setPinataToken(novoToken)}
        isSimulated={isSimulated}
        onToggleSimulated={(val) => setIsSimulated(val)}
      />

      {/* Modal de Inspeção e Validação Criptográfica do CID */}
      <ModalVerificacao
        log={selectedLogInspec}
        onClose={() => setSelectedLogInspec(null)}
      />

    </div>
  );
}
