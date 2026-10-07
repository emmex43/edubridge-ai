import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base, get_db
from app.main import app


@pytest.fixture
def db_session():
    """A throwaway in-memory database.

    Tests used to run against the real `edubridge` Postgres database, so a test
    run left rows behind and two concurrent runs collided (the fixed
    test@example.com account would fail on the second register). StaticPool
    keeps the single in-memory connection alive across sessions.
    """
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    try:
        yield TestingSession
    finally:
        engine.dispose()


@pytest.fixture
def client(db_session):
    def override_get_db():
        db = db_session()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def registered_user(client):
    """A freshly registered account. The email is unique per test run."""
    email = f"test-{uuid.uuid4().hex[:8]}@example.com"
    response = client.post(
        "/api/v1/auth/register", json={"email": email, "password": "pass1234"}
    )
    assert response.status_code == 200, response.text
    return {"email": email, "password": "pass1234", "token": response.json()["access_token"]}


@pytest.fixture
def auth_headers(registered_user):
    return {"Authorization": f"Bearer {registered_user['token']}"}


# The README's documented progress payload, verbatim — including
# "student_id": "user_123", which is what used to crash this endpoint.
README_PROGRESS_PAYLOAD = {
    "student_id": "user_123",
    "module_id": "module_4_spatial",
    "time_spent_seconds": 1240,
    "completion_percentage": 85,
}

README_CHAT_PAYLOAD = {
    "student_id": "user_123",
    "module_id": "module_4_spatial",
    "language": "Pidgin",
    "message": "Explain the governing equations for this dynamic state.",
    "chat_history": [
        {"role": "ai", "content": "Hello! I can help you model this system."},
        {"role": "user", "content": "What is Fourier series?"},
    ],
}
