/**
 * @file pinataService.ts
 * @description Serviço responsável por comunicar com a API do Pinata e publicar dados no IPFS.
 * 
 * REGRA DE NEGÓCIO:
 * Para garantir a imutabilidade do registro ("Não confiar, verificar"), os logs de eventos
 * críticos são convertidos em JSON e enviados à rede descentralizada IPFS via Pinata.
 * O IPFS gera um CID (Content Identifier) derivado do conteúdo exato do arquivo.
 * Qualquer alteração no conteúdo resultará em um CID completamente diferente,
 * impossibilitando a manipulação silenciosa de histórico de auditoria.
 */

import { EventoCritico, PinataResponse } from '../types';
import { calcularHashSHA256 } from '../utils/cryptoUtils';

/**
 * CONSTANTE DE CONFIGURAÇÃO DE TOKEN DA PINATA
 * Você pode inserir seu JWT Bearer Token da Pinata aqui ou configurá-lo na UI da aplicação.
 * Obtenha sua chave gratuita em: https://app.pinata.cloud/developer/api-keys
 */
export const CONSTANTE_PINATA_JWT = '';

/**
 * Registra um evento crítico na rede descentralizada IPFS através da API da Pinata.
 * 
 * @param dadosEvento Objeto contendo os dados do evento de compliance
 * @param tokenBearer JWT de autenticação da Pinata (se não informado, utiliza a constante)
 * @param usarSimulacao Se true, gera um CID imutável localmente para fins de teste/demonstração
 * @returns Objeto com o IpfsHash (CID) e metadados da publicação
 */
export async function registrarLogNoIPFS(
  dadosEvento: EventoCritico,
  tokenBearer?: string,
  usarSimulacao: boolean = false
): Promise<{ ipfsHash: string; pinSize: number; isSimulated: boolean; gatewayUrl: string }> {
  
  // Define o token ativo (Parâmetro -> Constante do Script -> Variável de Ambiente)
  const tokenAtivo = tokenBearer?.trim() || CONSTANTE_PINATA_JWT.trim();

  // Se o usuário solicitou simulação ou não possui token configurado
  if (usarSimulacao || (!tokenAtivo && process.env.NODE_ENV !== 'test')) {
    if (!usarSimulacao && !tokenAtivo) {
      throw new Error(
        'Token JWT do Pinata não configurado! Insira um Bearer Token válido no painel de configurações ou ative o "Modo Simulação IPFS" para testar sem API Key.'
      );
    }

    // MODO SIMULAÇÃO: Gera um CID imutável baseado no SHA-256 do payload do evento
    const hash = await calcularHashSHA256(dadosEvento);
    // Simula atraso de rede descentralizada (800ms)
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Formato CIDv1 simulado legível para representação gráfica
    const ipfsHashSimulado = `bafkrei${hash.substring(0, 38)}`;
    
    return {
      ipfsHash: ipfsHashSimulado,
      pinSize: JSON.stringify(dadosEvento).length,
      isSimulated: true,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHashSimulado}`,
    };
  }

  // --------------------------------------------------------------------------
  // INTEGRAÇÃO REAL COM A API PINATA (requisito 3 e 4 da especificação)
  // --------------------------------------------------------------------------
  try {
    // 1. Montagem da estrutura de dados conforme exigido pela documentação da Pinata
    const payloadPinata = {
      // pinataContent: Dados que serão efetivamente salvos e tornados imutáveis no IPFS
      pinataContent: {
        ...dadosEvento,
        _metadataAudit: {
          registradoPor: 'SistemaDeRegistroImutavelV1',
          versaoPadrao: '1.0.0',
          dataRegistroUTC: new Date().toISOString(),
        }
      },
      // pinataMetadata: Metadados para organização dentro do dashboard da Pinata
      pinataMetadata: {
        name: `LOG_AUDITORIA_${dadosEvento.categoria}_${dadosEvento.timestampUnix}`,
        keyvalues: {
          nivel: dadosEvento.nivel,
          usuario: dadosEvento.usuario,
          acao: dadosEvento.acao.substring(0, 30),
          categoria: dadosEvento.categoria,
        },
      },
    };

    // 2. Requisição HTTP POST nativa usando a Fetch API com async/await
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Cabeçalho de autorização Bearer com o JWT
        'Authorization': `Bearer ${tokenAtivo}`,
      },
      body: JSON.stringify(payloadPinata),
    });

    // 3. Verificação do status de resposta HTTP
    if (!response.ok) {
      let mensagemErro = `Erro HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData?.error?.details || errorData?.error) {
          mensagemErro = `Erro Pinata API (${response.status}): ${
            typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error)
          }`;
        }
      } catch {
        // Falha ao parsear JSON de erro
      }

      if (response.status === 401) {
        throw new Error('Falha de Autenticação (401): O JWT Token da Pinata informado é inválido ou expirou. Verifique suas credenciais.');
      } else if (response.status === 403) {
        throw new Error('Acesso Negado (403): Sua chave API da Pinata não possui permissão para pinJSONToIPFS.');
      } else if (response.status === 429) {
        throw new Error('Limite de Requisições (429): Muitas solicitações enviadas para a Pinata. Aguarde alguns instantes.');
      }

      throw new Error(mensagemErro);
    }

    // 4. Leitura do resultado retornado pela Pinata
    const data: PinataResponse = await response.json();

    if (!data.IpfsHash) {
      throw new Error('A resposta da API do Pinata não retornou um IpfsHash válido.');
    }

    return {
      ipfsHash: data.IpfsHash,
      pinSize: data.PinSize || JSON.stringify(dadosEvento).length,
      isSimulated: false,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
    };

  } catch (erro: unknown) {
    // Tratamento centralizado de erros de rede ou exceções da requisição
    console.error('[PinataService] Erro ao registrar log no IPFS:', erro);
    
    if (erro instanceof Error) {
      throw erro;
    } else {
      throw new Error('Erro desconhecido de conexão com a rede IPFS/Pinata.');
    }
  }
}

/**
 * Testa se um Token JWT da Pinata é válido realizando uma chamada de verificação de autenticação.
 */
export async function testarTokenPinata(tokenBearer: string): Promise<boolean> {
  if (!tokenBearer) return false;
  try {
    const res = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenBearer.trim()}`,
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}
