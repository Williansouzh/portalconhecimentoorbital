"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUI } from "./UIProvider";
import type { SessionUser } from "@/lib/auth";

const PAPEL: Record<string, string> = { leitor: "Leitor", autor: "Autor", curador: "Curador" };

export default function ContaForm({ user, email }: { user: SessionUser; email: string }) {
  const router = useRouter();
  const { showToast } = useUI();
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [problemas, setProblemas] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setProblemas([]);

    if (nova !== confirmacao) {
      setProblemas(["A confirmação não confere com a nova senha."]);
      return;
    }

    setSalvando(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ atual, nova }),
      });
      const dados = await res.json().catch(() => ({}));

      if (!res.ok) {
        setProblemas(
          dados.problemas ?? [
            dados.error === "senha_atual_incorreta" ? "A senha atual está incorreta." : "Não foi possível trocar agora.",
          ]
        );
        setSalvando(false);
        return;
      }

      showToast("Senha alterada — entre novamente");
      router.replace("/login");
      router.refresh();
    } catch {
      setProblemas(["Não foi possível trocar agora."]);
      setSalvando(false);
    }
  }

  return (
    <main className="main-loose">
      <div className="page-wrap-article" style={{ maxWidth: 620 }}>
        <h1 style={{ margin: "0 0 8px", font: "600 34px/1.15 var(--font-head)", letterSpacing: "-.015em" }}>Sua conta</h1>
        <p style={{ margin: "0 0 24px", font: "400 16.5px/1.6 var(--font-body)", color: "var(--text2)" }}>
          {user.name} · {email} · {PAPEL[user.role] ?? user.role}
        </p>

        <div className="card card-pad">
          <h2 style={{ margin: "0 0 4px", font: "600 19px/1.3 var(--font-head)" }}>Trocar senha</h2>
          <p style={{ margin: "0 0 18px", font: "400 14px/1.5 var(--font-body)", color: "var(--text2)" }}>
            Ao trocar a senha, as sessões abertas em outros dispositivos são encerradas.
          </p>

          <form onSubmit={submeter} style={{ display: "grid", gap: 16 }}>
            <div>
              <label htmlFor="atual" className="field-label">
                Senha atual
              </label>
              <input id="atual" type="password" className="input" autoComplete="current-password" required value={atual} onChange={(e) => setAtual(e.target.value)} />
            </div>
            <div>
              <label htmlFor="nova" className="field-label">
                Nova senha
              </label>
              <input id="nova" type="password" className="input" autoComplete="new-password" required value={nova} onChange={(e) => setNova(e.target.value)} />
              <p className="field-hint">Ao menos 10 caracteres, com maiúscula, minúscula e número.</p>
            </div>
            <div>
              <label htmlFor="confirmacao" className="field-label">
                Confirme a nova senha
              </label>
              <input id="confirmacao" type="password" className="input" autoComplete="new-password" required value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} />
            </div>

            {problemas.length > 0 && (
              <div role="alert" className="alert alert-danger" style={{ padding: "12px 14px" }}>
                <span className="alert-icon" aria-hidden="true" style={{ width: 22, height: 22, fontSize: 12 }}>
                  ✕
                </span>
                <span style={{ font: "400 13.5px/1.6 var(--font-body)", color: "var(--text2)" }}>
                  {problemas.map((p) => (
                    <span key={p} style={{ display: "block" }}>
                      {p}
                    </span>
                  ))}
                </span>
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={salvando} style={{ justifySelf: "start" }}>
              {salvando ? "Trocando…" : "Trocar senha"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
