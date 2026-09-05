"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import SearchBox from "./SearchBox";
import { BellIcon, MoonIcon, SunIcon } from "./Icons";
import { focusSearchInput } from "@/lib/searchFocus";
import { canCurate, type SessionUser } from "@/lib/auth";

const ROLE_LABEL: Record<string, string> = {
  leitor: "Leitor",
  autor: "Autor",
  curador: "Curador",
};

export default function Header({ user, novidades }: { user: SessionUser; novidades: number }) {
  const pathname = usePathname();
  const router = useRouter();
  // O script inline no <head> já grava data-theme no <html> a partir do
  // localStorage antes da hidratação, então ler dali mantém o ícone em
  // sincronia sem um setState depois da montagem.
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof document === "undefined") return "light";
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        focusSearchInput();
      }
      if (e.key === "Escape") setMenuOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeydown);
    document.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKeydown);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem("theme", next);
    } catch {}
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/login");
    router.refresh();
  }

  const isHome = pathname === "/";
  const isCategories = pathname.startsWith("/categorias");
  const isFavoritesArea = pathname.startsWith("/favoritos");
  const isAdmin = pathname.startsWith("/admin");
  const initials = user.shortName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="hdr">
      <div className="hdr-inner">
        <Link href="/" aria-label="RioCard — página inicial" className="hdr-logo">
          <span className="hdr-logo-mark">
            <Image src="/riocard.jpeg" alt="riocard mais" width={156} height={117} priority />
          </span>
          <span className="hdr-logo-word">
            Portal do
            <br />
            Conhecimento
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="hdr-nav">
          <Link href="/" className={`hdr-nav-btn${isHome ? " on" : ""}`}>
            Início
          </Link>
          <Link href="/categorias" className={`hdr-nav-btn${isCategories ? " on" : ""}`}>
            Categorias
          </Link>
          <Link href="/favoritos?tab=favoritos" className={`hdr-nav-btn${isFavoritesArea ? " on" : ""}`}>
            Favoritos
          </Link>
          <Link href="/favoritos?tab=recentes" className="hdr-nav-btn">
            Histórico
          </Link>
          {canCurate(user.role) && (
            <Link href="/admin" className={`hdr-nav-btn${isAdmin ? " on" : ""}`}>
              Gestão
            </Link>
          )}
        </nav>

        <div className="hdr-search-slot">{!isHome && <SearchBox variant="compact" />}</div>

        <div className="hdr-actions">
          <button onClick={toggleTheme} aria-label="Alternar modo claro e escuro" className="icon-btn">
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
          </button>
          <Link
            href="/novidades"
            aria-label={
              novidades > 0
                ? `${novidades} ${novidades === 1 ? "conteúdo novo" : "conteúdos novos"} desde sua última visita`
                : "Nenhum conteúdo novo desde sua última visita"
            }
            className="icon-btn notif"
          >
            <BellIcon />
            {novidades > 0 && <span className="notif-dot">{novidades > 99 ? "99+" : novidades}</span>}
          </Link>

          <div ref={menuRef} style={{ position: "relative" }}>
            <button
              aria-label={`Perfil de ${user.name}`}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="profile-btn"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="profile-avatar" aria-hidden="true">
                {initials}
              </span>
              <span className="profile-who">
                {user.shortName}
                <small>{user.dept}</small>
              </span>
            </button>

            {menuOpen && (
              <div role="menu" className="profile-menu">
                <div className="profile-menu-head">
                  <span style={{ display: "block", font: "600 14px/1.3 var(--font-body)" }}>{user.name}</span>
                  <span style={{ display: "block", marginTop: 3, font: "400 12.5px/1.4 var(--font-body)", color: "var(--text3)" }}>
                    {user.dept} · {ROLE_LABEL[user.role] ?? user.role}
                  </span>
                </div>
                <Link role="menuitem" className="profile-menu-item" href="/conta" onClick={() => setMenuOpen(false)}>
                  Sua conta
                </Link>
                <button role="menuitem" className="profile-menu-item" onClick={logout}>
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
