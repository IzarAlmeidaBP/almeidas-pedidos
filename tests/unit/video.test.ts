import { describe, expect, it } from "vitest";
import { deveCarregarVideo } from "../../src/lib/video";

describe("deveCarregarVideo", () => {
  it("carrega em conexão boa ou desconhecida", () => {
    expect(deveCarregarVideo({ reduzirMovimento: false, tipoConexao: "4g" })).toBe(true);
    expect(deveCarregarVideo({ reduzirMovimento: false })).toBe(true);
  });

  it("não carrega em 3G, 2G ou slow-2g", () => {
    for (const tipoConexao of ["3g", "2g", "slow-2g"]) {
      expect(deveCarregarVideo({ reduzirMovimento: false, tipoConexao })).toBe(false);
    }
  });

  it("não carrega com economia de dados ou movimento reduzido", () => {
    expect(deveCarregarVideo({ reduzirMovimento: false, economiaDeDados: true })).toBe(
      false,
    );
    expect(deveCarregarVideo({ reduzirMovimento: true, tipoConexao: "4g" })).toBe(false);
  });
});
