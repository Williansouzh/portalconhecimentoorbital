import type { Metadata } from "next";
import { Archivo, Figtree } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import Header from "@/components/Header";
import HeaderFallback from "@/components/HeaderFallback";
import UIProvider from "@/components/UIProvider";
import { getSession } from "@/lib/session";
import { novidadesRecentes } from "@/lib/home";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-archivo",
  display: "swap",
});
const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portal do Conhecimento — RioCard",
  description: "Base de conhecimento interna da RioCard: procedimentos, tutoriais e respostas do dia a dia.",
};

const THEME_INIT = `
try {
  var t = localStorage.getItem('theme');
  if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t);
} catch (e) {}
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Sem sessão significa tela de login: ali o cabeçalho não aparece.
  const session = await getSession();
  const novidades = session ? await novidadesRecentes(session.id) : 0;

  return (
    <html lang="pt-BR" className={`${archivo.variable} ${figtree.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>
        <UIProvider>
          {session && (
            <Suspense fallback={<HeaderFallback user={session} novidades={novidades} />}>
              <Header user={session} novidades={novidades} />
            </Suspense>
          )}
          {children}
        </UIProvider>
      </body>
    </html>
  );
}
