import type { Carrinho, DadosEntrega, Produto } from "../types/carrinho";
import type { ConfigLoja } from "../types/loja";
import type { Pedido } from "../types/pedido";
import { calcularTotaisCarrinho, montarLinhas } from "./carrinho";
import { formatarDataHorario } from "./dataHora";
import { resolverEntrega, taxaDaEntrega } from "./entrega";
import { formatarReais } from "./moeda";
import { formatarDataBR, hojeNoFuso } from "./prazos";
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

export interface PedidoCarrinho {
  carrinho: Carrinho;
  dados: DadosEntrega;
}

export interface ConfigMensagemCarrinho extends Pick<ConfigLoja, "entrega"> {
  catalogo: readonly Produto[];
  fusoHorario: string;
}

/**
 * Mensagem do carrinho (Natal 2026, docs/planejamento-atualizacao-natal.md, 5.1).
 * Com algum item de Natal: formato "🎄 ENCOMENDA DE NATAL", com preço e opções por
 * linha. Só morangos: formato de antes, com as linhas novas de entrega e de
 * "Pedido feito em". `agora` é o instante do envio (data do pedido no fuso da loja).
 * ATENÇÃO: o formato é contrato com a loja (ver tests/unit/mensagem.test.ts).
 */
export function montarMensagemCarrinho(
  pedido: PedidoCarrinho,
  config: ConfigMensagemCarrinho,
  agora: Date,
): string {
  const { carrinho, dados } = pedido;
  const linhas = montarLinhas(carrinho, config.catalogo);
  const entrega = resolverEntrega(dados, config.entrega);
  const totais = calcularTotaisCarrinho(
    carrinho,
    config.catalogo,
    taxaDaEntrega(entrega),
  );
  const bairro = entrega.tipo === "sem-bairro" ? "" : entrega.bairro;
  const natal = linhas.some((l) => l.produto.natal);

  const dataEntrega = [dados.data ? formatarDataBR(dados.data) : "", dados.periodo]
    .filter(Boolean)
    .join(" – ");
  const finais = [
    `Referência: ${dados.referencia.trim()}`,
    `Entrega: ${dataEntrega}`,
    `Pedido feito em: ${formatarDataBR(hojeNoFuso(agora, config.fusoHorario))}`,
  ];
  const obs = dados.observacoes.trim();
  if (obs) finais.push(`Obs: ${obs}`);
  const rodape = ["", "Segue o comprovante do Pix 👇"];

  if (!natal)
    return [
      "🍓 NOVO PEDIDO – ENTREGA",
      "",
      ...linhas.map((l) => `${l.item.quantidade}x ${l.produto.nome}`),
      `Subtotal: ${formatarReais(totais.subtotal)}`,
      `Entrega: ${formatarReais(totais.taxaEntrega)}`,
      `*Total: ${formatarReais(totais.total)}*`,
      "",
      `Nome: ${dados.nome.trim()}`,
      `Bairro: ${bairro}`,
      `Endereço: ${dados.endereco.trim()}`,
      ...finais,
      ...rodape,
    ].join("\n");

  const itens = linhas.flatMap((l) => [
    `${l.item.quantidade}x ${l.produto.nome} – ${formatarReais(l.subtotal)}`,
    ...l.opcoes.map(({ grupo, escolhidas }) => {
      const nomes = escolhidas.map((o) =>
        o.acrescimo > 0 ? `${o.nome} (+${formatarReais(o.acrescimo)})` : o.nome,
      );
      return `   ${grupo.rotulo}: ${nomes.join(", ")}`;
    }),
  ]);
  const endereco = [dados.endereco.trim(), bairro].filter(Boolean).join(" – ");

  return [
    "🎄 ENCOMENDA DE NATAL – ENTREGA",
    "",
    ...itens,
    "",
    `Subtotal: ${formatarReais(totais.subtotal)}`,
    `Entrega: ${formatarReais(totais.taxaEntrega)}${bairro ? ` (${bairro})` : ""}`,
    `*Total: ${formatarReais(totais.total)}*`,
    "",
    `Nome: ${dados.nome.trim()}`,
    `Endereço: ${endereco}`,
    ...finais,
    ...rodape,
  ].join("\n");
}

export function montarLinkWhatsApp(numero: string, mensagem: string): string {
  return `https://wa.me/${numero.replace(/\D/g, "")}?text=${encodeURIComponent(mensagem)}`;
}
