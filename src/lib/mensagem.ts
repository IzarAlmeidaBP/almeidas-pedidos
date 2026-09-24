import type { Pedido } from "../types/pedido";
import { formatarDataHorario } from "./dataHora";
import { formatarReais } from "./moeda";
import { calcularTotais, type ConfigPreco } from "./total";

/**
 * Monta a mensagem do WhatsApp.
 * ATENÇÃO: o formato é contrato com a loja. Só mudar com pedido explícito
 * da dona do projeto e atualizando tests/unit/mensagem.test.ts.
 */
export function montarMensagem(pedido: Pedido, config: ConfigPreco): string {
  const { quantidades, dados } = pedido;
  const entrega = dados.forma === "entrega";
  const totais = calcularTotais(quantidades, dados.forma, config);

  const itens = config.sabores
    .filter((sabor) => (quantidades[sabor.id] ?? 0) > 0)
    .map((sabor) => `${quantidades[sabor.id]}x ${sabor.nome}`);

  const valores = [`Subtotal: ${formatarReais(totais.subtotal)}`];
  if (entrega) valores.push(`Entrega: ${formatarReais(totais.taxaEntrega)}`);
  valores.push(`*Total: ${formatarReais(totais.total)}*`);

  const cliente = [`Nome: ${dados.nome.trim()}`];
  if (entrega) {
    cliente.push(`Endereço: ${dados.endereco.trim()}`);
    cliente.push(`Referência: ${dados.referencia.trim()}`);
  }
  cliente.push(`Data/horário: ${formatarDataHorario(dados.data, dados.horario)}`);
  const obs = dados.observacoes.trim();
  if (obs) cliente.push(`Obs: ${obs}`);

  return [
    `🍓 NOVO PEDIDO – ${entrega ? "ENTREGA" : "RETIRADA"}`,
    "",
    ...itens,
    ...valores,
    "",
    ...cliente,
    "",
    "Segue o comprovante do Pix 👇",
  ].join("\n");
}

export function montarLinkWhatsApp(numero: string, mensagem: string): string {
  return `https://wa.me/${numero.replace(/\D/g, "")}?text=${encodeURIComponent(mensagem)}`;
}
