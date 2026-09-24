import { describe, expect, it } from "vitest";
import { formatarDataHorario, hojeISO } from "../../src/lib/dataHora";
import { formatarReais } from "../../src/lib/moeda";

describe("formatarReais", () => {
  it("usa vírgula decimal e espaço comum depois do R$", () => {
    expect(formatarReais(42)).toBe("R$ 42,00");
    expect(formatarReais(8.5)).toBe("R$ 8,50");
    expect(formatarReais(0)).toBe("R$ 0,00");
  });

  it("separa milhares com ponto", () => {
    expect(formatarReais(1400)).toBe("R$ 1.400,00");
  });
});

describe("formatarDataHorario", () => {
  it("hora cheia vira '15h'", () => {
    expect(formatarDataHorario("2026-09-26", "15:00")).toBe("26/09 às 15h");
  });

  it("hora quebrada vira '9h30' sem zero à esquerda", () => {
    expect(formatarDataHorario("2026-12-03", "09:30")).toBe("03/12 às 9h30");
  });

  it("aceita campos vazios sem quebrar", () => {
    expect(formatarDataHorario("2026-09-26", "")).toBe("26/09");
    expect(formatarDataHorario("", "")).toBe("");
  });
});

describe("hojeISO", () => {
  it("usa a data local no formato do input date", () => {
    expect(hojeISO(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });
});
