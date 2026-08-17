#!/usr/bin/env bash
# Publica la web en GitHub Pages con todo lo que haya cambiado: el catálogo del
# panel y cualquier cambio en el código.
#
#   1. exporta el catálogo a archivos JSON
#   2. sube todo lo pendiente a GitHub
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

# Miramos todo el proyecto, no solo el catálogo: si cambió el código también
# hay que subirlo, si no la web publicada queda con la versión vieja.
if [ -z "$(git status --porcelain)" ]; then
  echo
  echo "La página publicada ya está al día, no hay cambios que subir."
  exit 0
fi

echo
echo "→ Cambios que se van a publicar:"
git status --short
echo

git add -A

# Un mensaje que describa qué se está publicando.
if git diff --cached --name-only | grep -qv '^frontend/public/data/'; then
  mensaje="Actualizar la web"
else
  mensaje="Actualizar catálogo publicado"
fi

echo "→ Subiendo…"
git commit -m "$mensaje"
git push

echo
echo "Listo. En un par de minutos la página va a estar actualizada."
echo "Podés seguir el avance en la pestaña Actions de tu repositorio."
