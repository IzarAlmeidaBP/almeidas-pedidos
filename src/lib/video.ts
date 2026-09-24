export interface CondicoesVideo {
  /** Usuário pediu "reduzir movimento" no sistema. */
  reduzirMovimento: boolean;
  /** Modo de economia de dados ligado (navigator.connection.saveData). */
  economiaDeDados?: boolean;
  /** navigator.connection.effectiveType: "slow-2g" | "2g" | "3g" | "4g". */
  tipoConexao?: string;
}

/** Em conexão lenta, economia de dados ou movimento reduzido, fica só a foto. */
export function deveCarregarVideo(c: CondicoesVideo): boolean {
  if (c.reduzirMovimento || c.economiaDeDados) return false;
  return !["slow-2g", "2g", "3g"].includes(c.tipoConexao ?? "");
}
