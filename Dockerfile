# Single image: builds the web app, then runs the API which also serves apps/web/dist.
FROM node:22-slim AS web
WORKDIR /repo
COPY contracts ./contracts
COPY apps/web ./apps/web
WORKDIR /repo/apps/web
RUN npm ci && npm run build

FROM python:3.12-slim AS app
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
WORKDIR /repo
COPY pyproject.toml uv.lock .python-version ./
COPY packages ./packages
COPY apps/api ./apps/api
COPY contracts ./contracts
RUN uv sync --frozen --no-dev --package bonetwin-api
COPY --from=web /repo/apps/web/dist ./apps/web/dist
ENV BONETWIN_SERVE_WEB=true \
    BONETWIN_DATABASE_URL=sqlite:////repo/data/runtime/app.db
# Non-root: the API only needs to write its sqlite db under /repo/data.
RUN useradd --create-home appuser && chown -R appuser /repo
USER appuser
EXPOSE 8000
CMD ["uv", "run", "--no-dev", "uvicorn", "bonetwin_api.main:create_app", "--factory", "--host", "0.0.0.0", "--port", "8000"]
