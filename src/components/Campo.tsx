import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";

interface CampoProps {
  id: string;
  rotulo: string;
  obrigatorio?: boolean;
  erro?: string;
  dica?: string;
  children: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
    className: string;
  }) => ReactNode;
}

export const classeEntrada =
  "w-full rounded-2xl border-2 bg-white px-4 py-3 text-base text-tinta placeholder:text-tinta/40 transition focus:border-verde focus:outline-none";

export function Campo({ id, rotulo, obrigatorio, erro, dica, children }: CampoProps) {
  const idErro = `${id}-erro`;
  const idDica = `${id}-dica`;
  const descritores = [dica ? idDica : null, erro ? idErro : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-bold text-verde">
        {rotulo}
        {obrigatorio ? (
          <span className="text-vinho" aria-hidden>
            {" "}
            *
          </span>
        ) : (
          <span className="font-normal text-tinta/60"> (opcional)</span>
        )}
      </label>
      {children({
        id,
        "aria-invalid": Boolean(erro),
        "aria-describedby": descritores || undefined,
        className: `${classeEntrada} ${erro ? "border-vinho" : "border-creme-escuro"}`,
      })}
      {dica && (
        <p id={idDica} className="mt-1 text-sm text-tinta/65">
          {dica}
        </p>
      )}
      {erro && <MensagemErro id={idErro}>{erro}</MensagemErro>}
    </div>
  );
}

export function MensagemErro({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p
      id={id}
      className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-vinho"
    >
      <CircleAlert aria-hidden className="size-4 shrink-0" />
      {children}
    </p>
  );
}
