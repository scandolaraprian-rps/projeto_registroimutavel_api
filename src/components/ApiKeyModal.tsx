/**
 * @file ApiKeyModal.tsx
 * @description Modal para inserção e teste do Bearer Token (JWT) da API Pinata.
 */

import React, { useState } from 'react';
import { Key, X, Check, AlertCircle, ExternalLink, RefreshCw, Zap } from 'lucide-react';
import { testarTokenPinata } from '../services/pinataService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenAtual: string;
  onSaveToken: (token: string) => void;
  isSimulated: boolean;
  onToggleSimulated: (val: boolean) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  tokenAtual,
  onSaveToken,
  isSimulated,
  onToggleSimulated,
}) => {
  const [inputToken, setInputToken] = useState(tokenAtual);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!inputToken.trim()) {
      setTestStatus('error');
      setErrorMessage('Por favor, informe um token JWT antes de testar.');
      return;
    }

    setTestStatus('testing');
    setErrorMessage('');

    const ok = await testarTokenPinata(inputToken.trim());
    if (ok) {
      setTestStatus('success');
    } else {
      setTestStatus('error');
      setErrorMessage('Token inválido ou sem permissões de acesso. Verifique seu JWT no painel da Pinata.');
    }
  };

  const handleSave = () => {
    onSaveToken(inputToken.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        id="modal-pinata-config"
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative"
      >
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          id="btn-close-modal"
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Configuração da API Pinata (IPFS)</h2>
            <p className="text-xs text-slate-400">
              Autenticação via Bearer Token JWT para publicar no IPFS
            </p>
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 mb-5 text-xs text-slate-300 leading-relaxed">
          <p className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" /> Como obter suas credenciais na Pinata:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-slate-400">
            <li>Crie uma conta gratuita em <a href="https://app.pinata.cloud" target="_blank" rel="noreferrer" className="text-blue-400 underline inline-flex items-center gap-0.5">pinata.cloud <ExternalLink className="w-3 h-3" /></a></li>
            <li>Acesse a seção <strong>API Keys</strong> e crie uma nova chave com permissão <code className="bg-slate-950 px-1 py-0.5 rounded text-slate-200">pinJSONToIPFS</code>.</li>
            <li>Copie o <strong>JWT Token (Bearer Token)</strong> gerado e cole no campo abaixo.</li>
          </ol>
        </div>

        {/* Alternador de Modo Simulação */}
        <div className="mb-5 p-3.5 rounded-xl border border-slate-700/80 bg-slate-950/60 flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-slate-200 block">Modo Simulação IPFS (Demonstração)</span>
            <span className="text-xs text-slate-400">
              Gera hashes CIDs válidos localmente sem necessidade de chave de API Pinata.
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="chk-simulacao"
              checked={isSimulated}
              onChange={(e) => onToggleSimulated(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Campo do Token JWT */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Pinata JWT (Bearer Token):
          </label>
          <textarea
            id="input-pinata-jwt"
            rows={3}
            value={inputToken}
            onChange={(e) => {
              setInputToken(e.target.value);
              setTestStatus('idle');
            }}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none transition-all placeholder:text-slate-600"
          />
        </div>

        {/* Status do Teste */}
        {testStatus === 'success' && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Chave JWT verificada com sucesso! Conexão com Pinata API ativa.</span>
          </div>
        )}

        {testStatus === 'error' && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleTest}
            id="btn-test-pinata"
            disabled={testStatus === 'testing' || !inputToken.trim()}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 disabled:opacity-50 flex items-center gap-1.5"
          >
            {testStatus === 'testing' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Testando...</span>
              </>
            ) : (
              <span>Testar Chave</span>
            )}
          </button>

          <button
            type="button"
            onClick={handleSave}
            id="btn-save-pinata"
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-600/20"
          >
            Salvar e Continuar
          </button>
        </div>

      </div>
    </div>
  );
};
