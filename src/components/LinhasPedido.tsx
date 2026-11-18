import { textosOpcoes, type LinhaCarrinho } from "../lib/carrinho";
import { formatarReais } from "../lib/moeda";

/** Lista só de leitura (resumo lateral e tela de pagamento). */
export function LinhasPedido({ linhas }: { linhas: LinhaCarrinho[] }) {
  return (
    <ul className="space-y-2">
      {linhas.map((l) => (
        <li key={l.item.chave} className="flex justify-between gap-3">
          <span className="min-w-0">
            {l.item.quantidade}x {l.produto.nome}
            {textosOpcoes(l).map((t) => (
              <span key={t} className="block text-sm text-tinta/65">
                {t}
              </span>
            ))}
          </span>
          <span className="shrink-0 tabular-nums">{formatarReais(l.subtotal)}</span>
        </li>
      ))}
    </ul>
  );
}
