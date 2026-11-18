import { describe, expect, it } from "vitest";
import { formatarTelefone } from "../../src/lib/mensagem";
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

describe("formatarTelefone", () => {
  it("tira o 55 e formata com DDD", () => {
    expect(formatarTelefone("558382025788")).toBe("(83) 8202-5788");
    expect(formatarTelefone("5583982025788")).toBe("(83) 98202-5788");
  });

  it("número curto demais volta como veio", () => {
    expect(formatarTelefone("123")).toBe("123");
  });
});
