"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchBox from "./SearchBox";
import { BellIcon, MoonIcon, SunIcon } from "./Icons";
import { focusSearchInput } from "@/lib/searchFocus";

export default function Header() {
  const pathname = usePathname();
  // The blocking inline script in <head> already stamps data-theme onto
  // <html> from localStorage before hydration, so reading it back here
  // (instead of localStorage directly) keeps the icon in sync without a
  // setState-after-mount round trip.
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof document === "undefined") return "light";
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        focusSearchInput();
      }
    };
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem("theme", next);
    } catch {}
  }

  const isHome = pathname === "/";
  const isCategories = pathname.startsWith("/categorias");
  const isFavoritesArea = pathname.startsWith("/favoritos");

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
        </nav>

        <div className="hdr-search-slot">{!isHome && <SearchBox variant="compact" />}</div>

        <div className="hdr-actions">
          <button onClick={toggleTheme} aria-label="Alternar modo claro e escuro" className="icon-btn">
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
          </button>
          <button aria-label="Notificações, 3 novas" className="icon-btn notif">
            <BellIcon />
            <span className="notif-dot">3</span>
          </button>
          <button aria-label="Perfil de Ana Coutinho" className="profile-btn">
            <span className="profile-avatar" aria-hidden="true">
              AC
            </span>
            <span className="profile-who">
              Ana C.
              <small>Operações</small>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
