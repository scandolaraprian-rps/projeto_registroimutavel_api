/**
 * @file mockPinataFetch.ts
 * @description Simulador (Mock) da API Pinata para testes locais de UI/DOM.
 * 
 * Permite validar:
 * - O indicador visual de "Carregando / Registrando na rede IPFS..." durante o delay simulado.
 * - O recebimento do CID (IpfsHash) e exibição do Card de Auditoria no cenário de Sucesso.
 * - O tratamento do bloco `try/catch` e exibição da mensagem de erro vermelha no cenário de Erro.
 */

import { EventoCritico, PinataResponse } from '../types';

/**
 * Interface para opções adicionais da requisição mock.
 */
export interface MockPinataOptions {
  simularErro?: boolean;
  tipoErro?: '401_UNAUTHORIZED' | '500_SERVER_ERROR' | 'NETWORK_FAILURE';
  delayMs?: number;
}

/**
 * Função Mock para simular a chamada nativa de `fetch` para o endpoint da Pinata.
 * 
 * @param dados Payload do evento a ser simular o envio para o IPFS
 * @param simularErro Se true, simula uma falha de API ou rede
 * @param options Opções adicionais como tipo de erro ou tempo de delay em ms (padrão: 1800ms)
 * @returns Promise com a estrutura da resposta HTTP/JSON da Pinata API
 */
export function mockPinataFetch(
  dados: EventoCritico,
  simularErro: boolean = false,
  options: MockPinataOptions = {}
): Promise<{ ok: boolean; status: number; statusText: string; json: () => Promise<PinataResponse> }> {
  
  const delay = options.delayMs ?? 1800; // Delay de 1.8 segundos por padrão para testar o feedback de carregamento
  const tipoErro = options.tipoErro ?? '401_UNAUTHORIZED';

  return new Promise((resolve, reject) => {
    // 1. Simulação de tempo de latência de rede (Network Latency)
    setTimeout(() => {
      
      // 2. CENÁRIO DE ERRO (simularErro = true)
      if (simularErro) {
        if (tipoErro === 'NETWORK_FAILURE') {
          // Simula falha de conexão física/offline
          return reject(new TypeError('Failed to fetch: TypeError NetworkError when attempting to fetch resource.'));
        }

        if (tipoErro === '500_SERVER_ERROR') {
          // Simula erro 500 no servidor da Pinata
          return resolve({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            json: async () => ({
              IpfsHash: '',
              PinSize: 0,
              Timestamp: new Date().toISOString(),
              error: { details: 'Pinata Gateway overload or internal server malfunction.' }
            } as unknown as PinataResponse)
          });
        }

        // Padrão: Erro 401 de Autenticação
        return resolve({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          json: async () => ({
            IpfsHash: '',
            PinSize: 0,
            Timestamp: new Date().toISOString(),
            error: { details: 'INVALID_BEARER_TOKEN: O JWT Token informado é inválido ou expirou.' }
          } as unknown as PinataResponse)
        });
      }

      // 3. CENÁRIO DE SUCESSO (simularErro = false)
      // Gera um CID v1 fictício determinístico com formato válido de IPFS
      const hashAleatorio = Array.from({ length: 32 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      const mockIpfsHash = `bafkrei${hashAleatorio}`;

      const mockResponseData: PinataResponse = {
        IpfsHash: mockIpfsHash,
        PinSize: JSON.stringify(dados).length,
        Timestamp: new Date().toISOString(),
        isDuplicate: false,
      };

      // Retorna uma imitação do objeto Response do fetch nativo
      resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => mockResponseData,
      });

    }, delay);
  });
}
