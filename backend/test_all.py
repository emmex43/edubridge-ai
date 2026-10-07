"""Quick end-to-end smoke check against the real stack (Postgres + OpenAI).

This is the human-runnable counterpart to the pytest suite. It talks to the
live OpenAI API, so it costs a fraction of a cent and needs a valid key.

    venv\\Scripts\\python.exe test_all.py

For the offline, free, deterministic suite use:  run_test.bat
(run_test.bat live runs both.)

Secrets are loaded from backend/.env by app/core/config.py. They used to be
hardcoded at the top of this file — never put them back here.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402

client = TestClient(app)


def check(label: str, response, expected: int = 200):
    status = "PASS" if response.status_code == expected else "FAIL"
    print(f"[{status}] {label}: {response.status_code}")
    if response.status_code != expected:
        print(f"         {response.text[:400]}")
        raise SystemExit(1)
    return response.json()


def main() -> int:
    import uuid

    email = f"smoke-{uuid.uuid4().hex[:8]}@example.com"

    token = check("register", client.post(
        "/api/v1/auth/register", json={"email": email, "password": "pass1234"}
    ))["access_token"]

    check("login", client.post(
        "/api/v1/auth/login", json={"email": email, "password": "pass1234"}
    ))

    auth = {"Authorization": f"Bearer {token}"}

    chat = check("chat/text (live OpenAI)", client.post(
        "/api/v1/chat/text",
        json={
            "student_id": "user_123",
            "module_id": "module_4_spatial",
            "language": "Pidgin",
            "message": "Explain the governing equations for this dynamic state.",
            "chat_history": [
                {"role": "ai", "content": "Hello! I can help you model this system."},
                {"role": "user", "content": "What is Fourier series?"},
            ],
        },
        headers=auth,
    ))
    print(f"         response_text: {chat['response_text'][:80]}...")

    # The README's literal payload, which used to 500 on int("user_123").
    check("student/progress", client.put(
        "/api/v1/student/progress",
        json={
            "student_id": "user_123",
            "module_id": "module_4_spatial",
            "time_spent_seconds": 1240,
            "completion_percentage": 85,
        },
        headers=auth,
    ))

    check("progress without a token is rejected", client.put(
        "/api/v1/student/progress",
        json={"module_id": "module_4_spatial", "time_spent_seconds": 1, "completion_percentage": 1},
    ), expected=401)

    print("\nAll smoke checks passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
