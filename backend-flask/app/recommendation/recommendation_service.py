from typing import List, Dict, Any
from ..cloth.db_service import get_all_items
from .embedding_service import prefilter_candidates
from .llm_service import ask_openrouter_for_outfit
from .parser import map_ai_text_to_db_items

def recommend_outfit(selected_item_id: int, all_items: List[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    if all_items is None:
        all_items = get_all_items()

    selected_item = next((item for item in all_items if item['id'] == selected_item_id), None)
    if not selected_item:
        raise ValueError(f"Item with id {selected_item_id} not found")

    shortlist = prefilter_candidates(selected_item, all_items, top_k=3)
    ai_text = ask_openrouter_for_outfit(shortlist, selected_item)
    outfit = map_ai_text_to_db_items(ai_text, all_items)
    return outfit