#!/usr/bin/env bash
# Levanta backend (8001) y frontend (5173) juntos. Ctrl+C corta los dos.
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -d .venv ]; then
  echo "Falta el entorno virtual. Crealo con:  python3 -m venv .venv && .venv/bin/pip install -r backend/requirements.txt"
  exit 1
fi

if [ ! -d frontend/node_modules ]; then
  echo "Instalando dependencias del frontend…"
  npm install --prefix frontend
fi

if [ ! -f backend/pasteleria.db ]; then
  echo "Cargando datos iniciales…"
  (cd backend && ../.venv/bin/python -m app.seed)
fi

echo "Backend  → http://localhost:8001/docs"
echo "Frontend → http://localhost:5173"
echo

trap 'kill 0' EXIT INT TERM

(cd backend && ../.venv/bin/python -m uvicorn app.main:app --reload --port 8001) &
npm run dev --prefix frontend &

wait
