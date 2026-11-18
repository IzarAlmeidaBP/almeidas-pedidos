/**
 * Regras de data da campanha de Natal (docs/planejamento-atualizacao-natal.md, seção 4).
 * Todas recebem o instante atual (`agora`) por parâmetro: nunca usar `new Date()`
 * aqui dentro, para poder testar qualquer dia e horário.
 * Datas no formato do input date: AAAA-MM-DD.
 */

export interface RegrasPrazo {
  ativo: boolean;
  /** Último dia para pedir itens de Natal (inclusive). */
  ultimoDiaPedidos: string;
  /** Dias corridos (sábado e domingo contam). */
  antecedenciaDias: number;
  /** Último dia com entrega para pedidos com Natal; null = sem limite. */
  ultimaDataEntrega: string | null;
  /** Dias sem entrega (valem para qualquer pedido). */
  datasSemEntrega: readonly string[];
  fusoHorario: string;
}

export type ErroDataEntrega =
  "vazia" | "antes-do-minimo" | "depois-do-limite" | "sem-entrega";

const DIAS_SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"] as const;
export type DiaSemana = (typeof DIAS_SEMANA)[number];

const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;

/** Data de "hoje" no fuso da loja (e não no do aparelho do cliente). */
export function hojeNoFuso(agora: Date, fusoHorario: string): string {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: fusoHorario,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(agora);
  const valor = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((p) => p.type === tipo)?.value ?? "";
  return `${valor("year")}-${valor("month")}-${valor("day")}`;
}

function paraUTC(iso: string): Date {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a ?? 0, (m ?? 1) - 1, d ?? 1));
}

/** Soma dias corridos a uma data AAAA-MM-DD. */
export function somarDias(iso: string, dias: number): string {
  const data = paraUTC(iso);
  data.setUTCDate(data.getUTCDate() + dias);
  return data.toISOString().slice(0, 10);
}

export function diaDaSemana(iso: string): DiaSemana {
  return DIAS_SEMANA[paraUTC(iso).getUTCDay()] ?? "dom";
}

/** "2026-12-20" → "20/12/2026". */
export function formatarDataBR(iso: string): string {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

/** Pode fazer pedido novo com itens de Natal? Até o último dia, inclusive. */
export function podeComprarNatal(agora: Date, regras: RegrasPrazo): boolean {
  return regras.ativo && hojeNoFuso(agora, regras.fusoHorario) <= regras.ultimoDiaPedidos;
}

/** Hoje + antecedência, em dias corridos. */
export function primeiraDataEntrega(agora: Date, regras: RegrasPrazo): string {
  return somarDias(hojeNoFuso(agora, regras.fusoHorario), regras.antecedenciaDias);
}

/**
 * Confere a data de entrega escolhida. `temNatal` liga o limite `ultimaDataEntrega`
 * (pedido só de morangos não tem data final). Não limita a 18/12: a entrega pode ser
 * depois do último dia de pedidos.
 */
export function validarDataEntrega(
  data: string,
  agora: Date,
  regras: RegrasPrazo,
  temNatal: boolean,
): ErroDataEntrega | null {
  if (!DATA_ISO.test(data)) return "vazia";
  if (data < primeiraDataEntrega(agora, regras)) return "antes-do-minimo";
  if (temNatal && regras.ultimaDataEntrega && data > regras.ultimaDataEntrega)
    return "depois-do-limite";
  if (regras.datasSemEntrega.includes(data)) return "sem-entrega";
  return null;
}

export interface Revalidacao {
  /** O carrinho tem Natal, mas o prazo de pedidos acabou (virou 19/12). */
  natalEncerrado: boolean;
  /** A data escolhida deixou de valer (ex.: a página ficou aberta e virou o dia). */
  erroData: ErroDataEntrega | null;
}

/** Checagem no clique de "Enviar no WhatsApp". */
export function revalidarEnvio(
  data: string,
  agora: Date,
  regras: RegrasPrazo,
  temNatal: boolean,
): Revalidacao {
  return {
    natalEncerrado: temNatal && !podeComprarNatal(agora, regras),
    erroData: validarDataEntrega(data, agora, regras, temNatal),
  };
}
