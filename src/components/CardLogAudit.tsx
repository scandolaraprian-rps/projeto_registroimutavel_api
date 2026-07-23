/**
 * @file CardLogAudit.tsx
 * @description Exibe individualmente cada registro de evento imutável com seu respectivo CID IPFS.
 */

import React, { useState } from 'react';
import { AuditLogItem } from '../types';
import { ExternalLink, Copy, Check, FileText, Clock, User, ShieldAlert, CheckCircle } from 'lucide-react';
import { formatarDataHora, copiarParaClipboard } from '../utils/cryptoUtils';

interface CardLogAuditProps {
  log: AuditLogItem;
  onInspect: (log: AuditLogItem) => void;
}

export const CardLogAudit: React.FC<CardLogAuditProps> = ({ log, onInspect }) => {
  const [copiado, setCopiado] = useState(false);

  const handleCopyHash = async () => {
    const ok = await copiarParaClipboard(log.ipfsHash);
    if (ok) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  // Cores da borda esquerda baseadas no nível de criticidade (Geometric Balance)
  const leftBorderColor = {
    BAIXO: 'border-l-sky-400',
    MEDIO: 'border-l-amber-400',
    ALTO: 'border-l-orange-400',
    CRITICO: 'border-l-rose-500',
  }[log.dadosEvento.nivel];

  // Cores de badges por nível de criticidade
  const badgeColors = {
    BAIXO: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30',
    MEDIO: 'bg-amber-950/60 text-amber-400 border-amber-500/30',
    ALTO: 'bg-orange-950/60 text-orange-400 border-orange-500/30',
    CRITICO: 'bg-rose-950/60 text-rose-400 border-rose-500/30 font-extrabold animate-pulse',
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 ${leftBorderColor} border-l-4 hover:border-slate-700 rounded-r-xl rounded-l-none p-5 text-slate-100 shadow-md transition-all`}>
      
      {/* Topo do Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badgeColors[log.dadosEvento.nivel]}`}>
            {log.dadosEvento.nivel}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
            {log.dadosEvento.categoria.replace('_', ' ')}
          </span>
          {log.isSimulated && (
            <span className="text-[10px] bg-slate-800 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
              Simulado
            </span>
          )}
        </div>

        <div className="flex items-center text-xs text-slate-400 gap-1.5 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{formatarDataHora(log.registradoEm)}</span>
        </div>
      </div>

      {/* Ação e Operador */}
      <div className="mb-3">
        <h3 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
          {log.dadosEvento.acao}
        </h3>
        <div className="flex items-center text-xs text-slate-400 gap-1.5">
          <User className="w-3.5 h-3.5 text-blue-400" />
          <span>Operador: <strong className="text-slate-200">{log.dadosEvento.usuario}</strong></span>
        </div>
      </div>

      {/* Detalhes do Evento (se houver) */}
      {log.dadosEvento.detalhes && (
        <div className="mb-4 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300 font-mono text-ellipsis overflow-hidden">
          {log.dadosEvento.detalhes}
        </div>
      )}

      {/* Box do CID IPFS (Content Identifier) */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-4">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
          <span className="flex items-center gap-1 font-semibold text-slate-300">
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            Hash IPFS (CID Imutável):
          </span>
          <span className="text-[10px] text-slate-500">Tamanho: {log.pinSize || '?'} bytes</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <code className="text-xs font-mono text-cyan-300 truncate select-all">
            {log.ipfsHash}
          </code>

          <button
            onClick={handleCopyHash}
            title="Copiar Hash CID"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
          >
            {copiado ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Rodapé do Card com Ações */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
        <button
          onClick={() => onInspect(log)}
          className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
        >
          <FileText className="w-3 h-3 text-blue-400" />
          <span>Inspecionar JSON & Prova</span>
        </button>

        <a
          href={log.gatewayUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-950/40 hover:bg-blue-900/40 border border-blue-500/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Ver no Gateway IPFS</span>
        </a>
      </div>

    </div>
  );
};
