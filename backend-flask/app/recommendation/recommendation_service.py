from .embedding_service import prefilter_candidates
from .llm_service import ask_openrouter_for_outfit
from .parser import map_ai_json_to_db_items
from ..memory_logger import log_memory

def recommend_outfit(selected_item_id: int):
    """
    Full recommendation pipeline:
    1. Fetch selected item + related items.
    2. Prefilter candidates with embeddings.
    3. Call LLM for outfit generation.
    4. Map AI text to full item info for frontend.
    """
    from ..cloth.db_service import get_relevant_items_by_shared_styles

    log_memory("Start of request")
    selected_item, relevant_style_items = get_relevant_items_by_shared_styles(selected_item_id, top_n_per_category=3)
    
    if not selected_item:
        raise ValueError("Selected item not found")

    if not relevant_style_items:
        raise ValueError("No related items found")
    log_memory("After prefilter")
    prefilter_shortlist = prefilter_candidates(selected_item, relevant_style_items, top_k=3)
    log_memory("After prefilter encoding query")
    ai_res_json = ask_openrouter_for_outfit(prefilter_shortlist, selected_item)
    log_memory("After AI response")
    outfit = map_ai_json_to_db_items(ai_res_json, relevant_style_items)
    log_memory("After mapping AI to DB items")
    return outfit