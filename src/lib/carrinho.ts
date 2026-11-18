import type {
  Carrinho,
  Escolhas,
  GrupoOpcoes,
  ItemCarrinho,
  Produto,
} from "../types/carrinho";
import type { Sabor } from "../types/loja";
import type { Totais } from "../types/pedido";
import { QUANTIDADE_MAXIMA } from "./pedidoReducer";

const centavos = (valor: number) => Math.round(valor * 100);

/** Os sabores de morango como produtos do carrinho (sem opções, fora do Natal). */
export function produtosMorango(
  sabores: readonly Sabor[],
  precoUnidade: number,
): Produto[] {
  return sabores.map((s) => ({
    id: s.id,
    nome: s.nome,
    categoria: "morangos",
    preco: precoUnidade,
    descricao: s.descricao,
    foto: s.foto,
    natal: false,
    grupos: [],
  }));
}

/** Escolhe ou desmarca uma opção respeitando o tipo e o máximo do grupo. */
export function alternarOpcao(
  grupo: GrupoOpcoes,
  escolhidas: readonly string[],
  opcaoId: string,
): string[] {
  if (!grupo.opcoes.some((o) => o.id === opcaoId)) return [...escolhidas];
  if (grupo.tipo === "unica") return [opcaoId];
  if (escolhidas.includes(opcaoId)) return escolhidas.filter((id) => id !== opcaoId);
  if (escolhidas.length >= grupo.max) return [...escolhidas];
  return [...escolhidas, opcaoId];
}

/** Mensagem do que falta em cada grupo. Objeto vazio = pode adicionar ao pedido. */
export function validarEscolhas(
  produto: Produto,
  escolhas: Escolhas,
): Record<string, string> {
  const erros: Record<string, string> = {};
  for (const grupo of produto.grupos) {
    const validas = (escolhas[grupo.id] ?? []).filter((id) =>
      grupo.opcoes.some((o) => o.id === id),
    );
    const qtd = new Set(validas).size;
    if (qtd < grupo.min || qtd > grupo.max) erros[grupo.id] = textoLimite(grupo);
  }
  return erros;
}

function textoLimite(grupo: GrupoOpcoes): string {
  if (grupo.min === grupo.max)
    return grupo.min === 1 ? "Escolha 1 opção." : `Escolha ${grupo.min} opções.`;
  if (grupo.min === 0) return `Escolha até ${grupo.max} opções.`;
  return `Escolha de ${grupo.min} a ${grupo.max} opções.`;
}

/** Preço de 1 unidade com os acréscimos das opções escolhidas. */
export function precoUnitario(produto: Produto, escolhas: Escolhas): number {
  let total = centavos(produto.preco);
  for (const grupo of produto.grupos)
    for (const opcao of grupo.opcoes)
      if (escolhas[grupo.id]?.includes(opcao.id)) total += centavos(opcao.acrescimo);
  return total / 100;
}

/**
 * Identifica a linha do carrinho: mesmo produto + mesmas opções = mesma chave,
 * sem importar a ordem em que as opções foram escolhidas.
 */
export function chaveItem(produto: Produto, escolhas: Escolhas): string {
  const partes = produto.grupos.map(
    (g) => `${g.id}=${[...(escolhas[g.id] ?? [])].sort().join("+")}`,
  );
  return [produto.id, ...partes].join("|");
}

/** Só guarda grupos e opções que existem no produto, sem repetição. */
function limparEscolhas(produto: Produto, escolhas: Escolhas): Escolhas {
  return Object.fromEntries(
    produto.grupos.map((g) => [
      g.id,
      [...new Set(escolhas[g.id] ?? [])].filter((id) =>
        g.opcoes.some((o) => o.id === id),
      ),
    ]),
  );
}

const limitar = (qtd: number) => Math.min(QUANTIDADE_MAXIMA, Math.max(1, qtd));

/**
 * Adiciona ao carrinho. Escolhas incompletas não entram (retorna o mesmo carrinho).
 * A mesma combinação soma na linha que já existe.
 */
export function adicionarItem(
  carrinho: Carrinho,
  produto: Produto,
  escolhas: Escolhas,
  quantidade = 1,
): Carrinho {
  if (Object.keys(validarEscolhas(produto, escolhas)).length > 0) return carrinho;
  if (!Number.isInteger(quantidade) || quantidade < 1) return carrinho;
  const limpas = limparEscolhas(produto, escolhas);
  const chave = chaveItem(produto, limpas);
  if (carrinho.some((i) => i.chave === chave))
    return carrinho.map((i) =>
      i.chave === chave ? { ...i, quantidade: limitar(i.quantidade + quantidade) } : i,
    );
  const item: ItemCarrinho = {
    chave,
    produtoId: produto.id,
    escolhas: limpas,
    quantidade: limitar(quantidade),
  };
  return [...carrinho, item];
}

/** − / + da linha: fica entre 1 e o máximo (para tirar, usar `removerItem`). */
export function alterarQuantidadeItem(
  carrinho: Carrinho,
  chave: string,
  delta: number,
): Carrinho {
  return carrinho.map((i) =>
    i.chave === chave ? { ...i, quantidade: limitar(i.quantidade + delta) } : i,
  );
}

export function removerItem(carrinho: Carrinho, chave: string): Carrinho {
  return carrinho.filter((i) => i.chave !== chave);
}

export interface LinhaCarrinho {
  item: ItemCarrinho;
  produto: Produto;
  precoUnitario: number;
  subtotal: number;
  /** Grupos com pelo menos 1 opção escolhida, na ordem do produto. */
  opcoes: { grupo: GrupoOpcoes; escolhidas: GrupoOpcoes["opcoes"][number][] }[];
}

/** Junta cada item ao produto do catálogo. Itens de produto desconhecido somem. */
export function montarLinhas(
  carrinho: Carrinho,
  catalogo: readonly Produto[],
): LinhaCarrinho[] {
  return carrinho.flatMap((item) => {
    const produto = catalogo.find((p) => p.id === item.produtoId);
    if (!produto || !Number.isInteger(item.quantidade) || item.quantidade < 1) return [];
    const unitario = precoUnitario(produto, item.escolhas);
    const opcoes = produto.grupos
      .map((grupo) => ({
        grupo,
        escolhidas: (item.escolhas[grupo.id] ?? []).flatMap((id) => {
          const opcao = grupo.opcoes.find((o) => o.id === id);
          return opcao ? [opcao] : [];
        }),
      }))
      .filter((o) => o.escolhidas.length > 0);
    return [
      {
        item,
        produto,
        precoUnitario: unitario,
        subtotal: (centavos(unitario) * item.quantidade) / 100,
        opcoes,
      },
    ];
  });
}

/** Tem algum item de Natal no carrinho? */
export function temItensNatal(carrinho: Carrinho, catalogo: readonly Produto[]): boolean {
  return montarLinhas(carrinho, catalogo).some((l) => l.produto.natal);
}

/** Tira os itens de Natal (fim do prazo) e devolve quantas linhas saíram. */
export function removerItensNatal(
  carrinho: Carrinho,
  catalogo: readonly Produto[],
): { carrinho: Carrinho; removidos: number } {
  const natal = new Set(catalogo.filter((p) => p.natal).map((p) => p.id));
  const restante = carrinho.filter((i) => !natal.has(i.produtoId));
  return { carrinho: restante, removidos: carrinho.length - restante.length };
}

/** Totais em centavos. A taxa de entrega só entra se houver pelo menos 1 item. */
export function calcularTotaisCarrinho(
  carrinho: Carrinho,
  catalogo: readonly Produto[],
  taxaEntrega: number,
): Totais {
  const linhas = montarLinhas(carrinho, catalogo);
  const itens = linhas.reduce((soma, l) => soma + l.item.quantidade, 0);
  const subtotal = linhas.reduce((soma, l) => soma + centavos(l.subtotal), 0);
  const taxa = itens > 0 ? centavos(taxaEntrega) : 0;
  return {
    itens,
    subtotal: subtotal / 100,
    taxaEntrega: taxa / 100,
    total: (subtotal + taxa) / 100,
  };
}
