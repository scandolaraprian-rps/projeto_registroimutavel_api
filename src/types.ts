/**
 * @file types.ts
 * @description Definições de tipos e interfaces para o sistema de Registro Imutável de Eventos.
 */

export type NivelCriticidade = 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';

export type CategoriaEvento = 'BANCO_DE_DADOS' | 'FINANCEIRO' | 'SEGURANCA' | 'ACESSO' | 'INFRAESTRUTURA' | 'OUTROS';

export interface EventoCritico {
  id: string;
  usuario: string;
  acao: string;
  nivel: NivelCriticidade;
  categoria: CategoriaEvento;
  detalhes: string;
  timestampISO: string;
  timestampUnix: number;
  hashLocalSHA256?: string;
}

export interface AuditLogItem {
  id: string;
  ipfsHash: string; // CID retornado pela Pinata
  pinSize?: number;
  dadosEvento: EventoCritico;
  registradoEm: string;
  isSimulated: boolean;
  gatewayUrl: string;
}

export interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
}
