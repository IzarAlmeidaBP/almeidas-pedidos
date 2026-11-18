import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { BotaoCopiar } from "../components/BotaoCopiar";
import { LinhasPedido } from "../components/LinhasPedido";
import { LOJA } from "../config/loja";
import { TEXTOS_NATAL } from "../config/natal";
import {
  formatarTelefone,
  montarLinkWhatsApp,
  montarMensagemCarrinho,
} from "../lib/mensagem";
import { formatarReais } from "../lib/moeda";
import { formatarDataBR, revalidarEnvio } from "../lib/prazos";
import { textoErroData } from "../lib/validacao";
import { usePedido } from "../state/PedidoContext";

export function Pagamento() {
  const {
    estado,
    dispatch,
    catalogo,
    regras,
    agora,
    relogio,
    linhas,
    temNatal,
    totais,
    entrega,
  } = usePedido();
  const { dados } = estado;
  const titulo = useRef<HTMLHeadingElement>(null);
  /** Texto enviado (plano B, se o WhatsApp não abrir). */
  const [enviado, setEnviado] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    titulo.current?.focus();
  }, []);

  const mensagem = (instante: Date) =>
    montarMensagemCarrinho(
      { carrinho: estado.carrinho, dados },
      { entrega: LOJA.entrega, catalogo, fusoHorario: regras.fusoHorario },
      instante,
    );

  /**
   * Revalida no clique: se a página ficou aberta e virou o dia, a data (ou o prazo
   * do Natal) pode ter deixado de valer. Nesse caso não abre o WhatsApp.
   */
  function aoEnviar(evento: MouseEvent<HTMLAnchorElement>) {
    const instante = relogio();
    const { natalEncerrado, erroData } = revalidarEnvio(
      dados.data,
      instante,
      regras,
      temNatal,
    );
    if (natalEncerrado) {
      evento.preventDefault();
      dispatch({ type: "encerrarNatal", catalogo });
      return;
    }
    if (erroData) {
      evento.preventDefault();
      dispatch({
        type: "voltarParaEdicao",
        aviso: `A data de entrega escolhida não está mais disponível. ${textoErroData(erroData, instante, regras)}`,
      });
      return;
    }
    const texto = mensagem(instante);
    evento.currentTarget.href = montarLinkWhatsApp(LOJA.whatsapp, texto);
    setEnviado(texto);
  }

  return (
    <section aria-labelledby="titulo-pagamento" className="secao conteudo animate-surgir">
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

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="font-extrabold text-verde">Resumo do pedido</h2>
          <div className="mt-3">
            <LinhasPedido linhas={linhas} />
          </div>
          <dl className="mt-3 space-y-2 border-t border-creme-escuro pt-3 text-tinta/80">
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
            <p className="text-sm tracking-widest text-creme/80 uppercase">Total</p>
            <p className="text-4xl font-extrabold tabular-nums">
              {formatarReais(totais.total)}
            </p>
          </div>
          <p className="mt-4 text-sm text-tinta/75">
            {dados.nome.trim()} · Entrega em {formatarDataBR(dados.data)} ({dados.periodo}
            ) · {dados.endereco.trim()}
          </p>
        </div>

        <div className="rounded-3xl border-2 border-rosa bg-rosa-claro/60 p-6">
          <h2 className="font-extrabold text-verde">Pagamento antecipado via Pix</h2>
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
          href={montarLinkWhatsApp(LOJA.whatsapp, mensagem(agora))}
          onClick={aoEnviar}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-16 w-full items-center justify-center gap-2 rounded-full bg-whatsapp px-4 text-base font-extrabold text-white shadow-lg transition hover:bg-whatsapp-escuro active:scale-[0.98] min-[360px]:px-6 min-[360px]:text-lg"
        >
          <MessageCircle aria-hidden className="size-6" />
          Enviar pedido no WhatsApp
        </a>

        {enviado !== null && (
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="font-extrabold text-verde">O WhatsApp não abriu?</h2>
            <p className="mt-1 text-tinta/80">
              Copie o pedido abaixo e envie para{" "}
              <strong className="whitespace-nowrap text-verde">
                {formatarTelefone(LOJA.whatsapp)}
              </strong>
              .
            </p>
            <label htmlFor="texto-pedido" className="sr-only">
              Texto do pedido
            </label>
            <textarea
              id="texto-pedido"
              readOnly
              rows={8}
              value={enviado}
              className="mt-3 w-full rounded-2xl border-2 border-creme-escuro bg-creme px-3 py-2 text-base text-tinta"
            />
            <div className="mt-3">
              <BotaoCopiar texto={enviado} rotulo="Copiar pedido" />
            </div>
          </div>
        )}

        {temNatal && (
          <p className="rounded-3xl border border-dourado bg-verde px-6 py-4 text-center font-titulo text-2xl leading-snug text-creme">
            {TEXTOS_NATAL.mensagemFinal}
          </p>
        )}

        <button
          type="button"
          onClick={() => dispatch({ type: "voltarParaEdicao" })}
          className="mx-auto flex min-h-12 items-center gap-2 rounded-full px-6 font-bold text-vinho underline-offset-4 hover:underline"
        >
          <ArrowLeft aria-hidden className="size-5" />
          Voltar e editar pedido
        </button>
      </div>
    </section>
  );
}
