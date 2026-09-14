import logging

from app.core.config import settings
from app.core.openai_client import get_openai_client

logger = logging.getLogger(__name__)

# The 3D sandbox can only act on hook names it knows, so the model picks from a
# fixed vocabulary rather than inventing free-form strings no client could ever
# match. "highlight_reactor_core" is the README's own documented example and
# anchors the list.
ANIMATION_HOOKS = (
    "highlight_reactor_core",
    "highlight_vessel_wall",
    "highlight_inlet_stream",
    "highlight_outlet_stream",
    "highlight_pressure_gauge",
    "highlight_temperature_probe",
    "highlight_waveform",
    "highlight_frequency_spectrum",
)

_HOOK_LIST = "\n".join(f"  [ANIMATE:{hook}]" for hook in ANIMATION_HOOKS)

SYSTEM_PROMPT = f"""You are a Socratic AI tutor for a technical/vocational learning platform.
Ground your answers strictly in the provided course context. If the context doesn't cover
the question, say so honestly rather than inventing information.

Respond in the requested language:
- "English": clear, standard English.
- "Pidgin": natural Nigerian Pidgin.

Lead the student toward the answer with a question rather than stating it outright.

CITE THE VISUAL: when your answer concerns equipment, a vessel, a stream, a gauge, or a
waveform, end your response with exactly one animation tag chosen from this list:

{_HOOK_LIST}

Most answers about reactors, vessels or signals map to one of these -- use the tag whenever
one applies. Use at most one, always at the very end of the response, and never explain or
mention it in your prose. Omit it only when the answer is purely abstract with nothing in the
model to point at."""

ANIMATE_PREFIX = "[ANIMATE:"


def extract_animation_tag(raw: str) -> tuple[str, str | None]:
    """Split a trailing [ANIMATE:...] tag off the model's response.

    Returns (clean_text, trigger) where trigger is None when there is no tag.
    The previous inline version called raw.index() twice with no guard, so a
    response containing "[ANIMATE:" without a closing bracket raised ValueError
    and failed the request outright.
    """
    start = raw.find(ANIMATE_PREFIX)
    if start == -1:
        return raw.strip(), None

    end = raw.find("]", start)
    if end == -1:
        # Unterminated tag — drop it rather than leaking the marker into the UI.
        return raw[:start].strip(), None

    trigger = raw[start + len(ANIMATE_PREFIX) : end].strip()
    return raw[:start].strip(), trigger or None


def generate_response(message: str, language: str, context: str, chat_history: list) -> dict:
    history_messages = [
        {"role": "assistant" if h["role"] == "ai" else "user", "content": h["content"]}
        for h in chat_history
    ]

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "system", "content": f"Course context:\n{context}"},
        *history_messages,
        {"role": "user", "content": f"[Respond in: {language}]\n{message}"},
    ]

    # temperature is dropped entirely when CHAT_TEMPERATURE is blank, because
    # several reasoning models reject the parameter outright rather than
    # ignoring it.
    request = {"model": settings.CHAT_MODEL, "messages": messages}
    if settings.CHAT_TEMPERATURE is not None:
        request["temperature"] = settings.CHAT_TEMPERATURE

    completion = get_openai_client().chat.completions.create(**request)

    # content is None when the model returns no text for the chosen completion;
    # extract_animation_tag would then blow up on None.find().
    raw = completion.choices[0].message.content or ""
    response_text, trigger = extract_animation_tag(raw)

    if trigger is not None and trigger not in ANIMATION_HOOKS:
        # Prompt drift: surface it rather than shipping a hook no 3D scene can
        # match. Dropping it means the frontend sees "no highlight", which is
        # the same thing an unknown hook would have produced anyway.
        logger.warning("model emitted an unknown animation hook: %r", trigger)
        trigger = None

    return {"response_text": response_text, "trigger_3d_animation": trigger}
