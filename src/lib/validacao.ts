import type { CampoDados, Pedido } from "../types/pedido";
import { hojeISO } from "./dataHora";

export type CampoValidado = CampoDados | "itens";
export type ErrosPedido = Partial<Record<CampoValidado, string>>;

/** Retorna as mensagens de erro por campo. Objeto vazio = pedido válido. */
export function validarPedido(
  pedido: Pedido,
  itens: number,
  hoje: string = hojeISO(),
): ErrosPedido {
  const { dados } = pedido;
  const erros: ErrosPedido = {};

  if (itens < 1) erros.itens = "Escolha pelo menos 1 morango.";
  if (!dados.nome.trim()) erros.nome = "Informe seu nome.";
  if (!dados.forma) erros.forma = "Escolha entrega ou retirada.";

  if (dados.forma === "entrega") {
    if (!dados.endereco.trim()) erros.endereco = "Informe o endereço completo.";
    if (!dados.referencia.trim()) erros.referencia = "Informe um ponto de referência.";
  }

  if (!dados.data) erros.data = "Escolha a data desejada.";
  else if (dados.data < hoje) erros.data = "Escolha uma data a partir de hoje.";
  if (!dados.horario) erros.horario = "Escolha o horário desejado.";

  return erros;
}
