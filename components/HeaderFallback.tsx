import Image from "next/image";
import Link from "next/link";
import { BellIcon, MoonIcon } from "./Icons";

// Static, non-interactive mirror of <Header/> rendered while the client
// component streams in — avoids a blank header before hydration.
export default function HeaderFallback() {
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
              AC
            </span>
            <span className="profile-who">
              Ana C.
              <small>Operações</small>
            </span>
          </span>
        </div>
      </div>
    </header>
  );
}
