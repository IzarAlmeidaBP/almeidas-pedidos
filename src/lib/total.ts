import type { ConfigLoja } from "../types/loja";
import type { FormaRecebimento, Quantidades, Totais } from "../types/pedido";

export type ConfigPreco = Pick<ConfigLoja, "precoUnidade" | "taxaEntrega" | "sabores">;

/** Soma só os sabores que existem na config, ignorando valores inválidos. */
export function contarItens(quantidades: Quantidades, config: ConfigPreco): number {
  return config.sabores.reduce((soma, sabor) => {
    const qtd = quantidades[sabor.id] ?? 0;
    return soma + (Number.isInteger(qtd) && qtd > 0 ? qtd : 0);
  }, 0);
}

/** Calcula em centavos para evitar erro de arredondamento. */
export function calcularTotais(
  quantidades: Quantidades,
  forma: FormaRecebimento | "",
  config: ConfigPreco,
): Totais {
  const itens = contarItens(quantidades, config);
  const subtotalCentavos = itens * Math.round(config.precoUnidade * 100);
  const taxaCentavos =
    forma === "entrega" && itens > 0 ? Math.round(config.taxaEntrega * 100) : 0;
  return {
    itens,
    subtotal: subtotalCentavos / 100,
    taxaEntrega: taxaCentavos / 100,
    total: (subtotalCentavos + taxaCentavos) / 100,
  };
}
