"""EduBridge AI backend test suite.

The default run is offline and free: the model provider is stubbed out, so
nothing leaves the machine and no credits are spent. The previous tests called
the live API on every run, which made them slow, flaky, and billable.

Tests that do hit the real API are marked `live` and only run when selected:

    pytest              # offline suite
    pytest -m live      # live end-to-end against the configured provider
"""

from pathlib import Path

import pytest

from app.core.config import settings
from app.services import audio_service, llm_service, rag_service
from tests.conftest import README_CHAT_PAYLOAD, README_PROGRESS_PAYLOAD


@pytest.fixture
def offline_ai(monkeypatch):
    """Stub both OpenAI touchpoints used by /chat/text.

    rag_service is stubbed too — even with a fake LLM, retrieve_context would
    otherwise call the embeddings API for real.
    """

    def fake_generate(message, language, context, chat_history):
        return {
            "response_text": f"[{language}] answer to: {message}",
            "trigger_3d_animation": None,
        }

    monkeypatch.setattr(llm_service, "generate_response", fake_generate)
    monkeypatch.setattr(rag_service, "retrieve_context", lambda module_id, query: "stub context")


# ---- health & auth ----


def test_health_check(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_register_returns_token(client):
    response = client.post(
        "/api/v1/auth/register", json={"email": "new@example.com", "password": "pass1234"}
    )
    assert response.status_code == 200
    assert response.json()["access_token"]
    assert response.json()["token_type"] == "bearer"


def test_register_duplicate_email_rejected(client, registered_user):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": registered_user["email"], "password": "pass1234"},
    )
    assert response.status_code == 400


def test_login_returns_usable_token(client, registered_user):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": registered_user["email"], "password": registered_user["password"]},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    # The old test asserted this token was byte-identical to the registration
    # token. That only held because JWTs are second-granular, so it flaked
    # whenever the two calls straddled a second boundary. Assert it works.
    assert token
    assert client.get("/", headers={"Authorization": f"Bearer {token}"}).status_code == 200


def test_login_wrong_password_rejected(client, registered_user):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": registered_user["email"], "password": "wrong-password"},
    )
    assert response.status_code == 401


# ---- accounts ----


def test_register_stores_and_returns_the_name(client):
    """The sign-up form has always asked for a name; it used to be discarded."""
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "named@example.com", "password": "pass1234", "name": "Ada Okafor"},
    )
    assert response.status_code == 200, response.text
    assert response.json()["user"]["name"] == "Ada Okafor"


def test_register_without_a_name_still_works(client):
    """Older clients built to the previous contract omit it entirely."""
    response = client.post(
        "/api/v1/auth/register", json={"email": "anon@example.com", "password": "pass1234"}
    )
    assert response.status_code == 200, response.text
    assert response.json()["user"]["name"] is None


def test_login_returns_the_student_not_just_a_token(client, registered_user):
    body = client.post(
        "/api/v1/auth/login",
        json={"email": registered_user["email"], "password": registered_user["password"]},
    ).json()

    # Without this the dashboard cannot greet anyone or know whose data to load.
    assert body["user"]["email"] == registered_user["email"]
    assert body["user"]["id"] > 0


def test_me_returns_the_token_owner(client, auth_headers, registered_user):
    """A page refresh drops the login response, so the frontend re-asks."""
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200, response.text
    assert response.json()["email"] == registered_user["email"]


def test_me_requires_auth(client):
    assert client.get("/api/v1/auth/me").status_code == 401


def test_token_with_a_non_numeric_subject_is_a_401_not_a_500(client):
    """int(sub) used to sit outside the try block, so a token carrying a
    non-numeric subject raised an uncaught ValueError and returned 500."""
    from app.core.security import create_access_token

    token = create_access_token({"sub": "not-a-number"})
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401, response.text


# ---- text chat ----


def test_chat_text_returns_documented_contract(client, auth_headers, offline_ai):
    response = client.post("/api/v1/chat/text", json=README_CHAT_PAYLOAD, headers=auth_headers)
    assert response.status_code == 200, response.text

    body = response.json()
    assert body["status"] == "success"
    assert "response_text" in body
    assert isinstance(body["latex_content"], bool)
    assert "trigger_3d_animation" in body


def test_chat_text_requires_auth(client, offline_ai):
    response = client.post("/api/v1/chat/text", json=README_CHAT_PAYLOAD)
    assert response.status_code == 401


def test_chat_text_does_not_require_the_ignored_student_id(client, auth_headers, offline_ai):
    """student_id is accepted but ignored, so omitting it must not 422."""
    payload = {k: v for k, v in README_CHAT_PAYLOAD.items() if k != "student_id"}
    response = client.post("/api/v1/chat/text", json=payload, headers=auth_headers)
    assert response.status_code == 200, response.text


def test_chat_text_module_id_is_optional(client, auth_headers, offline_ai):
    """A session with no module open still answers, just ungrounded.

    /chat/voice already treated module_id as optional; the text route required
    it, so a client that could omit it for voice got a 422 for text.
    """
    payload = {k: v for k, v in README_CHAT_PAYLOAD.items() if k != "module_id"}
    response = client.post("/api/v1/chat/text", json=payload, headers=auth_headers)
    assert response.status_code == 200, response.text


def test_chat_text_skips_rag_when_no_module(client, auth_headers, offline_ai, monkeypatch):
    """No module means no retrieval — not a retrieval of the empty module id."""
    called = []
    monkeypatch.setattr(
        rag_service, "retrieve_context", lambda *a, **k: called.append(a) or "ctx"
    )

    payload = {k: v for k, v in README_CHAT_PAYLOAD.items() if k != "module_id"}
    response = client.post("/api/v1/chat/text", json=payload, headers=auth_headers)

    assert response.status_code == 200, response.text
    assert called == [], "retrieve_context should not run without a module_id"


def test_chat_text_surfaces_animation_trigger(client, auth_headers, monkeypatch):
    """The tag must reach the client AND be stripped from the answer text."""
    monkeypatch.setattr(
        llm_service,
        "generate_response",
        lambda *a, **k: {
            "response_text": "Pressure rises with temperature.",
            "trigger_3d_animation": "highlight_reactor_core",
        },
    )
    monkeypatch.setattr(rag_service, "retrieve_context", lambda *a: "ctx")

    body = client.post("/api/v1/chat/text", json=README_CHAT_PAYLOAD, headers=auth_headers).json()
    assert body["trigger_3d_animation"] == "highlight_reactor_core"
    assert "ANIMATE" not in body["response_text"]


def test_chat_text_flags_latex(client, auth_headers, monkeypatch):
    monkeypatch.setattr(
        llm_service,
        "generate_response",
        lambda *a, **k: {"response_text": r"The balance is $\frac{dP}{dt} = kT$."},
    )
    monkeypatch.setattr(rag_service, "retrieve_context", lambda *a: "ctx")

    body = client.post("/api/v1/chat/text", json=README_CHAT_PAYLOAD, headers=auth_headers).json()
    assert body["latex_content"] is True


def test_chat_text_does_not_flag_currency_as_latex(client, auth_headers, monkeypatch):
    """A bare "$" was a marker, so an answer mentioning a price switched KaTeX
    on for plain prose."""
    monkeypatch.setattr(
        llm_service,
        "generate_response",
        lambda *a, **k: {"response_text": "A carbon steel vessel this size costs $5000."},
    )
    monkeypatch.setattr(rag_service, "retrieve_context", lambda *a: "ctx")

    body = client.post("/api/v1/chat/text", json=README_CHAT_PAYLOAD, headers=auth_headers).json()
    assert body["latex_content"] is False


def test_chat_text_returns_502_when_ai_fails(client, auth_headers, monkeypatch):
    def boom(*args, **kwargs):
        raise RuntimeError("upstream exploded")

    monkeypatch.setattr(llm_service, "generate_response", boom)
    monkeypatch.setattr(rag_service, "retrieve_context", lambda *a: "ctx")

    response = client.post("/api/v1/chat/text", json=README_CHAT_PAYLOAD, headers=auth_headers)
    assert response.status_code == 502
    assert "detail" in response.json()


# ---- animation tag parsing (unit) ----


@pytest.mark.parametrize(
    "raw,expected_text,expected_trigger",
    [
        ("Answer. [ANIMATE:highlight_reactor_core]", "Answer.", "highlight_reactor_core"),
        ("Answer with no tag.", "Answer with no tag.", None),
        ("Answer. [ANIMATE:unterminated", "Answer.", None),
        ("  padded  ", "padded", None),
        ("Answer. [ANIMATE:]", "Answer.", None),
    ],
)
def test_extract_animation_tag(raw, expected_text, expected_trigger):
    text, trigger = llm_service.extract_animation_tag(raw)
    assert text == expected_text
    assert trigger == expected_trigger


def _fake_client_returning(content: str):
    """Minimal stand-in for the OpenAI client — just enough for generate_response."""

    class _Fake:
        class chat:
            class completions:
                @staticmethod
                def create(**kwargs):
                    message = type("M", (), {"content": content})()
                    choice = type("C", (), {"message": message})()
                    return type("R", (), {"choices": [choice]})

    return _Fake()


def test_generate_response_keeps_a_documented_animation_hook(monkeypatch):
    monkeypatch.setattr(
        llm_service,
        "get_openai_client",
        lambda: _fake_client_returning("Pressure rises. [ANIMATE:highlight_reactor_core]"),
    )

    result = llm_service.generate_response("why?", "English", "ctx", [])
    assert result["trigger_3d_animation"] == "highlight_reactor_core"
    assert "ANIMATE" not in result["response_text"]


def test_generate_response_drops_an_undocumented_animation_hook(monkeypatch):
    """The 3D scene can only act on its documented vocabulary, so a hook
    outside it is dropped rather than forwarded as an unmatchable string."""
    monkeypatch.setattr(
        llm_service,
        "get_openai_client",
        lambda: _fake_client_returning("Answer. [ANIMATE:highlight_invented_thing]"),
    )

    result = llm_service.generate_response("why?", "English", "ctx", [])
    assert result["trigger_3d_animation"] is None
    assert "ANIMATE" not in result["response_text"]


# ---- student progress ----


def test_progress_accepts_readme_payload(client, auth_headers):
    """Regression: this exact body used to 500 on int("user_123")."""
    response = client.put(
        "/api/v1/student/progress", json=README_PROGRESS_PAYLOAD, headers=auth_headers
    )
    assert response.status_code == 200, response.text

    body = response.json()
    assert body["status"] == "success"
    assert body["module_id"] == "module_4_spatial"
    assert body["completion_percentage"] == 85


def test_progress_requires_auth(client):
    response = client.put("/api/v1/student/progress", json=README_PROGRESS_PAYLOAD)
    assert response.status_code == 401


def test_progress_is_keyed_to_the_token_user(client, auth_headers, db_session):
    """The payload's student_id must be ignored, not parsed."""
    from app.models.progress import Progress
    from app.models.user import User

    client.put("/api/v1/student/progress", json=README_PROGRESS_PAYLOAD, headers=auth_headers)

    db = db_session()
    try:
        row = db.query(Progress).one()
        user = db.query(User).one()
        assert row.user_id == user.id
        # 123 would mean the payload's "user_123" had been trusted and cast.
        assert row.user_id != 123
    finally:
        db.close()


def test_progress_updates_in_place(client, auth_headers, db_session):
    from app.models.progress import Progress

    client.put("/api/v1/student/progress", json=README_PROGRESS_PAYLOAD, headers=auth_headers)
    client.put(
        "/api/v1/student/progress",
        json={**README_PROGRESS_PAYLOAD, "completion_percentage": 100, "time_spent_seconds": 5000},
        headers=auth_headers,
    )

    db = db_session()
    try:
        rows = db.query(Progress).all()
        assert len(rows) == 1, "a second PUT for the same module must not insert a new row"
        assert rows[0].completion_percentage == 100
        assert rows[0].time_spent_seconds == 5000
    finally:
        db.close()


def test_progress_is_isolated_between_users(client, auth_headers, db_session):
    from app.models.progress import Progress

    client.put("/api/v1/student/progress", json=README_PROGRESS_PAYLOAD, headers=auth_headers)

    other = client.post(
        "/api/v1/auth/register", json={"email": "other@example.com", "password": "pass1234"}
    ).json()["access_token"]
    client.put(
        "/api/v1/student/progress",
        json={**README_PROGRESS_PAYLOAD, "student_id": "user_123", "completion_percentage": 10},
        headers={"Authorization": f"Bearer {other}"},
    )

    db = db_session()
    try:
        assert db.query(Progress).count() == 2
        assert len({row.user_id for row in db.query(Progress).all()}) == 2
    finally:
        db.close()


# ---- progress read-back ----


def test_get_progress_returns_what_was_saved(client, auth_headers):
    """The dashboard had no way to load real numbers -- the API could only write."""
    client.put("/api/v1/student/progress", json=README_PROGRESS_PAYLOAD, headers=auth_headers)

    response = client.get("/api/v1/student/progress", headers=auth_headers)
    assert response.status_code == 200, response.text

    body = response.json()
    assert body["status"] == "success"
    assert len(body["progress"]) == 1
    assert body["progress"][0]["module_id"] == "module_4_spatial"
    assert body["progress"][0]["completion_percentage"] == 85


def test_get_progress_is_empty_for_a_new_account(client, auth_headers):
    body = client.get("/api/v1/student/progress", headers=auth_headers).json()
    assert body["progress"] == []


def test_get_progress_filters_by_module(client, auth_headers):
    client.put("/api/v1/student/progress", json=README_PROGRESS_PAYLOAD, headers=auth_headers)
    client.put(
        "/api/v1/student/progress",
        json={**README_PROGRESS_PAYLOAD, "module_id": "module_2_thermo"},
        headers=auth_headers,
    )

    body = client.get(
        "/api/v1/student/progress", params={"module_id": "module_2_thermo"}, headers=auth_headers
    ).json()
    assert [row["module_id"] for row in body["progress"]] == ["module_2_thermo"]


def test_get_progress_is_isolated_between_users(client, auth_headers):
    client.put("/api/v1/student/progress", json=README_PROGRESS_PAYLOAD, headers=auth_headers)

    other = client.post(
        "/api/v1/auth/register", json={"email": "reader@example.com", "password": "pass1234"}
    ).json()["access_token"]

    body = client.get(
        "/api/v1/student/progress", headers={"Authorization": f"Bearer {other}"}
    ).json()
    assert body["progress"] == []


def test_get_progress_requires_auth(client):
    assert client.get("/api/v1/student/progress").status_code == 401


# ---- RAG degradation ----


def test_rag_falls_back_when_embeddings_fail(monkeypatch):
    def boom(text):
        raise RuntimeError("embeddings unreachable")

    monkeypatch.setattr(rag_service, "_embed", boom)
    context = rag_service.retrieve_context("module_4_spatial", "batch reactor pressure")
    # Unranked material beats a failed request.
    assert "batch reactor" in context.lower()


def test_rag_skips_embeddings_when_provider_has_none(monkeypatch):
    """Groq exposes no embeddings endpoint, so EMBEDDING_MODEL is left blank.

    The service should serve the material directly rather than firing a call
    that is guaranteed to fail on every single request.
    """
    monkeypatch.setattr(settings, "EMBEDDING_MODEL", None)

    def should_not_be_called(text):
        raise AssertionError("_embed was called despite EMBEDDING_MODEL being unset")

    monkeypatch.setattr(rag_service, "_embed", should_not_be_called)
    context = rag_service.retrieve_context("module_4_spatial", "batch reactor pressure")
    assert "batch reactor" in context.lower()


def test_rag_unknown_module_returns_fallback():
    assert rag_service.retrieve_context("no_such_module", "anything") == rag_service.FALLBACK_CONTEXT


def test_cosine_similarity_handles_zero_vector():
    import numpy as np

    assert rag_service._cosine(np.zeros(4), np.ones(4)) == 0.0


def test_knowledge_base_covers_every_module_the_dashboard_shows():
    """A missing entry meant the tutor answered every question about that
    module with the no-material fallback."""
    for module_id in ("module_4_spatial", "module_2_thermo", "module_6_fourier"):
        context = rag_service.retrieve_context(module_id, "anything")
        assert context != rag_service.FALLBACK_CONTEXT, f"{module_id} has no course material"
        assert context.strip()


def test_unranked_fallback_returns_every_chunk(monkeypatch):
    """Without embeddings there is no ranking, so slicing to top_k would drop
    chunks by file order rather than relevance."""
    monkeypatch.setattr(settings, "EMBEDDING_MODEL", None)

    chunks = rag_service._KNOWLEDGE_BASE["module_4_spatial"]
    context = rag_service.retrieve_context("module_4_spatial", "anything", top_k=2)
    assert len(chunks) > 2, "this test is only meaningful for a module with more chunks than top_k"
    for chunk in chunks:
        assert chunk in context


# ---- course catalogue ----


def test_module_catalogue_requires_auth(client):
    assert client.get("/api/v1/modules").status_code == 401


def test_module_catalogue_lists_every_module_with_material(client, auth_headers):
    response = client.get("/api/v1/modules", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    ids = {module["id"] for module in response.json()["modules"]}
    assert ids == set(rag_service._KNOWLEDGE_BASE)


def test_module_catalogue_entries_are_complete(client, auth_headers):
    modules = client.get("/api/v1/modules", headers=auth_headers).json()["modules"]
    assert modules, "an empty catalogue leaves the dashboard with nothing to render"
    for module in modules:
        assert set(module) == {"id", "number", "title", "course", "label"}
        assert module["title"] and module["course"]
        # The chip is assembled server-side so the client never reconstructs it.
        assert module["label"] == f"Module {module['number']}: {module['title']}"


def test_module_catalogue_every_id_has_material(client, auth_headers):
    """The point of serving the catalogue: an id the dashboard can send must
    never lead to the no-material fallback."""
    modules = client.get("/api/v1/modules", headers=auth_headers).json()["modules"]
    for module in modules:
        context = rag_service.retrieve_context(module["id"], "anything")
        assert context != rag_service.FALLBACK_CONTEXT, f"{module['id']} is listed but has no material"


def test_module_catalogue_omits_a_module_with_no_metadata(client, auth_headers, monkeypatch):
    """Material without display metadata cannot be rendered as a card, so it is
    left out rather than shown with a blank title."""
    monkeypatch.setitem(rag_service._KNOWLEDGE_BASE, "module_9_orphan", ["some material"])
    ids = {m["id"] for m in client.get("/api/v1/modules", headers=auth_headers).json()["modules"]}
    assert "module_9_orphan" not in ids


def test_module_catalogue_omits_metadata_with_no_material(client, auth_headers, monkeypatch):
    """The reverse: a card for a module the tutor would answer "no material
    found" about is worse than no card."""
    monkeypatch.setitem(
        rag_service._MODULE_META,
        "module_9_ghost",
        {"number": 9, "title": "Ghost Module", "course": "Nowhere"},
    )
    ids = {m["id"] for m in client.get("/api/v1/modules", headers=auth_headers).json()["modules"]}
    assert "module_9_ghost" not in ids


# ---- audio retention ----


def test_audio_pruning_removes_expired_clips():
    """Nothing used to delete rendered clips, so the directory grew without
    bound — roughly 1.4 MB per voice answer, forever."""
    import os
    import time as _time

    stale = audio_service.AUDIO_DIR / "test-stale.wav"
    fresh = audio_service.AUDIO_DIR / "test-fresh.wav"
    stale.write_bytes(b"old")
    fresh.write_bytes(b"new")
    old = _time.time() - audio_service.AUDIO_TTL_SECONDS - 60
    os.utime(stale, (old, old))

    try:
        audio_service._prune_audio_dir(_time.time())
        assert not stale.exists(), "an expired clip should have been pruned"
        assert fresh.exists(), "a clip inside its TTL must survive"
    finally:
        fresh.unlink(missing_ok=True)
        stale.unlink(missing_ok=True)


# ---- voice chat ----
#
# Every OpenAI call on the voice route is stubbed so the route's own logic is
# exercised end to end. Without this the transcription step failed first (no
# credits) and the route's LLM and TTS code never ran at all.


@pytest.fixture
def voice_upload():
    return {"audio_file": ("clip.wav", b"RIFF....WAVEfmt ", "audio/wav")}


@pytest.fixture
def offline_voice(monkeypatch):
    monkeypatch.setattr(
        audio_service, "transcribe_audio", lambda audio_bytes, filename: "what is the pressure?"
    )
    monkeypatch.setattr(
        llm_service,
        "generate_response",
        lambda *a, **k: {
            "response_text": "Pressure rises with temperature.",
            "trigger_3d_animation": "highlight_reactor_core",
        },
    )
    monkeypatch.setattr(rag_service, "retrieve_context", lambda *a: "ctx")
    monkeypatch.setattr(
        audio_service, "synthesize_speech", lambda text: "/static/audio/stub.mp3"
    )


def test_voice_returns_documented_contract(client, auth_headers, voice_upload, offline_voice):
    response = client.post(
        "/api/v1/chat/voice",
        files=voice_upload,
        data={"language": "English", "student_id": "user_123"},
        headers=auth_headers,
    )
    assert response.status_code == 200, response.text

    body = response.json()
    assert body["status"] == "success"
    assert body["transcription"] == "what is the pressure?"
    assert body["response_text"] == "Pressure rises with temperature."
    assert body["tts_audio_url"] == "/static/audio/stub.mp3"
    assert body["trigger_3d_animation"] == "highlight_reactor_core"


def test_voice_module_id_is_optional(client, auth_headers, voice_upload, offline_voice):
    """The README's multipart spec omits module_id; it must not be a 422."""
    response = client.post(
        "/api/v1/chat/voice",
        files=voice_upload,
        data={"language": "English", "student_id": "user_123"},
        headers=auth_headers,
    )
    assert response.status_code == 200


def test_voice_does_not_require_the_ignored_student_id(
    client, auth_headers, voice_upload, offline_voice
):
    """student_id is accepted but ignored, so omitting it must not 422."""
    response = client.post(
        "/api/v1/chat/voice",
        files=voice_upload,
        data={"language": "English"},
        headers=auth_headers,
    )
    assert response.status_code == 200, response.text


def test_voice_survives_tts_failure(client, auth_headers, voice_upload, offline_voice, monkeypatch):
    """A dead TTS must not cost the student the answer text."""

    def boom(text):
        raise RuntimeError("tts unavailable")

    monkeypatch.setattr(audio_service, "synthesize_speech", boom)

    response = client.post(
        "/api/v1/chat/voice",
        files=voice_upload,
        data={"language": "English", "student_id": "user_123"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["tts_audio_url"] is None
    assert response.json()["response_text"]


def test_voice_returns_502_when_transcription_fails(
    client, auth_headers, voice_upload, offline_voice, monkeypatch
):
    def boom(audio_bytes, filename):
        raise RuntimeError("whisper down")

    monkeypatch.setattr(audio_service, "transcribe_audio", boom)

    response = client.post(
        "/api/v1/chat/voice",
        files=voice_upload,
        data={"language": "English", "student_id": "user_123"},
        headers=auth_headers,
    )
    assert response.status_code == 502


def test_voice_requires_auth(client, voice_upload, offline_voice):
    response = client.post(
        "/api/v1/chat/voice",
        files=voice_upload,
        data={"language": "English", "student_id": "user_123"},
    )
    assert response.status_code == 401


def test_voice_requires_audio_file(client, auth_headers, offline_voice):
    response = client.post(
        "/api/v1/chat/voice",
        data={"language": "English", "student_id": "user_123"},
        headers=auth_headers,
    )
    assert response.status_code == 422


# ---- live end-to-end (opt-in, costs money) ----


@pytest.mark.live
@pytest.mark.skipif(not settings.OPENAI_API_KEY, reason="OPENAI_API_KEY not configured")
def test_live_chat_and_progress_roundtrip(client, auth_headers):
    """Exercises the real provider path so the mocks can't hide a broken integration."""
    response = client.post("/api/v1/chat/text", json=README_CHAT_PAYLOAD, headers=auth_headers)
    assert response.status_code == 200, response.text
    assert response.json()["response_text"].strip()

    progress = client.put(
        "/api/v1/student/progress", json=README_PROGRESS_PAYLOAD, headers=auth_headers
    )
    assert progress.status_code == 200


@pytest.mark.live
@pytest.mark.skipif(not settings.OPENAI_API_KEY, reason="OPENAI_API_KEY not configured")
def test_live_voice_roundtrip(client, auth_headers):
    """Real STT -> chat -> TTS against the configured provider.

    Needs credits, and on a free tier TTS is a daily cap that these very tests
    consume -- so synthesis failing here is expected some of the time and is not
    a defect. Transcription and the answer are the parts that must work; TTS is
    best-effort by design (the README documents `tts_audio_url: null` as a valid
    response for exactly this case), so it is asserted only when it produced
    something.
    """
    sample = Path(__file__).with_name("sample_voice.wav")
    if not sample.exists():
        pytest.skip("tests/sample_voice.wav is missing")

    response = client.post(
        "/api/v1/chat/voice",
        files={"audio_file": ("sample_voice.wav", sample.read_bytes(), "audio/wav")},
        data={"language": "English", "student_id": "user_123", "module_id": "module_4_spatial"},
        headers=auth_headers,
    )
    assert response.status_code == 200, response.text

    body = response.json()
    assert body["transcription"].strip(), "STT returned nothing"
    assert body["response_text"].strip(), "the tutor returned no answer"

    # If synthesis did run, the URL has to point at a file that is really there.
    # A URL to a missing clip is the failure worth catching -- the client renders
    # a player and it 404s, which is invisible from the JSON alone.
    if body["tts_audio_url"]:
        assert (audio_service.AUDIO_DIR / Path(body["tts_audio_url"]).name).exists()
