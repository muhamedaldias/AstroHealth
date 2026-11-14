# Operations Runbook — AstroHealth on instabox

Host alias `instabox` (SSH). Project root: `/opt/AstroHealth`. One process: uvicorn
(FastAPI) on **127.0.0.1:8000**, serving both the API (`/api/v1/...`) and the built web
app (`/`). Git identity for the repo: `muhamedaldias`.

## 1. How the service runs

No systemd unit — a single nohup'd process:

```bash
cd /opt/AstroHealth && BONETWIN_ENGINE=calibrated BONETWIN_SERVE_WEB=true \
  nohup uv run uvicorn bonetwin_api.main:create_app --factory --host 127.0.0.1 --port 8000 \
  >> data/runtime/uvicorn.log 2>&1 &
```

## 2. Environment variables

All settings use the `BONETWIN_` prefix (`apps/api/src/bonetwin_api/config.py:42`).

| Variable | Default (`config.py`) | Meaning |
|---|---|---|
| `BONETWIN_ENGINE` | `stub` | Forecast engine: `stub` or `calibrated`. **This box runs `calibrated`.** |
| `BONETWIN_SERVE_WEB` | `false` | `true`: FastAPI also serves `apps/web/dist` at `/`. |
| `BONETWIN_DATABASE_URL` | `sqlite:///./data/runtime/app.db` | CWD-relative SQLite paths are anchored to the repo root (`resolve_database_url`); absolute paths and `:memory:` pass through unchanged. |
| `BONETWIN_CORS_ORIGINS` | `["http://localhost:5173"]` | Allowed CORS origins (Vite dev server). |

## 3. Restart procedure

```bash
pgrep -f 'uvicorn bonetwin_api'            # find running PIDs
pkill -f 'uvicorn bonetwin_api'            # stop
sleep 1; ss -ltn | grep 8000               # port must be free (no output = free)
# relaunch with the command in section 1, then verify:
curl -fsS http://127.0.0.1:8000/api/v1/health   # -> {"status":"ok",...}
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8000/   # -> 200
```

## 4. Bind policy (read this before touching the network config)

- The API binds **127.0.0.1:8000** by design; in-box access is localhost only.
- The API has **no authentication layer**. The box's only network protection is the
  upstream cloud firewall. NEVER expose port 8000 publicly without adding auth first.
- Remote access goes through an SSH tunnel, then browse http://localhost:18000:

```bash
ssh -L 18000:127.0.0.1:8000 instabox
```

## 5. Logs

- `data/runtime/uvicorn.log` — the uvicorn process log (gitignored).
- The old `apps/web/api8000.log` pattern is retired; do not create new API logs there.

## 6. Common tasks (from /opt/AstroHealth)

| Task | Command |
|---|---|
| Run tests | `make test` |
| Full gate (spec-lint, gen-check, lint, typecheck, test, build-web) | `make check` |
| Rebuild the web app | `make build-web` |
| Regenerate contract artifacts after `contracts/openapi.yaml` edits | `make gen` |
| Seed the demo database | `make seed` |

## 7. Backups

`data/runtime/app.db` is disposable demo data (80 seed rows via `make seed`). Copy it
(`cp data/runtime/app.db data/runtime/app.db.bak-YYYY-MM-DD`) only if real measurements
have been added and must survive.
