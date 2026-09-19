import os
from pathlib import Path

# pyrefly: ignore [missing-import]
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

os.environ.setdefault("APP_ENV", "development")
os.environ.setdefault("SECRET_KEY", "test-secret-key-that-is-long-enough")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_lexiguide.db")
os.environ.setdefault("STORAGE_DIR", str(Path.cwd() / ".test-storage"))
os.environ.setdefault("LLM_PROVIDER", "local")

from app.api.dependencies import get_db  # noqa: E402
from app.db.database import Base  # noqa: E402
from app.main import app  # noqa: E402
from app.rag.retriever import vector_store  # noqa: E402


from sqlalchemy.pool import StaticPool


@pytest.fixture()
def client(tmp_path):
    storage_path = tmp_path / "storage"
    storage_path.mkdir(parents=True, exist_ok=True)
    os.environ["STORAGE_DIR"] = str(storage_path)
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(bind=engine)
    vector_store._records.clear()

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture()
def auth_headers(client):
    response = client.post(
        "/api/auth/register",
        json={"email": "reviewer@example.com", "full_name": "Reviewer One", "password": "strong-password"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def sample_contract_bytes():
    return Path("tests/fixtures/sample_contract.txt").read_bytes()
