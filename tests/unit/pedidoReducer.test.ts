import { describe, expect, it } from "vitest";
import {
  ESTADO_INICIAL,
  QUANTIDADE_MAXIMA,
  pedidoReducer,
} from "../../src/lib/pedidoReducer";

describe("pedidoReducer", () => {
  it("aumenta e diminui a quantidade, sem passar de 0", () => {
    let estado = pedidoReducer(ESTADO_INICIAL, {
      type: "alterarQuantidade",
      id: "branco",
      delta: 1,
    });
    estado = pedidoReducer(estado, { type: "alterarQuantidade", id: "branco", delta: 1 });
    expect(estado.quantidades.branco).toBe(2);
    estado = pedidoReducer(estado, {
      type: "alterarQuantidade",
      id: "branco",
      delta: -5,
    });
    expect(estado.quantidades.branco).toBe(0);
  });

  it("respeita a quantidade máxima", () => {
    const estado = pedidoReducer(ESTADO_INICIAL, {
      type: "alterarQuantidade",
      id: "preto",
      delta: QUANTIDADE_MAXIMA + 10,
    });
    expect(estado.quantidades.preto).toBe(QUANTIDADE_MAXIMA);
  });

  it("atualiza dados do cliente sem mexer nos outros campos", () => {
    let estado = pedidoReducer(ESTADO_INICIAL, {
      type: "atualizarDado",
      campo: "nome",
      valor: "Ana",
    });
    estado = pedidoReducer(estado, {
      type: "atualizarDado",
      campo: "endereco",
      valor: "Rua X, 123",
    });
    expect(estado.dados.nome).toBe("Ana");
    expect(estado.dados.endereco).toBe("Rua X, 123");
    expect(estado.dados.referencia).toBe("");
    estado = pedidoReducer(estado, {
      type: "atualizarDado",
      campo: "bairro",
      valor: "Catolé",
    });
    expect(estado.dados.bairro).toBe("Catolé");
    expect(estado.dados.nome).toBe("Ana");
  });

  it("alterna entre montagem e pagamento mantendo o pedido", () => {
    const comItem = pedidoReducer(ESTADO_INICIAL, {
      type: "alterarQuantidade",
      id: "branco",
      delta: 1,
    });
    const pagando = pedidoReducer(comItem, { type: "irParaPagamento" });
    expect(pagando.etapa).toBe("pagamento");
    const voltou = pedidoReducer(pagando, { type: "voltarParaEdicao" });
    expect(voltou.etapa).toBe("montando");
    expect(voltou.quantidades.branco).toBe(1);
  });
});
