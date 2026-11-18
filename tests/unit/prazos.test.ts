import { describe, expect, it } from "vitest";
import { NATAL } from "../../src/config/natal";
import {
  diaDaSemana,
  formatarDataBR,
  hojeNoFuso,
  podeComprarNatal,
  primeiraDataEntrega,
  revalidarEnvio,
  somarDias,
  validarDataEntrega,
  type RegrasPrazo,
} from "../../src/lib/prazos";

const REGRAS: RegrasPrazo = NATAL;

/** Horário de Campina Grande (UTC-3) → instante absoluto. */
const emCG = (dataHora: string) => new Date(`${dataHora}:00-03:00`);

describe("tabela 4.3 (docs/planejamento-atualizacao-natal.md)", () => {
  const exemplos: [string, string, string | null, boolean][] = [
    // pedido feito em (horário de CG), dia, primeira entrega, pode pedir Natal?
    ["2026-11-16T12:00", "seg", "2026-11-18", true],
    ["2026-11-17T12:00", "ter", "2026-11-19", true],
    ["2026-11-18T12:00", "qua", "2026-11-20", true],
    ["2026-12-18T23:59", "sex", "2026-12-20", true],
    ["2026-12-19T00:00", "sáb", null, false],
    ["2026-12-31T12:00", "qui", null, false],
  ];

  it.each(exemplos)("pedido em %s (%s)", (quando, dia, primeira, pode) => {
    const agora = emCG(quando);
    expect(diaDaSemana(hojeNoFuso(agora, REGRAS.fusoHorario))).toBe(dia);
    expect(podeComprarNatal(agora, REGRAS)).toBe(pode);
    if (primeira) expect(primeiraDataEntrega(agora, REGRAS)).toBe(primeira);
  });

  it("dias da semana da primeira entrega batem com a tabela", () => {
    expect(diaDaSemana("2026-11-18")).toBe("qua");
    expect(diaDaSemana("2026-11-19")).toBe("qui");
    expect(diaDaSemana("2026-11-20")).toBe("sex");
    expect(diaDaSemana("2026-12-20")).toBe("dom");
  });

  it("18/12 escolhendo entrega em 27/12: permitido (não limita a 18/12)", () => {
    const agora = emCG("2026-12-18T10:00");
    expect(podeComprarNatal(agora, REGRAS)).toBe(true);
    expect(validarDataEntrega("2026-12-27", agora, REGRAS, true)).toBeNull();
  });
});

describe("hojeNoFuso", () => {
  it("usa o fuso da loja, não o UTC nem o do aparelho", () => {
    // 18/12 23:59 em CG já é 19/12 02:59 em UTC.
    const agora = new Date("2026-12-19T02:59:00Z");
    expect(agora.toISOString().slice(0, 10)).toBe("2026-12-19");
    expect(hojeNoFuso(agora, "America/Fortaleza")).toBe("2026-12-18");
  });

  it("vira o dia à meia-noite de Campina Grande", () => {
    expect(hojeNoFuso(emCG("2026-12-18T23:59"), REGRAS.fusoHorario)).toBe("2026-12-18");
    expect(hojeNoFuso(emCG("2026-12-19T00:00"), REGRAS.fusoHorario)).toBe("2026-12-19");
  });
});

describe("primeiraDataEntrega", () => {
  it("conta dias corridos (sábado e domingo contam)", () => {
    // sex 18/12 → dom 20/12; qui 26/11 → sáb 28/11
    expect(primeiraDataEntrega(emCG("2026-12-18T08:00"), REGRAS)).toBe("2026-12-20");
    expect(primeiraDataEntrega(emCG("2026-11-26T08:00"), REGRAS)).toBe("2026-11-28");
  });

  it("atravessa mês e ano", () => {
    expect(somarDias("2026-11-30", 2)).toBe("2026-12-02");
    expect(somarDias("2026-12-31", 2)).toBe("2027-01-02");
  });

  it("usa a antecedência da config", () => {
    const regras = { ...REGRAS, antecedenciaDias: 3 };
    expect(primeiraDataEntrega(emCG("2026-11-18T12:00"), regras)).toBe("2026-11-21");
  });
});

describe("podeComprarNatal", () => {
  it("campanha desativada bloqueia mesmo dentro do prazo", () => {
    expect(podeComprarNatal(emCG("2026-11-18T12:00"), { ...REGRAS, ativo: false })).toBe(
      false,
    );
  });
});

describe("validarDataEntrega", () => {
  const agora = emCG("2026-11-18T12:00"); // primeira entrega: 20/11

  it("aceita a partir de hoje + 2", () => {
    expect(validarDataEntrega("2026-11-20", agora, REGRAS, true)).toBeNull();
    expect(validarDataEntrega("2026-11-19", agora, REGRAS, true)).toBe("antes-do-minimo");
    expect(validarDataEntrega("2026-11-18", agora, REGRAS, false)).toBe(
      "antes-do-minimo",
    );
  });

  it("data vazia ou inválida", () => {
    expect(validarDataEntrega("", agora, REGRAS, true)).toBe("vazia");
    expect(validarDataEntrega("20/11/2026", agora, REGRAS, true)).toBe("vazia");
  });

  it("sem limite final enquanto ultimaDataEntrega for null (P3)", () => {
    expect(REGRAS.ultimaDataEntrega).toBeNull();
    expect(REGRAS.datasSemEntrega).toEqual([]);
    expect(validarDataEntrega("2027-01-10", agora, REGRAS, true)).toBeNull();
  });

  it("ultimaDataEntrega limita só pedidos com Natal", () => {
    const regras = { ...REGRAS, ultimaDataEntrega: "2026-12-24" };
    expect(validarDataEntrega("2026-12-24", agora, regras, true)).toBeNull();
    expect(validarDataEntrega("2026-12-26", agora, regras, true)).toBe(
      "depois-do-limite",
    );
    expect(validarDataEntrega("2026-12-26", agora, regras, false)).toBeNull();
  });

  it("datasSemEntrega vale para qualquer pedido", () => {
    const regras = { ...REGRAS, datasSemEntrega: ["2026-12-25"] };
    expect(validarDataEntrega("2026-12-25", agora, regras, true)).toBe("sem-entrega");
    expect(validarDataEntrega("2026-12-25", agora, regras, false)).toBe("sem-entrega");
    expect(validarDataEntrega("2026-12-26", agora, regras, true)).toBeNull();
  });
});

describe("revalidarEnvio (página aberta e virou o dia)", () => {
  it("data que era válida às 23:59 fica inválida à 00:00", () => {
    const antes = revalidarEnvio("2026-11-20", emCG("2026-11-18T23:59"), REGRAS, false);
    const depois = revalidarEnvio("2026-11-20", emCG("2026-11-19T00:00"), REGRAS, false);
    expect(antes).toEqual({ natalEncerrado: false, erroData: null });
    expect(depois).toEqual({ natalEncerrado: false, erroData: "antes-do-minimo" });
  });

  it("carrinho com Natal enviado a partir de 19/12 00:00 fica encerrado", () => {
    expect(
      revalidarEnvio("2026-12-21", emCG("2026-12-18T23:59"), REGRAS, true).natalEncerrado,
    ).toBe(false);
    expect(
      revalidarEnvio("2026-12-21", emCG("2026-12-19T00:00"), REGRAS, true).natalEncerrado,
    ).toBe(true);
  });

  it("pedido só de morangos continua depois de 19/12", () => {
    expect(revalidarEnvio("2026-12-23", emCG("2026-12-21T09:00"), REGRAS, false)).toEqual(
      { natalEncerrado: false, erroData: null },
    );
  });
});

describe("formatarDataBR", () => {
  it("AAAA-MM-DD → dd/mm/aaaa", () => {
    expect(formatarDataBR("2026-12-20")).toBe("20/12/2026");
  });
});
