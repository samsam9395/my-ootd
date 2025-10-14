
from .embedding_service import create_candidate_by_category
from .llm_service import ask_openrouter_for_outfit
from .parser import map_ai_json_to_db_details
from app.memory_logger import log_memory


def recommend_outfit(selected_item_id:int):
    """
    Recommendation pipeline:
    1. Get cached embeddings for all user's items
    2. Compute cosine similarity -> use huggingface api due to server memory limit
    3. Pick top-N items per category (e.g. 3 tops, 3 bottoms, etc.)
    4. Use LLM to pick one per category and generate outfit description
    5. Map AI response to full item details for frontend
    6. Return outfit
    """
    log_memory("Start of request")
    # Step 1 + 2 + 3: call get_all_embeddings() to get cached embeddings + perform top-N per category
    prefilter_candidates = create_candidate_by_category(selected_item_id)
    log_memory("After prefilter")
    
    # Step 4: fetch selected item details and top candidates details
    selected_item = prefilter_candidates["selected_item"]
    candidates_by_category = prefilter_candidates["candidates_by_category"]
    
    # Step 5: call LLM with prefilter_candidates + selected item
    ai_res_json = ask_openrouter_for_outfit(candidates_by_category, selected_item)
    log_memory("After AI response")
    print('ai_res_json:', ai_res_json)
    
    # Step 6: map AI response (category -> cloth_id) to full DB details
    outfit = map_ai_json_to_db_details(ai_res_json)
    log_memory("After mapping AI to DB items")
    return outfit
    
