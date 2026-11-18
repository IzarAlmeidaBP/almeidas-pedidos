import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { IMAGENS } from "../../src/config/imagens";
import {
  NATAL,
  PERIODOS_ENTREGA,
  PRODUTOS_NATAL,
  TEXTOS_NATAL,
} from "../../src/config/natal";

/** Conferência item a item com a seção 3 de docs/planejamento-atualizacao-natal.md. */
const produto = (id: string) => {
  const p = PRODUTOS_NATAL.find((x) => x.id === id);
  if (!p) throw new Error(`produto ${id} não encontrado`);
  return p;
};
const nomes = (id: string, grupo: string) =>
  produto(id)
    .grupos.find((g) => g.id === grupo)
    ?.opcoes.map((o) => o.nome);

describe("catálogo de Natal (seção 3)", () => {
  it("textos da página", () => {
    expect(TEXTOS_NATAL.titulo).toBe("Natal 2026");
    expect(TEXTOS_NATAL.subtitulo).toBe(
      "Sobremesas feitas com carinho para adoçar a sua ceia.",
    );
    expect(TEXTOS_NATAL.selo).toBe("✦ Encomendas até 18 de dezembro ✦");
    expect(TEXTOS_NATAL.mensagemFinal).toBe(
      "Feliz Natal! A Almeida's agradece por fazer parte dos seus momentos especiais. Que seu Natal seja ainda mais doce!",
    );
    expect(TEXTOS_NATAL.encerrado).toBe(
      "Encomendas de Natal encerradas 🎄 Obrigada pelo carinho!",
    );
  });

  it("Como encomendar (3.5)", () => {
    expect(TEXTOS_NATAL.comoEncomendar.map((c) => [c.titulo, c.texto])).toEqual([
      [
        "Faça seu pedido!",
        "Escolha seus produtos favoritos e faça sua encomenda diretamente pelo nosso site.",
      ],
      [
        "Encomendas de Natal até 18 de dezembro de 2026.",
        "Garanta seu Natal doce fazendo seu pedido com antecedência!",
      ],
      [
        "Somente entrega.",
        "Não trabalhamos com retirada. A entrega é realizada mediante taxa fixa por bairro, com os valores apresentados durante a compra no site.",
      ],
      [
        "Pagamento antecipado.",
        "O pagamento deverá ser realizado antecipadamente para confirmar a encomenda.",
      ],
    ]);
  });

  it("Guirlanda de Natal (3.1)", () => {
    const g = produto("guirlanda-natal");
    expect(g.nome).toBe("Guirlanda de Natal");
    expect(g.preco).toBe(135);
    expect(g.descricao).toBe(
      "Uma deliciosa guirlanda natalina feita com massa de brownie, molhadinha por dentro e com uma casquinha por cima. Personalize escolhendo seu recheio e seus toppings favoritos.",
    );
    expect(g.grupos.map((x) => [x.titulo, x.tipo, x.min, x.max])).toEqual([
      ["Recheio de cima", "unica", 1, 1],
      ["Toppings", "multipla", 2, 2],
      ["Adicionais especiais", "multipla", 0, 2],
    ]);
    expect(nomes("guirlanda-natal", "recheio")).toEqual([
      "Leite Ninho",
      "Oreo",
      "Chocolate ao leite",
      "Chocolate meio amargo",
    ]);
    expect(nomes("guirlanda-natal", "toppings")).toEqual([
      "Oreo",
      "Docinho de Ninho",
      "Docinho de Brigadeiro",
      "Morango",
    ]);
    const adicionais = g.grupos.find((x) => x.id === "adicionais")?.opcoes;
    expect(adicionais?.map((o) => [o.nome, o.acrescimo])).toEqual([
      ["Kinder Bueno", 10],
      ["Ferrero Rocher", 10],
    ]);
    // Recheio e toppings não têm acréscimo.
    for (const grupo of ["recheio", "toppings"])
      expect(
        g.grupos.find((x) => x.id === grupo)?.opcoes.every((o) => o.acrescimo === 0),
      ).toBe(true);
  });

  it("Mini Guirlanda (3.2)", () => {
    const m = produto("mini-guirlanda");
    expect(m.nome).toBe("Mini Guirlanda");
    expect(m.preco).toBe(35);
    expect(m.descricao).toBe(
      "Uma versão delicada da nossa guirlanda natalina, perfeita para presentear alguém especial! Feita com massa de brownie, molhadinha por dentro e com uma casquinha por cima.",
    );
    expect(m.selo).toBe("🎁 Acompanha uma caixinha linda para presentear");
    expect(m.grupos.map((x) => [x.titulo, x.tipo, x.min, x.max])).toEqual([
      ["Recheio de cima", "unica", 1, 1],
    ]);
    expect(nomes("mini-guirlanda", "recheio")).toEqual([
      "Oreo",
      "Chocolate branco",
      "Chocolate preto",
    ]);
  });

  it("Sobremesas na Taça (3.3), na ordem 01 a 07, sem opções", () => {
    const tacas = PRODUTOS_NATAL.filter((p) => p.categoria === "tacas");
    expect(tacas.map((t) => [t.nome, t.preco, t.descricao])).toEqual([
      [
        "Taça Brownie",
        105,
        "Camada de creme de chocolate branco, camada de creme de chocolate preto, camada de brownie e pedaços de brownie.",
      ],
      [
        "Taça Uva",
        95,
        "Creme de Ninho com uvas e uma leve camada de creme de chocolate, coberta com uvas.",
      ],
      [
        "Taça Oreo",
        105,
        "Creme de Oreo, camada de chocolate, camada de creme de chocolate branco e camada do biscoito Oreo.",
      ],
      [
        "Taça Dois Amores",
        100,
        "Uma combinação deliciosa de creme de chocolate branco com creme de chocolate preto.",
      ],
      [
        "Taça Surpresa de Nutella",
        135,
        "Camada de creme de Ninho, camada de chantilly, camada de Nutella, camada de creme de chocolate e camada de morango.",
      ],
      [
        "Taça Ninho com Morango",
        110,
        "Camada de creme de Ninho, camada de chantilly e morangos.",
      ],
      [
        "Taça Encanto de Morango",
        125,
        "Creme de chocolate preto, creme de chocolate branco, camada de chantilly e morangos.",
      ],
    ]);
    expect(tacas.every((t) => t.grupos.length === 0)).toBe(true);
    expect(PRODUTOS_NATAL).toHaveLength(9);
  });

  it("todos são de Natal, com ids únicos", () => {
    expect(PRODUTOS_NATAL.every((p) => p.natal)).toBe(true);
    expect(new Set(PRODUTOS_NATAL.map((p) => p.id)).size).toBe(PRODUTOS_NATAL.length);
  });

  it("cada foto existe (900 e 480) e está registrada em imagens.ts", () => {
    for (const p of PRODUTOS_NATAL) {
      const info = IMAGENS[p.foto];
      expect(info, p.foto).toBeDefined();
      expect(existsSync(`public${p.foto}`), p.foto).toBe(true);
      for (const menor of info?.menores ?? [])
        expect(existsSync(`public${menor.src}`), menor.src).toBe(true);
    }
  });
});

describe("configuração de prazos (4.1)", () => {
  it("valores combinados", () => {
    expect(NATAL).toEqual({
      ativo: true,
      ultimoDiaPedidos: "2026-12-18",
      antecedenciaDias: 2,
      ultimaDataEntrega: null,
      datasSemEntrega: [],
      fusoHorario: "America/Fortaleza",
    });
    expect(PERIODOS_ENTREGA).toEqual(["Manhã", "Tarde", "Noite"]);
  });
});
