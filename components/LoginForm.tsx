"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { SearchIcon } from "./Icons";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError(res.status === 401 ? "E-mail ou senha incorretos." : "Não foi possível entrar agora. Tente de novo.");
        setLoading(false);
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError("Não foi possível entrar agora. Tente de novo.");
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "48px 24px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginBottom: 28 }}>
          <span className="hdr-logo-mark">
            <Image src="/riocard.jpeg" alt="riocard mais" width={156} height={117} priority />
          </span>
          <span className="hdr-logo-word">
            Portal do
            <br />
            Conhecimento
          </span>
        </div>

        <div className="card" style={{ padding: "28px 30px" }}>
          <h1 style={{ margin: "0 0 6px", font: "600 24px/1.2 var(--font-head)" }}>Entrar no portal</h1>
          <p style={{ margin: "0 0 22px", font: "400 14.5px/1.5 var(--font-body)", color: "var(--text2)" }}>
            Use seu e-mail corporativo. O acesso é o mesmo do portal RioCard.
          </p>

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
            <div>
              <label htmlFor="email" className="field-label">
                E-mail corporativo
              </label>
              <input
                id="email"
                type="email"
                className="input"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome.sobrenome@riocard.com.br"
              />
            </div>
            <div>
              <label htmlFor="password" className="field-label">
                Senha
              </label>
              <input
                id="password"
                type="password"
                className="input"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div role="alert" className="alert alert-danger" style={{ padding: "12px 14px" }}>
                <span className="alert-icon" aria-hidden="true" style={{ width: 22, height: 22, fontSize: 12 }}>
                  ✕
                </span>
                <span style={{ font: "400 13.5px/1.5 var(--font-body)", color: "var(--text2)" }}>{error}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <p style={{ margin: "18px 0 0", font: "400 12.5px/1.5 var(--font-body)", color: "var(--text3)" }}>
            Esqueceu a senha? Veja o procedimento de redefinição com a equipe de TI · Suporte, ou abra um chamado na fila
            Acessos e senhas.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginTop: 20, font: "400 12.5px/1.5 var(--font-body)", color: "var(--text3)" }}>
          <SearchIcon size={14} />
          Base de conhecimento interna da RioCard
        </div>
      </div>
    </main>
  );
}
