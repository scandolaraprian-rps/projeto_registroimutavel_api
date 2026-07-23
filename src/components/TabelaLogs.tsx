/**
 * @file TabelaLogs.tsx
 * @description Tabela/Lista dos Logs Recentes de Auditoria com filtros e exportação.
 */

import React, { useState } from 'react';
import { AuditLogItem, NivelCriticidade } from '../types';
import { CardLogAudit } from './CardLogAudit';
import { Search, Filter, Download, Database, Inbox, FileSpreadsheet } from 'lucide-react';

interface TabelaLogsProps {
  logs: AuditLogItem[];
  onInspect: (log: AuditLogItem) => void;
}

export const TabelaLogs: React.FC<TabelaLogsProps> = ({ logs, onInspect }) => {
  const [busca, setBusca] = useState('');
  const [filtroNivel, setFiltroNivel] = useState<string>('TODOS');

  // Filtragem dinâmica dos logs
  const logsFiltrados = logs.filter((log) => {
    const termo = busca.toLowerCase();
    const bateTexto =
      log.dadosEvento.usuario.toLowerCase().includes(termo) ||
      log.dadosEvento.acao.toLowerCase().includes(termo) ||
      log.ipfsHash.toLowerCase().includes(termo) ||
      log.dadosEvento.categoria.toLowerCase().includes(termo);

    const bateNivel = filtroNivel === 'TODOS' || log.dadosEvento.nivel === filtroNivel;

    return bateTexto && bateNivel;
  });

  // Exportar relatório de auditoria em JSON
  const exportarJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `relatorio_auditoria_ipfs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Exportar relatório em CSV
  const exportarCSV = () => {
    const headers = ['ID', 'Data/Hora', 'Operador', 'Ação', 'Nível', 'Categoria', 'CID_IPFS', 'Gateway_URL'];
    const rows = logs.map(l => [
      l.id,
      l.registradoEm,
      `"${l.dadosEvento.usuario.replace(/"/g, '""')}"`,
      `"${l.dadosEvento.acao.replace(/"/g, '""')}"`,
      l.dadosEvento.nivel,
      l.dadosEvento.categoria,
      l.ipfsHash,
      l.gatewayUrl
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_auditoria_ipfs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100">
      
      {/* Cabeçalho da Lista */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">Logs Recentes de Auditoria</h2>
            <span className="bg-purple-500/10 text-purple-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-purple-500/20">
              {logsFiltrados.length} evento(s)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registros imutáveis salvos e vinculados a um CID criptográfico na rede IPFS
          </p>
        </div>

        {/* Botões de Exportação */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportarCSV}
            disabled={logs.length === 0}
            className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl transition-colors disabled:opacity-40 flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={exportarJSON}
            disabled={logs.length === 0}
            className="text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl transition-colors shadow-md disabled:opacity-40 flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Exportar JSON</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtro e Busca */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        
        {/* Input de Busca */}
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por operador, ação ou Hash CID IPFS..."
            className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none transition-all placeholder:text-slate-600"
          />
        </div>

        {/* Filtro por Nível */}
        <div className="relative">
          <Filter className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <select
            value={filtroNivel}
            onChange={(e) => setFiltroNivel(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none transition-all cursor-pointer font-medium"
          >
            <option value="TODOS">Todos os Níveis</option>
            <option value="BAIXO">Apenas BAIXO</option>
            <option value="MEDIO">Apenas MÉDIO</option>
            <option value="ALTO">Apenas ALTO</option>
            <option value="CRITICO">Apenas CRÍTICO</option>
          </select>
        </div>

      </div>

      {/* Lista de Cards dos Logs */}
      {logsFiltrados.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
          <Inbox className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-400">Nenhum log de auditoria encontrado</p>
          <p className="text-xs text-slate-500 mt-1">
            {logs.length === 0
              ? 'Preencha o formulário acima e clique em "Registrar Evento Imutável" para publicar seu primeiro log.'
              : 'Nenhum resultado corresponde aos filtros aplicados.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {logsFiltrados.map((log) => (
            <CardLogAudit key={log.id} log={log} onInspect={onInspect} />
          ))}
        </div>
      )}

    </div>
  );
};
