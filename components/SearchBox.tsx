"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CloseIcon, SearchIcon } from "./Icons";
import { registerSearchInput } from "@/lib/searchFocus";

type SuggestionItem = {
  id: string;
  text: string;
  meta: string;
  href: string;
  kind: string;
  glyph: string;
  pre: string;
  mid: string;
  post: string;
};
type SuggestionGroup = { label: string; kind: string; glyph: string; items: SuggestionItem[] };

export default function SearchBox({
  variant,
  placeholder,
}: {
  variant: "hero" | "compact";
  placeholder?: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<SuggestionGroup[]>([]);
  const [sel, setSel] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    registerSearchInput(inputRef.current);
    return () => registerSearchInput(null);
  }, []);

  useEffect(() => {
    if (!value.trim()) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch(`/api/suggestions?q=${encodeURIComponent(value)}`)
        .then((r) => r.json())
        .then((data) => setGroups(data.groups ?? []))
        .catch(() => setGroups([]));
    }, 120);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  // Derived rather than cleared via a setState-in-effect: once the field is
  // empty there's nothing to suggest, regardless of the last fetch's result.
  const visibleGroups = value.trim() ? groups : [];
  const flat = visibleGroups.flatMap((g) => g.items);

  function submit(q?: string) {
    const finalQ = q !== undefined ? q : value;
    setOpen(false);
    setSel(-1);
    fetch("/api/searches", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ q: finalQ }),
    }).catch(() => {});
    router.push(`/resultados?q=${encodeURIComponent(finalQ)}`);
  }

  function pick(item: SuggestionItem) {
    setOpen(false);
    setSel(-1);
    router.push(item.href);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setSel((s) => Math.min(s + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(s - 1, -1));
    } else if (e.key === "Enter") {
      if (sel >= 0 && flat[sel]) pick(flat[sel]);
      else submit();
    } else if (e.key === "Escape") {
      setOpen(false);
      setSel(-1);
    }
  }

  let idx = -1;

  if (variant === "hero") {
    return (
      <div className="hero-search">
        <div className={`hero-field${open && visibleGroups.length > 0 ? " open" : ""}`}>
          <SearchIcon size={24} color="var(--brand)" />
          <label htmlFor="hero-q" className="sr-only">
            Pesquisar no portal do conhecimento
          </label>
          <input
            id="hero-q"
            ref={inputRef}
            placeholder={placeholder ?? "Pesquise por uma dúvida, sistema, procedimento ou palavra-chave"}
            value={value}
            autoComplete="off"
            aria-expanded={open}
            aria-controls="sug-panel"
            role="combobox"
            onChange={(e) => {
              setValue(e.target.value);
              setOpen(!!e.target.value.trim());
              setSel(-1);
            }}
            onFocus={() => setOpen(!!value.trim())}
            onKeyDown={onKeyDown}
          />
          {!!value && (
            <button
              aria-label="Limpar campo de busca"
              className="hero-clear"
              onClick={() => {
                setValue("");
                setOpen(false);
                inputRef.current?.focus();
              }}
            >
              <CloseIcon size={15} />
            </button>
          )}
          <span className="kbd" aria-hidden="true">
            Ctrl K
          </span>
          <button className="btn-hero-submit" onClick={() => submit()}>
            Pesquisar
          </button>
        </div>

        {open && visibleGroups.length > 0 && (
          <div id="sug-panel" role="listbox" aria-label="Sugestões" className="sug-panel hero">
            {visibleGroups.map((g) => (
              <div key={g.label} style={{ padding: "4px 0 6px" }}>
                <div className="sug-group-label">{g.label}</div>
                {g.items.map((it) => {
                  idx++;
                  const i = idx;
                  return (
                    <button
                      key={it.id}
                      role="option"
                      aria-selected={i === sel}
                      className={`sug-row${i === sel ? " active" : ""}`}
                      onMouseEnter={() => setSel(i)}
                      onClick={() => pick(it)}
                    >
                      <span className="sug-glyph">{it.glyph}</span>
                      <span className="sug-text">
                        <span className="sug-title">
                          {it.pre}
                          <b className="hl">{it.mid}</b>
                          {it.post}
                        </span>
                        <span className="sug-meta">{it.meta}</span>
                      </span>
                      <span className="sug-enter" aria-hidden="true">
                        ↵
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
            <div className="sug-footer">
              <span>↑ ↓ para navegar · ↵ para abrir · Esc para fechar</span>
              <span>{flat.length} sugestões</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="search-field">
      <div className="search-field-inner">
        <SearchIcon />
        <input
          aria-label="Pesquisar no portal"
          placeholder={placeholder ?? "Pesquisar…"}
          value={value}
          ref={inputRef}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(!!e.target.value.trim());
            setSel(-1);
          }}
          onFocus={() => setOpen(!!value.trim())}
          onKeyDown={onKeyDown}
        />
        {!!value && (
          <button
            aria-label="Limpar pesquisa"
            className="clear-btn"
            onClick={() => {
              setValue("");
              setOpen(false);
              inputRef.current?.focus();
            }}
          >
            <CloseIcon />
          </button>
        )}
      </div>
      {open && flat.length > 0 && (
        <div role="listbox" aria-label="Sugestões" className="sug-panel top">
          {flat.map((it, i) => (
            <button
              key={it.id}
              role="option"
              aria-selected={i === sel}
              className={`sug-row${i === sel ? " active" : ""}`}
              onMouseEnter={() => setSel(i)}
              onClick={() => pick(it)}
            >
              <span className="sug-glyph">{it.glyph}</span>
              <span className="sug-title" style={{ flex: 1, minWidth: 0 }}>
                {it.pre}
                <b className="hl">{it.mid}</b>
                {it.post}
              </span>
              <span className="sug-kind">{it.kind}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
