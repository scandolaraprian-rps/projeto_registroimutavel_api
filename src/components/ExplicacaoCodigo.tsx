/**
 * @file ExplicacaoCodigo.tsx
 * @description Painel didático que explica o atendimento aos requisitos técnicos do projeto
 * (fetch, try/catch, manipulação do DOM e imutabilidade Web3).
 */

import React, { useState } from 'react';
import { Code, BookOpen, ChevronDown, ChevronUp, CheckCircle, Terminal } from 'lucide-react';

export const ExplicacaoCodigo: React.FC = () => {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100">
      
      {/* Botão Retrátil */}
      <button
        onClick={() => setExpandido(!expandido)}
        className="w-full flex items-center justify-between text-left group focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
              Documentação de Engenharia & Atendimento de Requisitos
            </h2>
            <p className="text-xs text-slate-400">
              Veja como o fetch, try/catch, DOM e Pinata API resolvem o problema de imutabilidade de eventos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-purple-400 font-semibold bg-purple-950/40 border border-purple-500/30 px-3 py-1.5 rounded-lg">
          <span>{expandido ? 'Ocultar Explicação' : 'Ver Explicação Técnica'}</span>
          {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Conteúdo Expandido */}
      {expandido && (
        <div className="mt-6 pt-6 border-t border-slate-800 space-y-6 animate-fade-in text-xs leading-relaxed text-slate-300">
          
          {/* Requisito 1 & 2: Regra de Negócio e DOM sem refresh */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="font-bold text-slate-100 text-sm mb-2 flex items-center gap-2 text-blue-400">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              1. Regra de Negócio & Manipulação do DOM (Sem Refresh)
            </h3>
            <p className="text-slate-300 mb-2">
              Bancos de dados relacionais tradicionais podem sofrer exclusões ou edições maliciosas diretamente por administradores do sistema. Ao interceptar o evento com <code className="text-cyan-300">event.preventDefault()</code> no formulário, os dados do evento são mantidos intactos e preparados para publicação no IPFS.
            </p>
            <div className="bg-slate-900 p-3 rounded-lg font-mono text-[11px] text-cyan-300 border border-slate-800">
              {`const handleSubmit = async (e: React.FormEvent) => {\n  e.preventDefault(); // Impede a recarga da página\n  setCarregando(true);\n  setMensagemStatusLoading('Registrando na rede IPFS...');\n  ...\n};`}
            </div>
          </div>

          {/* Requisito 3: Integração com Pinata API (Fetch) */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="font-bold text-slate-100 text-sm mb-2 flex items-center gap-2 text-blue-400">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              2. Integração com a API Pinata via Fetch Native e Async/Await
            </h3>
            <p className="text-slate-300 mb-2">
              A função <code className="text-cyan-300">registrarLogNoIPFS(dadosEvento)</code> faz uma requisição HTTP POST para o endpoint <code className="text-purple-300">https://api.pinata.cloud/pinning/pinJSONToIPFS</code> enviando o cabeçalho <code className="text-amber-300">Authorization: Bearer [JWT]</code> e os dados encapsulados na chave <code className="text-emerald-300">pinataContent</code>.
            </p>
            <div className="bg-slate-900 p-3 rounded-lg font-mono text-[11px] text-cyan-300 border border-slate-800 overflow-x-auto">
              {`const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {\n  method: 'POST',\n  headers: {\n    'Content-Type': 'application/json',\n    'Authorization': \`Bearer \${tokenAtivo}\`\n  },\n  body: JSON.stringify({\n    pinataContent: dadosEvento, // Dados imutáveis\n    pinataMetadata: { name: 'LOG_AUDITORIA' }\n  })\n});`}
            </div>
          </div>

          {/* Requisito 4: Tratamento de Erros Try/Catch */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="font-bold text-slate-100 text-sm mb-2 flex items-center gap-2 text-blue-400">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              3. Tratamento de Erros e Feedback Visual (Try/Catch)
            </h3>
            <p className="text-slate-300 mb-2">
              Se a API falhar, o token expirar ou a rede desconectar, o bloco <code className="text-rose-400">catch</code> intercepta a exceção e atualiza o estado da interface, exibindo um alerta vermelho com os detalhes do erro para o operador.
            </p>
            <div className="bg-slate-900 p-3 rounded-lg font-mono text-[11px] text-rose-300 border border-slate-800">
              {`try {\n  const resultado = await registrarLogNoIPFS(eventoCompleto);\n  setSucessoLog(resultado); // Exibe o CID no DOM\n} catch (erro) {\n  setMensagemErro(erro.message); // Atualiza o DOM com mensagem de erro vermelha\n} finally {\n  setCarregando(false);\n}`}
            </div>
          </div>

          {/* Requisito 5: Exibição Dinâmica do Hash CID */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="font-bold text-slate-100 text-sm mb-2 flex items-center gap-2 text-blue-400">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              4. Por que o CID garante a Imutabilidade? ("Não confiar, verificar")
            </h3>
            <p className="text-slate-300">
              No IPFS (InterPlanetary File System), o identificador do arquivo é um CID obtido a partir do hash criptográfico do próprio conteúdo. Se um atacante alterar um único bit do registro de auditoria, o hash resultante mudará completamente. A presença do CID retornado pela Pinata (<code className="text-cyan-300">IpfsHash</code>) serve como atestado indiscutível de auditoria.
            </p>
          </div>

        </div>
      )}

    </div>
  );
};
