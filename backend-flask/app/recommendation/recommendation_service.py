# recommendation/recommendation_service.py
from .db_service import get_all_items
from .embedding_service import prefilter_candidates, recommend_clothes
from .parser import map_ai_text_to_db_items
from .llm_service import ask_openrouter_for_outfit


def recommend_outfit(selected_item_id):
    all_items = get_all_items()
    selected_item = next((item for item in all_items if item['id'] == selected_item_id), None)
    shortlist = prefilter_candidates(selected_item, all_items, top_k=3)
    ai_text =  ask_openrouter_for_outfit(shortlist, selected_item)
    outfit = map_ai_text_to_db_items(ai_text, all_items)
    return outfit