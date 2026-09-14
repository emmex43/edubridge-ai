import logging

import numpy as np

from app.core.config import settings
from app.core.openai_client import get_openai_client

logger = logging.getLogger(__name__)

_KNOWLEDGE_BASE = {
    "module_4_spatial": [
        "A batch reactor is a closed vessel where reactants are added, allowed to react over time, "
        "and then the products are removed. Pressure and temperature typically rise together as the reaction proceeds.",
        "The governing equations for a dynamic system describe how key variables (pressure, temperature, "
        "concentration) change over time based on mass and energy balances.",
        "A spatial model viewer renders the vessel, its inlet and outlet streams, and its instrumentation "
        "as an interactive 3D scene so students can relate the equations to physical equipment.",
        "In a well-mixed batch reactor the composition is uniform throughout the vessel, so the mass "
        "balance is written for the whole reactor rather than for a differential volume.",
    ],
    # The dashboard shows this module, so without material here the tutor
    # answered every question about it with "No specific course material
    # found" -- the single most visible grounding gap in the product.
    "module_2_thermo": [
        "Batch pyrolysis is the thermal decomposition of biomass in the absence of oxygen. "
        "The feedstock is sealed in the reactor and heated, so no combustion occurs.",
        "The energy balance for a batch pyrolysis reactor relates the heat supplied to the sensible "
        "heating of the biomass, the endothermic heat of reaction, and the heat carried away by the "
        "evolving volatile gases.",
        "Pyrolysis products are divided into three fractions: a solid char, a condensable liquid "
        "often called bio-oil, and a non-condensable gas mixture of carbon monoxide, hydrogen and methane.",
        "Because the reactor is sealed, pressure rises as volatiles are released. Temperature and "
        "pressure therefore climb together until the volatiles are drawn off.",
        "Reaction rate is strongly temperature dependent and is commonly modelled with an Arrhenius "
        "expression, where the rate constant rises exponentially with temperature.",
    ],
    "module_6_fourier": [
        "A Fourier series decomposes a periodic function into a sum of sine and cosine terms. "
        "Each term is a harmonic whose frequency is an integer multiple of the fundamental.",
        "The Fourier coefficients are found by integrating the function against each sine and cosine "
        "over one period. This projection is what makes the series the natural basis for periodic signals.",
        "A square wave needs only odd harmonics, with amplitudes falling as one over the harmonic "
        "number. Adding more terms sharpens the edges but never removes the overshoot at a discontinuity.",
        "The overshoot at a jump discontinuity is called the Gibbs phenomenon. It does not vanish as "
        "more terms are added; it only narrows toward the discontinuity.",
    ],
}

FALLBACK_CONTEXT = "No specific course material found for this module."

# Display metadata for each module, kept beside the material so the two cannot
# drift. The dashboard used to hardcode both the module ids and their titles, so
# adding a module here left it invisible there, and renaming one here left the
# dashboard sending an id with no material behind it. `list_modules` below
# derives the catalogue from the material itself rather than from this dict
# alone: a module named here with no chunks is never advertised.
_MODULE_META = {
    "module_2_thermo": {
        "number": 2,
        "title": "Batch Pyrolysis Reactors",
        "course": "Applied Thermodynamics",
    },
    "module_4_spatial": {
        "number": 4,
        "title": "Spatial Model Viewer",
        "course": "Process Systems Engineering",
    },
    "module_6_fourier": {
        "number": 6,
        "title": "Fourier Series Expansions",
        "course": "Numerical Methods & Algorithms",
    },
}

_embedding_cache: dict[str, np.ndarray] = {}


def _embed(text: str) -> np.ndarray:
    if text not in _embedding_cache:
        response = get_openai_client().embeddings.create(
            model=settings.EMBEDDING_MODEL, input=text
        )
        _embedding_cache[text] = np.array(response.data[0].embedding)
    return _embedding_cache[text]


def _cosine(a: np.ndarray, b: np.ndarray) -> float:
    denom = np.linalg.norm(a) * np.linalg.norm(b)
    if denom == 0:
        # A zero vector would otherwise divide by zero and yield nan, which
        # sorts unpredictably and silently corrupts the ranking.
        return 0.0
    return float(np.dot(a, b) / denom)


def retrieve_context(module_id: str, query: str, top_k: int = 2) -> str:
    chunks = _KNOWLEDGE_BASE.get(module_id, [])
    if not chunks:
        return FALLBACK_CONTEXT

    if not settings.EMBEDDING_MODEL:
        # Provider has no embeddings endpoint (Groq, for one). Hand over the
        # whole module rather than slicing to top_k: with no ranking to order
        # by relevance, a slice would drop chunks by file order instead, which
        # is how a 5-chunk module would silently lose 3 of them.
        return "\n".join(chunks)

    try:
        query_vec = _embed(query)
        scored = sorted(
            ((_cosine(query_vec, _embed(chunk)), chunk) for chunk in chunks),
            key=lambda pair: pair[0],
            reverse=True,
        )
        return "\n".join(chunk for _, chunk in scored[:top_k])
    except Exception:
        # Embeddings only rank the material — they aren't the answer. If OpenAI
        # is unreachable, hand the model the unranked chunks instead of failing
        # an otherwise perfectly serviceable request.
        logger.exception(
            "embedding lookup failed for module_id=%s; falling back to unranked context", module_id
        )
        return "\n".join(chunks)


def list_modules() -> list[dict]:
    """The course catalogue the dashboard renders.

    Only modules that actually have material are listed, so a card can never
    lead to a module the tutor has nothing to say about. Sorted by id for a
    stable order across requests.
    """
    catalogue = []
    for module_id in sorted(_KNOWLEDGE_BASE):
        meta = _MODULE_META.get(module_id)
        if not _KNOWLEDGE_BASE[module_id] or meta is None:
            continue
        catalogue.append(
            {
                "id": module_id,
                "number": meta["number"],
                "title": meta["title"],
                "course": meta["course"],
                # Pre-formatted so the client never has to reconstruct the
                # "Module N: Title" chip and get the wording subtly wrong.
                "label": f"Module {meta['number']}: {meta['title']}",
            }
        )
    return catalogue
