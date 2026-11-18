import { describe, expect, it } from "vitest";
import { CATALOGO, PRODUTOS_MORANGO } from "../../src/config/catalogo";
import { PRODUTOS_NATAL } from "../../src/config/natal";
import {
  ESTADO_INICIAL,
  QUANTIDADE_MAXIMA,
  pedidoReducer,
  quantidadeNoCarrinho,
  type EstadoPedido,
} from "../../src/lib/pedidoReducer";
import type { Produto } from "../../src/types/carrinho";

const achar = (lista: readonly Produto[], id: string) => {
  const p = lista.find((x) => x.id === id);
  if (!p) throw new Error(id);
  return p;
};
const BRANCO = achar(PRODUTOS_MORANGO, "branco");
const MINI = achar(PRODUTOS_NATAL, "mini-guirlanda");
const OREO = achar(PRODUTOS_NATAL, "taca-oreo");

const morango = (estado: EstadoPedido, delta: number) =>
  pedidoReducer(estado, { type: "alterarMorango", produto: BRANCO, delta });

describe("pedidoReducer", () => {
  it("card de morango: soma, diminui e chega a 0 tirando a linha", () => {
    let estado = morango(morango(ESTADO_INICIAL, 1), 1);
    expect(quantidadeNoCarrinho(estado.carrinho, BRANCO)).toBe(2);
    expect(estado.carrinho).toHaveLength(1);
    estado = morango(estado, -5);
    expect(quantidadeNoCarrinho(estado.carrinho, BRANCO)).toBe(0);
    expect(estado.carrinho).toEqual([]);
    expect(morango(ESTADO_INICIAL, -1)).toBe(ESTADO_INICIAL);
  });

  it("card de morango respeita a quantidade máxima", () => {
    const estado = morango(ESTADO_INICIAL, QUANTIDADE_MAXIMA + 10);
    expect(quantidadeNoCarrinho(estado.carrinho, BRANCO)).toBe(QUANTIDADE_MAXIMA);
  });

  it("adiciona item com opções; escolha incompleta não entra", () => {
    const incompleto = pedidoReducer(ESTADO_INICIAL, {
      type: "adicionar",
      produto: MINI,
      escolhas: {},
      quantidade: 1,
    });
    expect(incompleto).toBe(ESTADO_INICIAL);

    const estado = pedidoReducer(ESTADO_INICIAL, {
      type: "adicionar",
      produto: MINI,
      escolhas: { recheio: ["oreo"] },
      quantidade: 2,
    });
    expect(estado.carrinho).toEqual([
      expect.objectContaining({ produtoId: "mini-guirlanda", quantidade: 2 }),
    ]);
  });

  it("− / + da linha fica entre 1 e o máximo; remover tira a linha", () => {
    let estado = pedidoReducer(ESTADO_INICIAL, {
      type: "adicionar",
      produto: OREO,
      escolhas: {},
      quantidade: 1,
    });
    const chave = estado.carrinho[0]?.chave ?? "";
    estado = pedidoReducer(estado, { type: "alterarItem", chave, delta: -3 });
    expect(estado.carrinho[0]?.quantidade).toBe(1);
    estado = pedidoReducer(estado, { type: "alterarItem", chave, delta: 2 });
    expect(estado.carrinho[0]?.quantidade).toBe(3);
    estado = pedidoReducer(estado, { type: "removerItem", chave });
    expect(estado.carrinho).toEqual([]);
  });

  it("atualiza dados do cliente sem mexer nos outros campos", () => {
    let estado = pedidoReducer(ESTADO_INICIAL, {
      type: "atualizarDado",
      campo: "nome",
      valor: "Ana",
    });
    estado = pedidoReducer(estado, {
      type: "atualizarDado",
      campo: "periodo",
      valor: "Tarde",
    });
    expect(estado.dados.nome).toBe("Ana");
    expect(estado.dados.periodo).toBe("Tarde");
    expect(estado.dados.referencia).toBe("");
  });

  it("alterna entre montagem e pagamento mantendo o pedido", () => {
    const comItem = morango(ESTADO_INICIAL, 1);
    const pagando = pedidoReducer(comItem, { type: "irParaPagamento" });
    expect(pagando.etapa).toBe("pagamento");
    const voltou = pedidoReducer(pagando, {
      type: "voltarParaEdicao",
      aviso: "Escolha outra data.",
    });
    expect(voltou.etapa).toBe("montando");
    expect(voltou.aviso).toBe("Escolha outra data.");
    expect(voltou.carrinho).toEqual(comItem.carrinho);
  });

  it("fim do Natal: tira só os itens de Natal, volta para edição e avisa", () => {
    let estado = morango(ESTADO_INICIAL, 2);
    estado = pedidoReducer(estado, {
      type: "adicionar",
      produto: OREO,
      escolhas: {},
      quantidade: 1,
    });
    estado = pedidoReducer(estado, {
      type: "adicionar",
      produto: MINI,
      escolhas: { recheio: ["oreo"] },
      quantidade: 1,
    });
    estado = pedidoReducer(estado, { type: "irParaPagamento" });

    const encerrado = pedidoReducer(estado, {
      type: "encerrarNatal",
      catalogo: CATALOGO,
    });
    expect(encerrado.carrinho.map((i) => i.produtoId)).toEqual(["branco"]);
    expect(encerrado.etapa).toBe("montando");
    expect(encerrado.aviso).toBe(
      "As encomendas de Natal foram encerradas. 2 itens de Natal saíram do seu carrinho.",
    );

    // Sem itens de Natal, nada muda (não repete o aviso).
    const fechado = pedidoReducer(encerrado, { type: "fecharAviso" });
    expect(fechado.aviso).toBeNull();
    expect(pedidoReducer(fechado, { type: "encerrarNatal", catalogo: CATALOGO })).toBe(
      fechado,
    );
  });

  it("aviso no singular", () => {
    const estado = pedidoReducer(ESTADO_INICIAL, {
      type: "adicionar",
      produto: OREO,
      escolhas: {},
      quantidade: 3,
    });
    expect(
      pedidoReducer(estado, { type: "encerrarNatal", catalogo: CATALOGO }).aviso,
    ).toBe(
      "As encomendas de Natal foram encerradas. 1 item de Natal saiu do seu carrinho.",
    );
  });
});
