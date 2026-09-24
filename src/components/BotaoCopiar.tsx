import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

type Status = "parado" | "copiado" | "falhou";

async function copiarTexto(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    // Navegadores antigos ou sem permissão: tenta o método clássico.
    const area = document.createElement("textarea");
    area.value = texto;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

interface BotaoCopiarProps {
  texto: string;
  rotulo: string;
}

export function BotaoCopiar({ texto, rotulo }: BotaoCopiarProps) {
  const [status, setStatus] = useState<Status>("parado");

  useEffect(() => {
    if (status !== "copiado") return;
    const t = setTimeout(() => setStatus("parado"), 2500);
    return () => clearTimeout(t);
  }, [status]);

  async function aoClicar() {
    setStatus((await copiarTexto(texto)) ? "copiado" : "falhou");
  }

  const copiado = status === "copiado";

  return (
    <div>
      <button
        type="button"
        onClick={aoClicar}
        className={`flex min-h-14 w-full items-center justify-center gap-2 rounded-full px-6 text-lg font-extrabold transition active:scale-[0.98] ${
          copiado
            ? "bg-verde text-creme"
            : "border-2 border-verde bg-white text-verde hover:bg-verde/5"
        }`}
      >
        {copiado ? (
          <Check aria-hidden className="size-5" />
        ) : (
          <Copy aria-hidden className="size-5" />
        )}
        {copiado ? "Copiado!" : rotulo}
      </button>
      <p aria-live="polite" className="mt-2 min-h-5 text-center text-sm text-tinta/70">
        {status === "falhou" && `Não foi possível copiar. Copie manualmente: ${texto}`}
      </p>
    </div>
  );
}
