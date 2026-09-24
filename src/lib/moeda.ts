const numero = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formata um valor em reais com espaço comum: "R$ 42,00". */
export function formatarReais(valor: number): string {
  return `R$ ${numero.format(valor)}`;
}
