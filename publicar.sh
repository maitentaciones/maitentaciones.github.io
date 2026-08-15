#!/usr/bin/env bash
# Publica la web en GitHub Pages con el catálogo tal como está hoy en el panel.
#
#   1. exporta el catálogo a archivos JSON
#   2. los sube a GitHub
#   3. GitHub construye y publica la página (tarda ~2 minutos)
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -d .git ]; then
  echo "Este proyecto todavía no está conectado con GitHub."
  echo "Seguí los pasos de la sección «Publicar en GitHub Pages» del README."
  exit 1
fi

echo "→ Exportando el catálogo…"
(cd backend && ../.venv/bin/python -m app.export_static)

if git diff --quiet -- frontend/public/data && git diff --cached --quiet -- frontend/public/data; then
  echo
  echo "El catálogo publicado ya está al día, no hay cambios que subir."
  exit 0
fi

echo
echo "→ Subiendo los cambios…"
git add frontend/public/data
git commit -m "Actualizar catálogo publicado"
git push

echo
echo "Listo. En un par de minutos la página va a estar actualizada."
echo "Podés seguir el avance en la pestaña Actions de tu repositorio."
