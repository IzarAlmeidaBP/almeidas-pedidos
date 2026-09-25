import { useEffect, useRef } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { BotaoCopiar } from "../components/BotaoCopiar";
import { LOJA } from "../config/loja";
import { formatarDataHorario } from "../lib/dataHora";
import { montarLinkWhatsApp, montarMensagem } from "../lib/mensagem";
import { formatarReais } from "../lib/moeda";
import { usePedido } from "../state/PedidoContext";

export function Pagamento() {
  const { estado, dispatch, totais, entrega } = usePedido();
  const { dados, quantidades } = estado;
  const titulo = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    titulo.current?.focus();
  }, []);

  const link = montarLinkWhatsApp(LOJA.whatsapp, montarMensagem(estado, LOJA));

  return (
    <section aria-labelledby="titulo-pagamento" className="animate-surgir px-4 py-10">
      <div className="mx-auto max-w-md space-y-6">
        <header className="text-center">
          <h1
            id="titulo-pagamento"
            ref={titulo}
            tabIndex={-1}
            className="font-titulo text-5xl text-vinho focus:outline-none"
          >
            Quase lá!
          </h1>
          <p className="mt-2 text-tinta/75">Confira o pedido e faça o Pix.</p>
        </header>

        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="font-extrabold text-verde">Resumo do pedido</h2>
          <ul className="mt-3 space-y-1.5">
            {LOJA.sabores
              .filter((s) => (quantidades[s.id] ?? 0) > 0)
              .map((s) => {
                const qtd = quantidades[s.id] ?? 0;
                return (
                  <li key={s.id} className="flex justify-between gap-3">
                    <span>
                      {qtd}x {s.nome}
                    </span>
                    <span className="tabular-nums">
                      {formatarReais(qtd * LOJA.precoUnidade)}
                    </span>
                  </li>
                );
              })}
          </ul>
          <dl className="mt-3 space-y-1.5 border-t border-creme-escuro pt-3 text-tinta/80">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatarReais(totais.subtotal)}</dd>
            </div>
            {entrega.tipo === "com-taxa" && (
              <div className="flex justify-between gap-3">
                <dt>Bairro</dt>
                <dd className="text-right">{entrega.bairro}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Entrega</dt>
              <dd className="tabular-nums">{formatarReais(totais.taxaEntrega)}</dd>
            </div>
          </dl>
          <div className="mt-4 rounded-2xl bg-verde px-4 py-4 text-center text-creme">
            <p className="text-sm uppercase tracking-widest text-creme/80">Total</p>
            <p className="text-4xl font-extrabold tabular-nums">
              {formatarReais(totais.total)}
            </p>
          </div>
          <p className="mt-4 text-sm text-tinta/75">
            {dados.nome.trim()} · {formatarDataHorario(dados.data, dados.horario)}·{" "}
            {dados.endereco.trim()}
          </p>
        </div>

        <div className="rounded-3xl border-2 border-rosa bg-rosa-claro/60 p-5">
          <h2 className="font-extrabold text-verde">Pagamento via Pix</h2>
          <dl className="mt-3 space-y-2">
            <div>
              <dt className="text-sm text-tinta/70">Chave Pix ({LOJA.pix.tipo})</dt>
              {/* Chave aleatória tem 36 caracteres: quebra linha em vez de vazar. */}
              <dd className="text-lg leading-snug font-extrabold break-all text-verde sm:text-xl">
                {LOJA.pix.chave}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-tinta/70">Titular</dt>
              <dd className="font-bold">{LOJA.pix.titular}</dd>
            </div>
          </dl>
          <div className="mt-4">
            <BotaoCopiar texto={LOJA.pix.chave} rotulo="Copiar chave Pix" />
          </div>
        </div>

        <p className="text-center text-lg font-bold text-verde">
          Faça o Pix, tire o print do comprovante e envie pelo WhatsApp no botão abaixo.
        </p>

        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-16 w-full items-center justify-center gap-2 rounded-full bg-whatsapp px-4 text-base font-extrabold min-[360px]:px-6 min-[360px]:text-lg text-white shadow-lg transition hover:bg-whatsapp-escuro active:scale-[0.98]"
        >
          <MessageCircle aria-hidden className="size-6" />
          Enviar pedido no WhatsApp
        </a>

        <button
          type="button"
          onClick={() => dispatch({ type: "voltarParaEdicao" })}
          className="mx-auto flex min-h-12 items-center gap-2 rounded-full px-5 font-bold text-vinho underline-offset-4 hover:underline"
        >
          <ArrowLeft aria-hidden className="size-5" />
          Voltar e editar pedido
        </button>
      </div>
    </section>
  );
}
