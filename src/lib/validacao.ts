import type { CampoDados, DadosCliente } from "../types/pedido";
import type { Entrega } from "./entrega";
import {
  formatarDataBR,
  primeiraDataEntrega,
  validarDataEntrega,
  type ErroDataEntrega,
  type RegrasPrazo,
} from "./prazos";

export type CampoValidado = CampoDados | "itens";
export type ErrosPedido = Partial<Record<CampoValidado, string>>;

export interface ContextoValidacao {
  /** Quantidade de unidades no carrinho. */
  itens: number;
  entrega: Entrega;
  /** O carrinho tem algum item de Natal? */
  temNatal: boolean;
  /** Instante atual (injetado para poder testar). */
  agora: Date;
  regras: RegrasPrazo;
}

/** Texto do erro de data para o cliente. */
export function textoErroData(
  erro: ErroDataEntrega,
  agora: Date,
  regras: RegrasPrazo,
): string {
  switch (erro) {
    case "vazia":
      return "Escolha a data da entrega.";
    case "antes-do-minimo":
      return `Os pedidos precisam de ${regras.antecedenciaDias} dias de antecedência: escolha a partir de ${formatarDataBR(primeiraDataEntrega(agora, regras))}.`;
    case "depois-do-limite":
      return `A última data de entrega é ${formatarDataBR(regras.ultimaDataEntrega ?? "")}.`;
    case "sem-entrega":
      return "Não há entrega nessa data. Escolha outra.";
  }
}

/** Retorna as mensagens de erro por campo. Objeto vazio = pedido válido. */
export function validarPedido(dados: DadosCliente, ctx: ContextoValidacao): ErrosPedido {
  const erros: ErrosPedido = {};

  if (ctx.itens < 1) erros.itens = "Escolha pelo menos 1 item.";
  if (!dados.nome.trim()) erros.nome = "Informe seu nome.";
  if (ctx.entrega.tipo === "sem-bairro") erros.bairro = "Escolha seu bairro.";
  else if (ctx.entrega.tipo === "consultar")
    erros.bairro = "Consulte a taxa de entrega do seu bairro no WhatsApp.";
  if (!dados.endereco.trim()) erros.endereco = "Informe o endereço completo.";
  if (!dados.referencia.trim()) erros.referencia = "Informe um ponto de referência.";

  const erroData = validarDataEntrega(dados.data, ctx.agora, ctx.regras, ctx.temNatal);
  if (erroData) erros.data = textoErroData(erroData, ctx.agora, ctx.regras);
  if (!dados.periodo) erros.periodo = "Escolha o horário preferido.";

  return erros;
}
