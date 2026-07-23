/**
 * @file Header.tsx
 * @description Cabeçalho do Painel de Auditoria e Compliance Web3.
 */

import React from 'react';
import { ShieldCheck, Database, Key, CheckCircle, AlertTriangle, Cpu } from 'lucide-react';

interface HeaderProps {
  hasApiToken: boolean;
  isSimulated: boolean;
  totalLogs: number;
  onOpenConfig: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasApiToken,
  isSimulated,
  totalLogs,
  onOpenConfig,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Título e Identidade */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600/20 p-2.5 rounded-xl border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
                  Registro Imutável de Eventos
                </h1>
                <span className="bg-blue-500/10 text-blue-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-500/20">
                  IPFS Audit
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Provas Criptográficas Descentralizadas • Regra "Não confiar, verificar"
              </p>
            </div>
          </div>

          {/* Status e Ações */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Badge de Status IPFS */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Rede:</span>
              {isSimulated ? (
                <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Simulador IPFS
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Pinata Gateway
                </span>
              )}
            </div>

            {/* Total de Logs Registrados */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Logs Imutáveis:</span>
              <span className="font-mono font-bold text-slate-100">{totalLogs}</span>
            </div>

            {/* Botão de Configuração de API Key Pinata */}
            <button
              onClick={onOpenConfig}
              id="btn-config-pinata"
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                hasApiToken
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/50'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>{hasApiToken ? 'Pinata JWT Conectado' : 'Configurar Pinata JWT'}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
