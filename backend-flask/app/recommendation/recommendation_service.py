from typing import List, Dict, Any
from ..cloth.db_service import get_all_items, get_relevant_items_by_shared_styles
from .embedding_service import prefilter_candidates
from .llm_service import ask_openrouter_for_outfit
from .parser import map_ai_json_to_db_items

# def recommend_outfit(selected_item_id: int, all_items: List[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
#     if all_items is None:
#         all_items = get_all_items()

#     selected_item = next((item for item in all_items if item['id'] == selected_item_id), None)
#     if not selected_item:
#         raise ValueError(f"Item with id {selected_item_id} not found")

#     shortlist = prefilter_candidates(selected_item, all_items, top_k=3)
#     ai_text = ask_openrouter_for_outfit(shortlist, selected_item)
#     outfit = map_ai_text_to_db_items(ai_text, all_items)
#     return outfit

def recommend_outfit(selected_item_id: int):
    """
    Full recommendation pipeline:
    1. Fetch selected item + related items.
    2. Prefilter candidates with embeddings.
    3. Call LLM for outfit generation.
    4. Map AI text to full item info for frontend.
    """
    selected_item, relevant_style_items = get_relevant_items_by_shared_styles(selected_item_id, top_n_per_category=3)
    
    if not selected_item:
        raise ValueError("Selected item not found")

    if not relevant_style_items:
        raise ValueError("No related items found")

    prefilter_shortlist = prefilter_candidates(selected_item, relevant_style_items, top_k=3)
    ai_res_json = ask_openrouter_for_outfit(prefilter_shortlist, selected_item)
    outfit = map_ai_json_to_db_items(ai_res_json, relevant_style_items)
    return outfit