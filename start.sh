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

# Si quedó una instancia anterior levantada, los puertos estarían ocupados y
# arrancaría a medias. La cerramos antes de empezar.
ocupante() { ss -ltnp 2>/dev/null | grep -oP "127.0.0.1:$1\b.*pid=\K[0-9]+|\[::1\]:$1\b.*pid=\K[0-9]+" | head -1; }

for puerto in 8001 5173; do
  pid=$(ocupante "$puerto" || true)
  [ -z "${pid:-}" ] && continue

  if ps -p "$pid" -o args= | grep -qE "uvicorn app.main:app|vite"; then
    echo "Cerrando la instancia anterior en el puerto $puerto…"
    kill "$pid" 2>/dev/null || true
    sleep 1
  else
    echo "El puerto $puerto está ocupado por otro programa (PID $pid):"
    ps -p "$pid" -o args= | head -1
    echo "Cerralo o cambiá el puerto antes de seguir."
    exit 1
  fi
done

echo "Backend  → http://localhost:8001/docs"
echo "Frontend → http://localhost:5173"
echo

trap 'kill 0' EXIT INT TERM

(cd backend && ../.venv/bin/python -m uvicorn app.main:app --reload --port 8001) &
npm run dev --prefix frontend &

wait
