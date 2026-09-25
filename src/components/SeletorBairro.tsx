import { useMemo, useState } from "react";
import { Check, MessageCircle, Search } from "lucide-react";
import { LOJA } from "../config/loja";
import {
  BAIRRO_FORA_DA_LISTA,
  filtrarBairros,
  listarBairros,
  montarMensagemConsulta,
  type Entrega,
} from "../lib/entrega";
import { montarLinkWhatsApp } from "../lib/mensagem";
import { formatarReais } from "../lib/moeda";
import { classeEntrada, MensagemErro } from "./Campo";

interface SeletorBairroProps {
  bairro: string;
  bairroOutro: string;
  entrega: Entrega;
  erro?: string;
  aoEscolher: (bairro: string) => void;
  aoDigitarOutro: (nome: string) => void;
  aoSair: () => void;
}

const OPCOES = listarBairros(LOJA.entrega);

/** Lista de bairros com busca; a taxa aparece ao lado de cada bairro. */
export function SeletorBairro({
  bairro,
  bairroOutro,
  entrega,
  erro,
  aoEscolher,
  aoDigitarOutro,
  aoSair,
}: SeletorBairroProps) {
  const [busca, setBusca] = useState("");
  const filtradas = useMemo(() => filtrarBairros(OPCOES, busca), [busca]);
  const foraDaLista = bairro === BAIRRO_FORA_DA_LISTA;
  const mostrarErro = erro && entrega.tipo === "sem-bairro";

  function escolherForaDaLista() {
    aoEscolher(BAIRRO_FORA_DA_LISTA);
    if (!bairroOutro.trim() && busca.trim()) aoDigitarOutro(busca.trim());
  }

  return (
    <fieldset
      aria-describedby={mostrarErro ? "bairro-erro" : undefined}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) aoSair();
      }}
    >
      <legend className="mb-1.5 font-bold text-verde">
        Bairro
        <span className="text-vinho" aria-hidden>
          {" "}
          *
        </span>
      </legend>

      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-tinta/45"
        />
        <input
          id="busca-bairro"
          type="search"
          inputMode="search"
          autoComplete="off"
          enterKeyHint="search"
          aria-label="Buscar bairro"
          aria-controls="lista-bairros"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar bairro"
          className={`${classeEntrada} border-creme-escuro pl-11`}
        />
      </div>

      <ul
        id="lista-bairros"
        aria-label="Bairros atendidos"
        className="mt-2 max-h-64 overflow-y-auto overscroll-contain rounded-2xl border-2 border-creme-escuro bg-white p-1"
      >
        {filtradas.map((o) => (
          <li key={o.nome}>
            <OpcaoRadio
              valor={o.nome}
              marcado={bairro === o.nome}
              aoEscolher={() => aoEscolher(o.nome)}
              nome={o.nome}
              detalhe={o.taxa === null ? "Consultar" : formatarReais(o.taxa)}
            />
          </li>
        ))}
        {filtradas.length === 0 && (
          <li className="px-3 py-2 text-sm text-tinta/65">Nenhum bairro encontrado.</li>
        )}
        <li className="mt-1 border-t border-creme-escuro pt-1">
          <OpcaoRadio
            valor={BAIRRO_FORA_DA_LISTA}
            marcado={foraDaLista}
            aoEscolher={escolherForaDaLista}
            nome="Meu bairro não está na lista"
          />
        </li>
      </ul>

      {entrega.tipo === "com-taxa" && (
        <p className="mt-2 text-sm text-tinta/75" aria-live="polite">
          Entrega para <strong className="text-verde">{entrega.bairro}</strong>:{" "}
          <strong className="text-verde">{formatarReais(entrega.taxa)}</strong>
        </p>
      )}

      {foraDaLista && (
        <div className="mt-3">
          <label htmlFor="bairro-outro" className="mb-1.5 block font-bold text-verde">
            Qual é o seu bairro?
          </label>
          <input
            id="bairro-outro"
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="words"
            enterKeyHint="done"
            value={bairroOutro}
            onChange={(e) => aoDigitarOutro(e.target.value)}
            className={`${classeEntrada} border-creme-escuro`}
          />
        </div>
      )}

      {entrega.tipo === "consultar" && (
        <div className="mt-3 rounded-2xl bg-rosa-claro px-4 py-3" aria-live="polite">
          <p className="text-tinta">
            A taxa de entrega
            {entrega.bairro ? ` para ${entrega.bairro}` : ""} é combinada pelo WhatsApp.
            Consulte antes de finalizar o pedido.
          </p>
          {entrega.bairro ? (
            <a
              href={montarLinkWhatsApp(
                LOJA.whatsapp,
                montarMensagemConsulta(entrega.bairro),
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-whatsapp px-5 py-2 text-center font-extrabold text-white transition hover:bg-whatsapp-escuro active:scale-[0.98]"
            >
              <MessageCircle aria-hidden className="size-5" />
              Consultar entrega no WhatsApp
            </a>
          ) : (
            <p className="mt-2 text-sm font-semibold text-vinho">
              Digite o nome do seu bairro para consultar.
            </p>
          )}
        </div>
      )}

      {mostrarErro && <MensagemErro id="bairro-erro">{erro}</MensagemErro>}
    </fieldset>
  );
}

function OpcaoRadio({
  valor,
  marcado,
  aoEscolher,
  nome,
  detalhe,
}: {
  valor: string;
  marcado: boolean;
  aoEscolher: () => void;
  nome: string;
  detalhe?: string;
}) {
  return (
    <label
      className={`relative flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-vinho ${
        marcado ? "bg-verde text-creme" : "text-tinta hover:bg-rosa-claro"
      }`}
    >
      <input
        type="radio"
        name="bairro"
        value={valor}
        checked={marcado}
        onChange={aoEscolher}
        className="sr-only"
      />
      <span className="flex items-center gap-2">
        {marcado && <Check aria-hidden className="size-4 shrink-0" />}
        {nome}
      </span>
      {detalhe && (
        <>
          {" "}
          <span
            className={`shrink-0 text-sm font-bold tabular-nums ${marcado ? "text-creme" : "text-verde"}`}
          >
            {detalhe}
          </span>
        </>
      )}
    </label>
  );
}
