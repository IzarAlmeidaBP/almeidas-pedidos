import type { ConfigEntrega } from "../types/loja";
import type { DadosCliente } from "../types/pedido";

/** Valor do campo `bairro` quando o cliente escolhe "Meu bairro não está na lista". */
export const BAIRRO_FORA_DA_LISTA = "fora-da-lista";

export interface OpcaoBairro {
  nome: string;
  /** null = sem taxa automática (consultar no WhatsApp). */
  taxa: number | null;
}

export type Entrega =
  | { tipo: "sem-bairro" }
  | { tipo: "com-taxa"; bairro: string; taxa: number }
  /** `bairro` pode vir vazio se o cliente ainda não digitou o nome. */
  | { tipo: "consultar"; bairro: string };

/** Minúsculas, sem acento e sem espaços extras (para busca e comparação). */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Todos os bairros da config (com taxa e "consultar") em ordem alfabética. */
export function listarBairros(entrega: ConfigEntrega): OpcaoBairro[] {
  const opcoes: OpcaoBairro[] = [
    ...entrega.faixas.flatMap((f) => f.bairros.map((nome) => ({ nome, taxa: f.taxa }))),
    ...entrega.consultar.map((nome) => ({ nome, taxa: null })),
  ];
  return opcoes.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

/** Filtra pelo trecho digitado, sem diferenciar acento nem maiúscula. */
export function filtrarBairros(opcoes: OpcaoBairro[], busca: string): OpcaoBairro[] {
  const termo = normalizar(busca);
  if (!termo) return opcoes;
  return opcoes.filter((o) => normalizar(o.nome).includes(termo));
}

/** Descobre a situação da entrega a partir do bairro escolhido. */
export function resolverEntrega(
  dados: Pick<DadosCliente, "bairro" | "bairroOutro">,
  entrega: ConfigEntrega,
): Entrega {
  if (dados.bairro === BAIRRO_FORA_DA_LISTA)
    return { tipo: "consultar", bairro: dados.bairroOutro.trim() };
  const opcao = listarBairros(entrega).find((o) => o.nome === dados.bairro);
  if (!opcao) return { tipo: "sem-bairro" };
  if (opcao.taxa === null) return { tipo: "consultar", bairro: opcao.nome };
  return { tipo: "com-taxa", bairro: opcao.nome, taxa: opcao.taxa };
}

/** Taxa que entra no total (0 enquanto não há taxa definida). */
export function taxaDaEntrega(entrega: Entrega): number {
  return entrega.tipo === "com-taxa" ? entrega.taxa : 0;
}

export function montarMensagemConsulta(bairro: string): string {
  return `Olá! Moro no bairro ${bairro.trim()} e gostaria de saber a taxa de entrega.`;
}
