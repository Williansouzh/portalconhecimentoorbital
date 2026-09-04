"use client";

import { useUI } from "./UIProvider";

export default function HelpButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const { showToast } = useUI();
  return (
    <button className={className} onClick={() => showToast("Pedido de ajuda aberto — protótipo")}>
      {children}
    </button>
  );
}
