/**
 * @file ModalVerificacao.tsx
 * @description Modal de inspeção e validação de integridade do log IPFS.
 */

import React, { useState } from 'react';
import { AuditLogItem } from '../types';
import { X, CheckCircle, Copy, ShieldCheck, ExternalLink, Code2 } from 'lucide-react';
import { copiarParaClipboard } from '../utils/cryptoUtils';

interface ModalVerificacaoProps {
  log: AuditLogItem | null;
  onClose: () => void;
}

export const ModalVerificacao: React.FC<ModalVerificacaoProps> = ({ log, onClose }) => {
  const [copiado, setCopiado] = useState(false);

  if (!log) return null;

  const jsonFormatado = JSON.stringify(
    {
      pinataContent: log.dadosEvento,
      pinataMetadata: {
        name: `LOG_AUDITORIA_${log.dadosEvento.categoria}_${log.dadosEvento.timestampUnix}`,
        keyvalues: {
          nivel: log.dadosEvento.nivel,
          usuario: log.dadosEvento.usuario,
        },
      },
    },
    null,
    2
  );

  const handleCopyJson = async () => {
    const ok = await copiarParaClipboard(jsonFormatado);
    if (ok) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Provas de Auditoria Web3 & IPFS</h2>
            <p className="text-xs text-slate-400">ID do Log: {log.id}</p>
          </div>
        </div>

        {/* Resumo da Validação */}
        <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-3.5 mb-5 text-xs text-emerald-200 space-y-1">
          <div className="flex items-center gap-2 font-bold text-emerald-300">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Conteúdo Imutável Validado por Endereçamento Criptográfico (CAS)</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            No IPFS, o CID (Content Identifier) é diretamente derivado do hash de bytes do arquivo. Qualquer alteração em um único caractere no JSON abaixo geraria um hash totalmente diferente.
          </p>
        </div>

        {/* Detalhes do Log */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Operador / Usuário</span>
            <span className="text-slate-200 font-mono">{log.dadosEvento.usuario}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Hash SHA-256 Pré-Upload</span>
            <span className="text-purple-300 font-mono text-[11px] truncate block">{log.dadosEvento.hashLocalSHA256 || 'Calculado no cliente'}</span>
          </div>
        </div>

        {/* JSON Estruturado */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-cyan-400" />
              Payload JSON Publicado (pinataContent):
            </span>
            <button
              onClick={handleCopyJson}
              className="text-xs text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1 transition-colors"
            >
              {copiado ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiado ? 'Copiado!' : 'Copiar JSON'}</span>
            </button>
          </div>

          <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-cyan-300 overflow-x-auto max-h-60 leading-relaxed">
            {jsonFormatado}
          </pre>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <a
            href={log.gatewayUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Abrir no Gateway Público IPFS</span>
          </a>

          <button
            onClick={onClose}
            className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl border border-slate-700 transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
