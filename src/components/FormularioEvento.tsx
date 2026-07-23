/**
 * @file FormularioEvento.tsx
 * @description Formulário para captura e submissão de eventos críticos de auditoria para o IPFS.
 * Atende aos requisitos 1, 2 e 4: Sem refresh de página, feedback de loading e tratamento de erro via try/catch.
 */

import React, { useState } from 'react';
import { NivelCriticidade, CategoriaEvento, EventoCritico } from '../types';
import { registrarLogNoIPFS } from '../services/pinataService';
import { ShieldAlert, Loader2, CheckCircle2, AlertTriangle, Sparkles, Send } from 'lucide-react';
import { calcularHashSHA256 } from '../utils/cryptoUtils';

interface FormularioEventoProps {
  tokenBearer: string;
  isSimulated: boolean;
  onSuccess: (novoLog: {
    ipfsHash: string;
    pinSize?: number;
    dadosEvento: EventoCritico;
    registradoEm: string;
    isSimulated: boolean;
    gatewayUrl: string;
  }) => void;
  onOpenConfigPinata: () => void;
}

export const FormularioEvento: React.FC<FormularioEventoProps> = ({
  tokenBearer,
  isSimulated,
  onSuccess,
  onOpenConfigPinata,
}) => {
  // Estado local do formulário
  const [usuario, setUsuario] = useState('audit.operator@empresa.com');
  const [acao, setAcao] = useState('');
  const [nivel, setNivel] = useState<NivelCriticidade>('ALTO');
  const [categoria, setCategoria] = useState<CategoriaEvento>('BANCO_DE_DADOS');
  const [detalhes, setDetalhes] = useState('');

  // Estados de controle de UI (Loading, Sucesso e Erro)
  const [carregando, setCarregando] = useState(false);
  const [mensagemStatusLoading, setMensagemStatusLoading] = useState('');
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [sucessoLog, setSucessoLog] = useState<{ ipfsHash: string; gatewayUrl: string } | null>(null);

  // Presets rápidos de ações críticas
  const presetsAcoes = [
    { label: 'Exclusão de Tabela DB', cat: 'BANCO_DE_DADOS' as CategoriaEvento, niv: 'CRITICO' as NivelCriticidade },
    { label: 'Transferência Financeira > R$ 100k', cat: 'FINANCEIRO' as CategoriaEvento, niv: 'CRITICO' as NivelCriticidade },
    { label: 'Elevação para Usuário Root', cat: 'SEGURANCA' as CategoriaEvento, niv: 'ALTO' as NivelCriticidade },
    { label: 'Exportação de Dados LGPD', cat: 'ACESSO' as CategoriaEvento, niv: 'ALTO' as NivelCriticidade },
    { label: 'Revogação de Chave Mestre SSL', cat: 'INFRAESTRUTURA' as CategoriaEvento, niv: 'CRITICO' as NivelCriticidade },
  ];

  const selecionarPreset = (p: { label: string; cat: CategoriaEvento; niv: NivelCriticidade }) => {
    setAcao(p.label);
    setCategoria(p.cat);
    setNivel(p.niv);
    setDetalhes(`Evento pré-configurado disparado por política de conformidade para ${p.label}.`);
    setMensagemErro(null);
  };

  /**
   * MANIPULADOR DE SUBMISSÃO DO FORMULÁRIO (REQUISITO 2 e 4)
   * Impede a recarga da página usando event.preventDefault() e trata a requisição com try/catch.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // 1. Impede a recarga da página (no page refresh)
    e.preventDefault();

    // Validação básica de entradas
    if (!usuario.trim() || !acao.trim()) {
      setMensagemErro('Por favor, preencha o Usuário e a Ação do Evento.');
      return;
    }

    // Limpa estados de status anteriores
    setMensagemErro(null);
    setSucessoLog(null);
    setCarregando(true);
    setMensagemStatusLoading('Registrando na rede IPFS...');

    try {
      // Cria a estrutura do evento de auditoria
      const timestampIso = new Date().toISOString();
      const timestampUnix = Date.now();

      const eventoBase: EventoCritico = {
        id: `EVT-${timestampUnix}-${Math.floor(Math.random() * 1000)}`,
        usuario: usuario.trim(),
        acao: acao.trim(),
        nivel,
        categoria,
        detalhes: detalhes.trim() || 'Sem detalhes adicionais fornecidos.',
        timestampISO: timestampIso,
        timestampUnix,
      };

      // Calcula o hash local prévio SHA-256
      const hashLocal = await calcularHashSHA256(eventoBase);
      const eventoCompleto: EventoCritico = {
        ...eventoBase,
        hashLocalSHA256: hashLocal,
      };

      // Atualiza o progresso no DOM
      setMensagemStatusLoading('Enviando dados para o nó IPFS Pinata...');

      // 2. Chamada da função de integração com a API Pinata via Fetch com async/await
      const resultado = await registrarLogNoIPFS(eventoCompleto, tokenBearer, isSimulated);

      // 3. Atualização do DOM com o resultado do CID imutável
      setSucessoLog({
        ipfsHash: resultado.ipfsHash,
        gatewayUrl: resultado.gatewayUrl,
      });

      // Notifica o componente pai para atualizar a lista/tabela de logs recentes
      onSuccess({
        id: eventoCompleto.id,
        ipfsHash: resultado.ipfsHash,
        pinSize: resultado.pinSize,
        dadosEvento: eventoCompleto,
        registradoEm: timestampIso,
        isSimulated: resultado.isSimulated,
        gatewayUrl: resultado.gatewayUrl,
      });

      // Opcional: limpa parcialmente os campos após o envio bem-sucedido
      setAcao('');
      setDetalhes('');

    } catch (erro: unknown) {
      // TRATAMENTO DE ERROS (REQUISITO 4)
      // Captura falhas na chamada da API e atualiza o DOM exibindo a mensagem vermelha
      console.error('[FormularioEvento] Erro ao submeter evento:', erro);
      
      const textoErro = erro instanceof Error ? erro.message : 'Ocorreu um erro inesperado ao conectar com o IPFS.';
      setMensagemErro(textoErro);
    } finally {
      setCarregando(false);
      setMensagemStatusLoading('');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100">
      
      {/* Cabeçalho do Card */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Registrar Evento Crítico</h2>
            <p className="text-xs text-slate-400">
              Gera uma prova de auditabilidade imutável gravada diretamente no IPFS
            </p>
          </div>
        </div>

        {/* Badge do modo ativo */}
        {isSimulated && (
          <button
            type="button"
            onClick={onOpenConfigPinata}
            className="text-xs bg-amber-950/60 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-medium hover:bg-amber-900/50 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulação Ativa</span>
          </button>
        )}
      </div>

      {/* Presets de Ações Rápidas */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
          Presets Rápidos de Auditoria:
        </label>
        <div className="flex flex-wrap gap-2">
          {presetsAcoes.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => selecionarPreset(p)}
              className="text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700/60 transition-colors text-left"
            >
              + {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* FORMULÁRIO DE REGISTRO (REQUISITOS 1 e 2) */}
      <form onSubmit={handleSubmit} id="form-registro-evento" className="space-y-4">
        
        {/* Linha 1: Usuário e Categoria */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nome do Usuário / Operador *
            </label>
            <input
              type="text"
              id="input-usuario"
              required
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="ex: carlos.admin@empresa.com"
              className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Categoria do Evento *
            </label>
            <select
              id="select-categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as CategoriaEvento)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all cursor-pointer"
            >
              <option value="BANCO_DE_DADOS">Banco de Dados</option>
              <option value="FINANCEIRO">Financeiro</option>
              <option value="SEGURANCA">Segurança & Criptografia</option>
              <option value="ACESSO">Controle de Acessos</option>
              <option value="INFRAESTRUTURA">Infraestrutura Cloud</option>
              <option value="OUTROS">Outros</option>
            </select>
          </div>
        </div>

        {/* Linha 2: Ação Realizada e Nível de Criticidade */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Ação Realizada (Evento Crítico) *
            </label>
            <input
              type="text"
              id="input-acao"
              required
              value={acao}
              onChange={(e) => setAcao(e.target.value)}
              placeholder="ex: Exclusão do banco de dados de produção 'db_customers'"
              className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nível de Criticidade *
            </label>
            <select
              id="select-nivel"
              value={nivel}
              onChange={(e) => setNivel(e.target.value as NivelCriticidade)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-200 focus:outline-none transition-all cursor-pointer"
            >
              <option value="BAIXO" className="text-emerald-400">BAIXO</option>
              <option value="MEDIO" className="text-amber-400">MÉDIO</option>
              <option value="ALTO" className="text-orange-400">ALTO</option>
              <option value="CRITICO" className="text-rose-500">CRÍTICO</option>
            </select>
          </div>
        </div>

        {/* Linha 3: Detalhes do Evento */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Detalhes / Payload do Evento (Opcional):
          </label>
          <textarea
            id="textarea-detalhes"
            rows={3}
            value={detalhes}
            onChange={(e) => setDetalhes(e.target.value)}
            placeholder="Insira informações de contexto, IP de origem, parâmetros modificados ou JSON do evento..."
            className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl p-3 text-xs text-slate-200 focus:outline-none transition-all placeholder:text-slate-600 font-mono"
          />
        </div>

        {/* MENSAGEM DE ERRO (REQUISITO 4) */}
        {mensagemErro && (
          <div 
            id="msg-erro-ipfs"
            className="p-4 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-start gap-3 animate-shake"
          >
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-red-300 block">Falha no Registro Imutável:</span>
              <p className="text-red-200/90 leading-normal">{mensagemErro}</p>
              {!tokenBearer && !isSimulated && (
                <button
                  type="button"
                  onClick={onOpenConfigPinata}
                  className="mt-2 inline-flex items-center gap-1 font-semibold text-amber-300 underline hover:text-amber-200"
                >
                  Clique aqui para inserir o Token JWT da Pinata ou ativar a simulação.
                </button>
              )}
            </div>
          </div>
        )}

        {/* MENSAGEM DE SUCESSO */}
        {sucessoLog && (
          <div 
            id="msg-sucesso-ipfs"
            className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-start gap-3 animate-fade-in"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5 w-full">
              <span className="font-bold text-emerald-300 block">Evento Registrado com Sucesso no IPFS!</span>
              <p className="text-slate-300 text-xs">
                Content Identifier (CID) imutável gerado:
              </p>
              <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg font-mono text-[11px] text-emerald-400 select-all break-all">
                {sucessoLog.ipfsHash}
              </div>
              <div className="pt-1">
                <a
                  href={sucessoLog.gatewayUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-blue-400 underline hover:text-blue-300"
                >
                  Verificar publicação direta no Gateway Pinata IPFS &rarr;
                </a>
              </div>
            </div>
          </div>
        )}

        {/* INDICADOR DE CARREGAMENTO & BOTÃO DE SUBMISSÃO (REQUISITOS 1 e 2) */}
        <div className="pt-2">
          <button
            type="submit"
            id="btn-registrar-evento"
            disabled={carregando}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
              carregando
                ? 'bg-blue-800/60 cursor-wait border border-blue-500/40'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border border-blue-400/30 shadow-blue-600/20 active:scale-[0.99]'
            }`}
          >
            {carregando ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-blue-300" />
                <span id="loading-indicator">{mensagemStatusLoading || 'Registrando na rede IPFS...'}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Registrar Evento Imutável</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
