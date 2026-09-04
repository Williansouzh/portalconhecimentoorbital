import Image from "next/image";
import Link from "next/link";
import { BellIcon, MoonIcon } from "./Icons";
import type { SessionUser } from "@/lib/auth";

// Espelho estático e não interativo do <Header/> enquanto o componente
// cliente é hidratado — evita um cabeçalho em branco no primeiro paint.
export default function HeaderFallback({ user }: { user: SessionUser }) {
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
          <Link href="/" className="hdr-nav-btn">
            Início
          </Link>
          <Link href="/categorias" className="hdr-nav-btn">
            Categorias
          </Link>
          <Link href="/favoritos?tab=favoritos" className="hdr-nav-btn">
            Favoritos
          </Link>
          <Link href="/favoritos?tab=recentes" className="hdr-nav-btn">
            Histórico
          </Link>
        </nav>

        <div className="hdr-search-slot" />

        <div className="hdr-actions">
          <span aria-hidden="true" className="icon-btn">
            <MoonIcon />
          </span>
          <span aria-hidden="true" className="icon-btn notif">
            <BellIcon />
            <span className="notif-dot">3</span>
          </span>
          <span className="profile-btn">
            <span className="profile-avatar" aria-hidden="true">
              {initials}
            </span>
            <span className="profile-who">
              {user.shortName}
              <small>{user.dept}</small>
            </span>
          </span>
        </div>
      </div>
    </header>
  );
}
