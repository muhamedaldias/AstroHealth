"""Every non-2xx response is the contract's `Error` shape. Nothing else leaves this API."""

from __future__ import annotations

from bonetwin_contracts import Error
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from twin_core import EngineError


class NotFound(Exception):
    def __init__(self, what: str, ident: str) -> None:
        super().__init__(f"{what} '{ident}' not found")
        self.what, self.ident = what, ident


def _json(status: int, err: Error) -> JSONResponse:
    return JSONResponse(status_code=status, content=err.model_dump(mode="json"))


def install(app: FastAPI) -> None:
    @app.exception_handler(NotFound)
    async def _nf(_: Request, exc: NotFound) -> JSONResponse:
        return _json(
            404,
            Error(
                code="not_found",
                message=str(exc),
                details={"resource": exc.what, "id": exc.ident},
            ),
        )

    @app.exception_handler(RequestValidationError)
    async def _val(_: Request, exc: RequestValidationError) -> JSONResponse:
        return _json(
            422,
            Error(
                code="validation_error",
                message="Request failed validation",
                details={"errors": exc.errors()},
            ),
        )

    @app.exception_handler(EngineError)
    async def _eng(_: Request, exc: EngineError) -> JSONResponse:
        return _json(422, Error(code="engine_error", message=str(exc), details=None))

    @app.exception_handler(StarletteHTTPException)
    async def _http(_: Request, exc: StarletteHTTPException) -> JSONResponse:
        code = "not_found" if exc.status_code == 404 else "http_error"
        return _json(exc.status_code, Error(code=code, message=str(exc.detail), details=None))
