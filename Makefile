.PHONY: setup gen gen-check spec-lint seed dev-api dev-web test lint fmt typecheck build-web check docker-up

## One-time: install everything (Python workspace + web deps)
setup:
	uv sync --all-packages
	npm --prefix apps/web install

## Regenerate everything derived from contracts/openapi.yaml (+ CODEOWNERS)
gen:
	uv run python scripts/gen_contracts.py

## CI guard: generated files must match the spec (fails if someone forgot `make gen`)
gen-check: gen
	git diff --exit-code -- packages/contracts_py apps/web/src/api/schema.d.ts .github/CODEOWNERS

spec-lint:
	uv run openapi-spec-validator contracts/openapi.yaml

seed:
	uv run python scripts/make_seed.py

dev-api:
	uv run uvicorn bonetwin_api.main:create_app --factory --reload --port 8000

dev-web:
	npm --prefix apps/web run dev

test:
	uv run pytest
	npm --prefix apps/web run test

lint:
	uv run ruff check .
	uv run ruff format --check .
	npm --prefix apps/web run lint
	uv run python scripts/check_ownership.py

fmt:
	uv run ruff format .
	uv run ruff check . --fix
	npm --prefix apps/web run fmt

typecheck:
	npm --prefix apps/web run typecheck

build-web:
	npm --prefix apps/web run build

## Everything CI runs. Run this before every push.
check: spec-lint gen-check lint typecheck test build-web

docker-up:
	docker compose up --build
