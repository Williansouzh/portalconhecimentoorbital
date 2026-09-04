"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type ConfirmOptions = {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
};

type UIContextValue = {
  showToast: (message: string) => void;
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
};

const UIContext = createContext<UIContextValue | null>(null);

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}

export default function UIProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  }, []);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setConfirmState(opts);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const resolveConfirm = (v: boolean) => {
    setConfirmState(null);
    resolver.current?.(v);
    resolver.current = null;
  };

  const value = useMemo(() => ({ showToast, confirm }), [showToast, confirm]);

  return (
    <UIContext.Provider value={value}>
      {children}

      {!!toast && (
        <div role="status" className="toast">
          {toast}
          <button aria-label="Fechar aviso" onClick={() => setToast("")}>
            ×
          </button>
        </div>
      )}

      {confirmState && (
        <div role="dialog" aria-modal="true" aria-labelledby="cf-h" className="dialog-backdrop">
          <div className="dialog">
            <h2 id="cf-h" style={{ margin: "0 0 8px", font: "600 21px/1.25 var(--font-head)" }}>
              {confirmState.title}
            </h2>
            <p style={{ margin: "0 0 22px", font: "400 15px/1.55 var(--font-body)", color: "var(--text2)" }}>
              {confirmState.body}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btn-secondary" onClick={() => resolveConfirm(false)}>
                {confirmState.cancelLabel ?? "Cancelar"}
              </button>
              <button className="btn btn-danger" onClick={() => resolveConfirm(true)}>
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
}
