import type { CampoDados, Pedido } from "../types/pedido";
import { hojeISO } from "./dataHora";
import type { Entrega } from "./entrega";

export type CampoValidado = CampoDados | "itens";
export type ErrosPedido = Partial<Record<CampoValidado, string>>;

/** Retorna as mensagens de erro por campo. Objeto vazio = pedido válido. */
export function validarPedido(
  pedido: Pedido,
  itens: number,
  entrega: Entrega,
  hoje: string = hojeISO(),
): ErrosPedido {
  const { dados } = pedido;
  const erros: ErrosPedido = {};

  if (itens < 1) erros.itens = "Escolha pelo menos 1 morango.";
  if (!dados.nome.trim()) erros.nome = "Informe seu nome.";
  if (entrega.tipo === "sem-bairro") erros.bairro = "Escolha seu bairro.";
  else if (entrega.tipo === "consultar")
    erros.bairro = "Consulte a taxa de entrega do seu bairro no WhatsApp.";
  if (!dados.endereco.trim()) erros.endereco = "Informe o endereço completo.";
  if (!dados.referencia.trim()) erros.referencia = "Informe um ponto de referência.";

  if (!dados.data) erros.data = "Escolha a data desejada.";
  else if (dados.data < hoje) erros.data = "Escolha uma data a partir de hoje.";
  if (!dados.horario) erros.horario = "Escolha o horário desejado.";

  return erros;
}
