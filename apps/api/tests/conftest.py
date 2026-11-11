import pytest
from fastapi.testclient import TestClient

from bonetwin_api.config import Settings
from bonetwin_api.main import create_app


@pytest.fixture()
def client() -> TestClient:
    app = create_app(Settings(engine="stub"), database_url="sqlite://")  # fresh in-memory DB
    return TestClient(app)
