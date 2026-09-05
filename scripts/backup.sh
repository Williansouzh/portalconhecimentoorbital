#!/usr/bin/env bash
# Backup do banco do portal. Uso: scripts/backup.sh [destino]
#   restaurar:  gunzip -c ARQUIVO.sql.gz | docker exec -i portal-postgres psql -U portal -d portal
set -euo pipefail

DESTINO="${1:-backups}"
CONTAINER="${POSTGRES_CONTAINER:-portal-postgres}"
ARQUIVO="$DESTINO/portal-$(date +%Y%m%d-%H%M%S).sql.gz"
MANTER_DIAS="${MANTER_DIAS:-14}"

mkdir -p "$DESTINO"
docker exec "$CONTAINER" pg_dump -U portal -d portal --clean --if-exists | gzip > "$ARQUIVO"

TAMANHO=$(du -h "$ARQUIVO" | cut -f1)
echo "backup gerado: $ARQUIVO ($TAMANHO)"

# Remove backups antigos para o diretório não crescer sem limite.
find "$DESTINO" -name 'portal-*.sql.gz' -mtime "+$MANTER_DIAS" -delete
