"""Converte "ASSUNTOS PROMPT ATENDIMENTO" em artigos estruturados.

O documento tem dois formatos de assunto:
  - com código:  ***GT-05*** ***TÍTULO***
  - sem código:  ***TÍTULO:***      (seções VALORADO e PAP)
Em ambos, o corpo segue até o próximo assunto, e a classificação do chamado é
a última linha em negrito e caixa alta.
"""
import json, os, re, unicodedata
from collections import Counter

# Uso:  python3 scripts/importar-assuntos.py <documento.md> [saida.json]
# O documento é a exportação em Markdown de "ASSUNTOS PROMPT ATENDIMENTO".
import sys
SRC = sys.argv[1] if len(sys.argv) > 1 else "documento.md"
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "lib", "content", "assuntos.json"
)

SECOES = {
    "GT": "Gratuidade", "BU": "BUI e tarifa social", "EC": "Empresa em contato",
    "SI": "Saldo e informação de uso", "PD": "Pedidos", "BC": "Bolsa de crédito",
    "SC": "Solicitando cartão", "CC": "Cancelamento", "RC": "Resgate de crédito",
    "RG": "Recargas", "RS": "Ressarcimento", "BL": "Boletos", "DS": "Desassociação",
    "IN": "Integração", "ST": "Site e app", "ATM": "ATM",
}

# Nome de exibição das seções que não têm código.
SECOES_LIVRES = {
    "PONTOS IMPORTANTES": "Pontos importantes",
    "BASES RIOCARD": "Bases RioCard",
    "VALORADO": "Valorado",
    "VALORADO EXPRESSO": "Valorado Expresso",
    "PAP VALE TRANSPORTE": "PAP Vale Transporte",
    "PAP EXPRESSO": "PAP Expresso",
    "PAP SEEDUC": "PAP SEEDUC",
}

SIGLAS = {
    "BUI", "ATM", "VT", "SEEDUC", "CPF", "RG", "APP", "PIX", "SMS", "PIU", "PAP", "CNPJ",
    "SEFAZ", "SETRANS", "SETRANSOL", "SETRERJ", "SINTERJ", "SETRANSDUC", "SETRANSPETRO",
    "JAE", "RJ", "PDF", "ID", "INSS", "SUS", "VOLTA", "DEC", "TRANSÔNIBUS", "RIOBILHETEUNICO",
    "SP", "BU", "CC", "GT", "PD", "ST", "SC", "RC", "BC", "BL", "DS", "IN", "SI", "EC", "RS",
    "SENAC", "COC", "URA", "CT", "AC", "RF", "ESI", "SBE", "VS", "PA",
}

def limpa(l):
    l = re.sub(r"\\([-!#=.,()\[\]*_])", r"\1", l)
    l = re.sub(r"\*{1,3}", "", l)
    l = l.replace("\u00a0", " ").strip()
    # o documento usa corridas de pontos e traços como preenchimento visual
    return re.sub(r"[-.…]{4,}\s*$", "", l).strip()

def eh_separador(l):
    s = limpa(l)
    return bool(s) and (set(s) <= set("=…. -_—") or s.count("…") > 3 or s.count("=") > 5)

def eh_negrito(l):
    return bool(re.match(r"^\s*\*{2,}[^*].*?\*{2,}\s*$", l.strip()))

def proporcao_maiuscula(s):
    letras = [c for c in s if c.isalpha()]
    return sum(c.isupper() for c in letras) / len(letras) if letras else 0

def eh_classificacao(l):
    s = limpa(l)
    return " - " in s and len(s) >= 6 and proporcao_maiuscula(s) > 0.85

def eh_caminho(t):
    return t.count(" - ") >= 2 and proporcao_maiuscula(t) > 0.85

def caixa_de_titulo(t):
    def palavra(w):
        nucleo = w.strip("()[].,:;/-“”\"")
        if not nucleo or not nucleo.isalpha():
            return w
        if nucleo.upper() in SIGLAS:
            return w.replace(nucleo, nucleo.upper())
        if nucleo.upper() == "RIOCARD":
            return w.replace(nucleo, "RioCard")
        return w.replace(nucleo, nucleo.lower())
    if not t:
        return t
    r = " ".join(palavra(w) for w in t.split())
    for i, c in enumerate(r):
        if c.isalpha():
            return r[:i] + c.upper() + r[i + 1:]
    return r

def slug(s):
    s = unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode()
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", s.lower())).strip("-")

CODIFICADO = re.compile(r"^\s*\*{2,3}\s*([A-Z]{2,3}-\d{2})\s*\*{2,3}\s*(.*)$")
CAMPO = re.compile(r"^[^:]{1,70}:\s*$")

linhas = open(SRC, encoding="utf-8").read().split("\n")
secao, entradas, atual = "", [], None
livres = Counter()
corpo_da_secao = {}   # seções cujo formato não tem blocos titulados

def fecha():
    global atual
    if atual:
        entradas.append(atual)
        atual = None

for bruta in linhas:
    if bruta.startswith("#"):
        fecha()
        # O cabeçalho vem com emoji quebrado na exportação; casar por conteúdo
        # é mais robusto do que tentar limpar byte a byte.
        nome = re.sub(r"\s+", " ", limpa(bruta.lstrip("#"))).strip().upper()
        prefixo = re.search(r"\(([A-Z]{2,3})\)", nome)
        if prefixo and prefixo.group(1) in SECOES:
            secao = SECOES[prefixo.group(1)]
        else:
            candidatos = sorted(SECOES_LIVRES.items(), key=lambda kv: -len(kv[0]))
            secao = next((v for k, v in candidatos if k in nome), nome.title())
        continue

    m = CODIFICADO.match(bruta)
    if m:
        fecha()
        codigo = m.group(1)
        atual = {"codigo": codigo, "secao": SECOES.get(codigo.split("-")[0], secao),
                 "titulo": limpa(m.group(2)), "corpo": []}
        continue

    texto = limpa(bruta)
    # Assunto sem código: título em negrito, caixa alta, terminado em ":"
    if eh_negrito(bruta) and texto.rstrip("-. ").endswith(":") and proporcao_maiuscula(texto) > 0.8 and len(texto) > 8:
        fecha()
        livres[secao] += 1
        atual = {"codigo": "", "secao": secao, "id": f"{slug(secao)}-{livres[secao]:02d}",
                 "titulo": texto.rstrip("-. ").rstrip(":").strip(), "corpo": []}
        continue

    if eh_separador(bruta) or not texto:
        continue
    if atual is None:
        corpo_da_secao.setdefault(secao, []).append(texto)
        continue
    atual["corpo"].append((texto, eh_negrito(bruta)))
fecha()

# Uma seção que não produziu nenhum assunto (BASES RIOCARD) vira um único
# artigo de referência com o conteúdo inteiro.
com_entrada = {e["secao"] for e in entradas}
for nome_secao, corpo in corpo_da_secao.items():
    if nome_secao and nome_secao not in com_entrada and len(corpo) > 3:
        entradas.append({
            "codigo": "", "secao": nome_secao, "id": slug(nome_secao), "referencia": True,
            "titulo": nome_secao, "corpo": [(t, False) for t in corpo],
        })

def monta(e):
    corpo, titulo = e["corpo"], e["titulo"]
    while corpo and not titulo:
        titulo, corpo = corpo[0][0], corpo[1:]
    if corpo and corpo[0][0].startswith("(") and len(corpo[0][0]) < 90:
        titulo, corpo = f"{titulo} {corpo[0][0]}", corpo[1:]

    aproximada = any("ÁRVORE APROXIMADA" in t.upper() for t, _ in corpo)
    corpo = [(t, b) for t, b in corpo if "ÁRVORE APROXIMADA" not in t.upper()]

    classificacao = ""
    for i in range(len(corpo) - 1, -1, -1):
        if corpo[i][1] and eh_classificacao(corpo[i][0]):
            classificacao, corpo = corpo[i][0], corpo[:i] + corpo[i + 1:]
            break
    if not classificacao and len(corpo) > 1:
        for i in range(len(corpo) - 1, -1, -1):
            if eh_classificacao(corpo[i][0]):
                classificacao, corpo = corpo[i][0], corpo[:i] + corpo[i + 1:]
                break

    blocos, campos = [], []
    for t, _ in corpo:
        if CAMPO.match(t):
            campos.append(t.rstrip(":").strip())
        else:
            if campos:
                blocos.append(("campos", campos)); campos = []
            blocos.append(("texto", t))
    if campos:
        blocos.append(("campos", campos))

    partes, primeiro, aberta = [], None, False
    for tipo, valor in blocos:
        if tipo == "campos":
            partes.append("## Dados a coletar\n" + "\n".join(f"- {c}" for c in valor) if len(valor) >= 2
                          else "\n".join(f"{c}:" for c in valor))
            aberta = False
        elif primeiro is None:
            primeiro = valor
            if e.get("referencia"):
                partes.append(valor)
            else:
                partes.append(("## Caminho no sistema" if eh_caminho(valor) else "## Situação") + "\n" + valor)
            aberta = True
        elif re.match(r"^(orientad|informad|recomendad|explicad)", valor, re.I) and not aberta:
            partes.append("## Orientação\n" + valor); aberta = True
        elif aberta:
            partes[-1] += "\n" + valor
        else:
            partes.append(valor)

    resumo = (primeiro or titulo).strip()
    if len(resumo) > 230:
        resumo = resumo[:230].rsplit(" ", 1)[0] + "…"

    stop = {"para", "como", "cliente", "sobre", "cartao", "contato", "pelo", "pela", "sem", "com", "nao", "mais"}
    kws = ([e["codigo"].lower()] if e["codigo"] else []) + \
          [p for p in dict.fromkeys(re.findall(r"[\wÀ-ú]{4,}", titulo.lower())) if p not in stop][:6]

    return {
        "id": e.get("id") or e["codigo"].lower(),
        "codigo": e["codigo"],
        "secao": e["secao"],
        "titulo": caixa_de_titulo(titulo.strip()),
        "resumo": resumo,
        "conteudo": "\n\n".join(partes).strip(),
        "classificacao": classificacao.strip(),
        "arvoreAproximada": aproximada,
        "palavrasChave": kws,
    }

artigos = [monta(e) for e in entradas]
# Sem corpo é rótulo de subseção, não assunto.
descartados = [a for a in artigos if not a["conteudo"]]
artigos = [a for a in artigos if a["conteudo"]]

vistos, duplicados = {}, []
for a in artigos:
    n = vistos.get(a["id"], 0) + 1
    vistos[a["id"]] = n
    if n > 1:
        duplicados.append(a["codigo"] or a["id"])
        a["id"] = f"{a['id']}-{n}"

os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump(artigos, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

print("artigos:", len(artigos), "| com código:", sum(1 for a in artigos if a["codigo"]))
print("descartados (sem corpo):", [d["codigo"] or d["id"] for d in descartados])
print("ids repetidos:", duplicados)
print("sem classificação:", sum(1 for a in artigos if not a["classificacao"]),
      "| sem conteúdo:", sum(1 for a in artigos if not a["conteudo"]))
for s, n in Counter(a["secao"] for a in artigos).most_common():
    print(f"  {s}: {n}")
