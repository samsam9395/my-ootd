
from .embedding_service import create_candidate_by_category
from .llm_service import ask_openrouter_for_outfit
from .parser import map_ai_json_to_db_details
from app.memory_logger import log_memory


# Simple memory cache { user_id: { 'embeddings': np.ndarray, 'ids': list, 'timestamp': float } }


# def recommend_outfit(selected_item_id: int):
#     """
#     Full recommendation pipeline:
#     1. Fetch selected item.
#     2. Fetch related items with same style tag.
#     3. Prefilter candidates with embeddings.
#     4. Call LLM for outfit generation.
#     5. Map AI text to full item info for frontend.
#     """
#     from ..cloth.db_service import get_relevant_items_by_shared_styles

#     log_memory("Start of request")
#     selected_item, relevant_style_items = get_relevant_items_by_shared_styles(selected_item_id, top_n_per_category=3)
    
#     if not selected_item:
#         raise ValueError("Selected item not found")

#     if not relevant_style_items:
#         raise ValueError("No related items found")
#     log_memory("After prefilter")
#     prefilter_shortlist = prefilter_candidates(selected_item, relevant_style_items, top_k=3)
#     log_memory("After prefilter encoding query")
#     ai_res_json = ask_openrouter_for_outfit(prefilter_shortlist, selected_item)
#     log_memory("After AI response")
#     outfit = map_ai_json_to_db_items(ai_res_json, relevant_style_items)
#     log_memory("After mapping AI to DB items")
#     return outfit



def recommend_outfit(selected_item_id:int):
    """
    Recommendation pipeline:
    1. Get cached embeddings for all user's items
    2. Compute cosine similarity
    3. Pick top-N items per category (e.g. 3 tops, 3 bottoms, etc.)
    4. Use LLM to pick one per category and generate outfit description
    5. Map AI response to full item details for frontend
    6. Return outfit
    """
    # user_id = get_current_user_id()
    log_memory("Start of request")
    # Step 1 + 2 + 3: call get_all_embeddings() to get cached embeddings + perform top-N per category
    prefilter_candidates = create_candidate_by_category(selected_item_id)
    log_memory("After prefilter")
    # Step 4: fetch selected item details and top candidates details
    selected_item = prefilter_candidates["selected_item"]
    candidates_by_category = prefilter_candidates["candidates_by_category"]
    ai_res_json = ask_openrouter_for_outfit(candidates_by_category, selected_item)
    log_memory("After AI response")
    print('ai_res_json:', ai_res_json)
    
    # Step 5: call LLM with prefilter_candidates + selected item
    outfit = map_ai_json_to_db_details(ai_res_json)
    log_memory("After mapping AI to DB items")
    return outfit
    
