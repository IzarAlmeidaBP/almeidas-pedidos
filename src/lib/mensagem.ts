import type { ConfigLoja } from "../types/loja";
import type { Pedido } from "../types/pedido";
import { formatarDataHorario } from "./dataHora";
import { resolverEntrega, taxaDaEntrega } from "./entrega";
import { formatarReais } from "./moeda";
import { calcularTotais, type ConfigPreco } from "./total";

export type ConfigMensagem = ConfigPreco & Pick<ConfigLoja, "entrega">;

/**
 * Monta a mensagem do WhatsApp.
 * ATENÇÃO: o formato é contrato com a loja. Só mudar com pedido explícito
 * da dona do projeto e atualizando tests/unit/mensagem.test.ts.
 */
export function montarMensagem(pedido: Pedido, config: ConfigMensagem): string {
  const { quantidades, dados } = pedido;
  const entrega = resolverEntrega(dados, config.entrega);
  const totais = calcularTotais(quantidades, taxaDaEntrega(entrega), config);
  const bairro = entrega.tipo === "sem-bairro" ? "" : entrega.bairro;

  const itens = config.sabores
    .filter((sabor) => (quantidades[sabor.id] ?? 0) > 0)
    .map((sabor) => `${quantidades[sabor.id]}x ${sabor.nome}`);

  const cliente = [
    `Nome: ${dados.nome.trim()}`,
    `Bairro: ${bairro}`,
    `Endereço: ${dados.endereco.trim()}`,
    `Referência: ${dados.referencia.trim()}`,
    `Data/horário: ${formatarDataHorario(dados.data, dados.horario)}`,
  ];
  const obs = dados.observacoes.trim();
  if (obs) cliente.push(`Obs: ${obs}`);

  return [
    "🍓 NOVO PEDIDO – ENTREGA",
    "",
    ...itens,
    `Subtotal: ${formatarReais(totais.subtotal)}`,
    `Entrega: ${formatarReais(totais.taxaEntrega)}`,
    `*Total: ${formatarReais(totais.total)}*`,
    "",
    ...cliente,
    "",
    "Segue o comprovante do Pix 👇",
  ].join("\n");
}

export function montarLinkWhatsApp(numero: string, mensagem: string): string {
  return `https://wa.me/${numero.replace(/\D/g, "")}?text=${encodeURIComponent(mensagem)}`;
}
