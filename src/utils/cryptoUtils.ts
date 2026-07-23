/**
 * @file cryptoUtils.ts
 * @description Utilitários de criptografia e formatação para auditoria Web3.
 */

/**
 * Calcula o hash SHA-256 do payload do evento para prova local de integridade.
 * @param obj Objeto do evento a ser tipado
 * @returns Hash hexadecimal em string
 */
export async function calcularHashSHA256(obj: unknown): Promise<string> {
  const jsonStr = JSON.stringify(obj);
  const encoder = new TextEncoder();
  const data = encoder.encode(jsonStr);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Formata data no padrão brasileiro
 */
export function formatarDataHora(dataIso: string): string {
  try {
    const d = new Date(dataIso);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return dataIso;
  }
}

/**
 * Copia texto para a área de transferência com suporte a navegadores modernos
 */
export async function copiarParaClipboard(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch (err) {
    console.error('Falha ao copiar:', err);
    return false;
  }
}
