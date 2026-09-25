import { describe, expect, it } from "vitest";
import { LOJA } from "../../src/config/loja";
import {
  BAIRRO_FORA_DA_LISTA,
  filtrarBairros,
  listarBairros,
  montarMensagemConsulta,
  normalizar,
  resolverEntrega,
  taxaDaEntrega,
} from "../../src/lib/entrega";

const OPCOES = listarBairros(LOJA.entrega);
const nomes = (busca: string) => filtrarBairros(OPCOES, busca).map((o) => o.nome);

describe("listarBairros", () => {
  it("junta todos os bairros da config em ordem alfabética", () => {
    expect(OPCOES).toHaveLength(38 + 21 + 1);
    const ordenados = [...OPCOES].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    expect(OPCOES).toEqual(ordenados);
    expect(OPCOES[0]?.nome).toBe("Acácio Figueiredo");
    expect(OPCOES.at(-1)?.nome).toBe("Vila Cabral");
  });

  it("não repete bairro entre as faixas", () => {
    const unicos = new Set(OPCOES.map((o) => normalizar(o.nome)));
    expect(unicos.size).toBe(OPCOES.length);
  });

  it("traz a taxa de cada bairro (null = consultar)", () => {
    const taxa = (nome: string) => OPCOES.find((o) => o.nome === nome)?.taxa;
    expect(taxa("Catolé")).toBe(8);
    expect(taxa("Bodocongó")).toBe(10);
    expect(taxa("Cidades")).toBeNull();
  });
});

describe("filtrarBairros", () => {
  it("busca sem acento encontra bairro com acento", () => {
    expect(nomes("bodocongo")).toEqual(["Bodocongó", "Novo Bodocongó"]);
    expect(nomes("sao jose")).toEqual(["São José", "São José da Mata"]);
  });

  it("busca com acento e maiúscula também funciona", () => {
    expect(nomes("CATOLÉ")).toEqual(["Catolé", "Catolé de Zé Ferreira"]);
    expect(nomes("  Três  ")).toEqual(["Três Irmãs"]);
  });

  it("busca vazia devolve tudo e busca sem resultado devolve lista vazia", () => {
    expect(nomes("")).toHaveLength(OPCOES.length);
    expect(nomes("Velame")).toEqual([]);
  });
});

describe("resolverEntrega", () => {
  const resolver = (bairro: string, bairroOutro = "") =>
    resolverEntrega({ bairro, bairroOutro }, LOJA.entrega);

  it("bairro de R$ 8,00", () => {
    const entrega = resolver("Centro");
    expect(entrega).toEqual({ tipo: "com-taxa", bairro: "Centro", taxa: 8 });
    expect(taxaDaEntrega(entrega)).toBe(8);
  });

  it("bairro de R$ 10,00", () => {
    expect(resolver("Malvinas")).toEqual({
      tipo: "com-taxa",
      bairro: "Malvinas",
      taxa: 10,
    });
  });

  it("Cidades: sem taxa automática, consultar no WhatsApp", () => {
    const entrega = resolver("Cidades");
    expect(entrega).toEqual({ tipo: "consultar", bairro: "Cidades" });
    expect(taxaDaEntrega(entrega)).toBe(0);
  });

  it("bairro fora da lista usa o nome digitado e não calcula taxa", () => {
    expect(resolver(BAIRRO_FORA_DA_LISTA, "  Velame ")).toEqual({
      tipo: "consultar",
      bairro: "Velame",
    });
  });

  it("sem bairro ou bairro desconhecido fica sem taxa", () => {
    expect(resolver("")).toEqual({ tipo: "sem-bairro" });
    expect(resolver("Atlântida")).toEqual({ tipo: "sem-bairro" });
    expect(taxaDaEntrega({ tipo: "sem-bairro" })).toBe(0);
  });
});

describe("montarMensagemConsulta", () => {
  it("monta a pergunta da taxa com o bairro", () => {
    expect(montarMensagemConsulta(" Velame ")).toBe(
      "Olá! Moro no bairro Velame e gostaria de saber a taxa de entrega.",
    );
  });
});
