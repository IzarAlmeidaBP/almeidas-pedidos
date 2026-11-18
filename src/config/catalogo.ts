import { produtosMorango } from "../lib/carrinho";
import type { Produto } from "../types/carrinho";
import { LOJA } from "./loja";
import { NATAL, PRODUTOS_NATAL } from "./natal";

/** Morangos cravejados como produtos do carrinho (preço e sabores de `LOJA`). */
export const PRODUTOS_MORANGO: readonly Produto[] = produtosMorango(
  LOJA.sabores,
  LOJA.precoUnidade,
);

/**
 * Tudo o que pode entrar no carrinho. Com `ativo: false` (campanha encerrada de vez)
 * os produtos de Natal saem do site.
 */
export function montarCatalogo(natalAtivo: boolean): readonly Produto[] {
  return natalAtivo ? [...PRODUTOS_NATAL, ...PRODUTOS_MORANGO] : PRODUTOS_MORANGO;
}

export const CATALOGO: readonly Produto[] = montarCatalogo(NATAL.ativo);
