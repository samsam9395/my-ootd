import ast
from app.cloth.db_service import get_all_cloth_embedding, get_details_for_ids

import numpy as np
from time import time
from app.memory_logger import log_memory
from app.utils import get_current_user_id
log_memory("startup embedding_service")

# Cache
EMBED_CACHE = {}
CACHE_TTL = 60 * 60  # 1 hour
TOP_N_PER_CATEGORY = 3


# Clear cache (e.g. on new cloth added)
def clear_user_embeddings(user_id):
    if user_id in EMBED_CACHE:
        del EMBED_CACHE[user_id]

# Fetch cached embeddings from memory or Supabase
def get_all_embeddings():
    """Fetch cached embeddings + categories from memory or Supabase."""
    user_id = get_current_user_id()
    now = time()
    cache = EMBED_CACHE.get(user_id)

    # 1️⃣ Use cache if valid
    if cache and now - cache["timestamp"] < CACHE_TTL:
        print('will use cache!!')
        return cache["ids"], cache["embeddings"], cache["norms"], cache["categories"]

    # 2️⃣ Fetch from Supabase
    data = get_all_cloth_embedding()
    if not data:
        return [], np.empty((0, 1536), dtype=np.float32), np.empty((0, 1536), dtype=np.float32), []

    ids = []
    embeddings_list = []
    categories = []

    for row in data:
        emb = row.get("embedding")
        if not emb:
            continue
        # Convert string embedding to numeric array (float32)
        if isinstance(emb, str):
            emb = np.array(ast.literal_eval(emb), dtype=np.float32)
        else:
            emb = np.array(emb, dtype=np.float32)
        embeddings_list.append(emb)
        ids.append(row["id"])
        categories.append(row["category"])

    if not embeddings_list:
        # No valid embeddings
        return [], np.empty((0, 1536), dtype=np.float32), np.empty((0, 1536), dtype=np.float32), []

    embeddings = np.stack(embeddings_list, axis=0)  # shape (N, D)

    # Normalize embeddings (float32)
    norms = embeddings / np.linalg.norm(embeddings, axis=1, keepdims=True).astype(np.float32)

    # 3️⃣ Update cache
    EMBED_CACHE[user_id] = {
        "ids": ids,
        "embeddings": embeddings,
        "norms": norms,
        "categories": categories,
        "timestamp": now,
    }

    return ids, embeddings, norms, categories

# Prefilter with embedding cosine similarity
def create_candidate_by_category(selected_item_id:int):
    """
    Group items by category for prefiltering.
    all_items: list of dicts with 'type', 'name', 'colour', 'styles' (list of strings)
    Returns: dict {selected_item, candidates_by_category}    
    """
    # --- Step 0: extract ids, embeddings, categories ---
    ids, embeddings, norms, categories = get_all_embeddings()
    print('all ids:', ids)
    log_memory("After get_all_embeddings()")
    
    # --- Step 1: locate selected item ---
    selected_idx = ids.index(selected_item_id)
    selected_vec = embeddings[selected_idx]
    selected_cat = categories[selected_idx]
    
    # --- Step 1.5: apply category rules ---
    def should_exclude_category(selected_category, candidate_category):
        """Returns True if candidate_category should be excluded based on selected_category"""
        # Rule 1: if selected is dress, exclude top and bottom
        if selected_category == 'dress' and candidate_category in ['top', 'bottom']:
            return True
        # Rule 2: if selected is top or bottom, exclude dress
        if selected_category in ['top', 'bottom'] and candidate_category == 'dress':
            return True
        return False
    
    candidate_indices = [
        i for i in range(len(ids))
        if ids[i] != selected_item_id  # not the selected item itself
        and categories[i] != selected_cat  # not same category
        and not should_exclude_category(selected_cat, categories[i])  # not excluded by rules
    ]
    
    # --- Step 2: cosine similarity using cache---
    candidate_norms = norms[candidate_indices]
    sims = np.dot(candidate_norms, selected_vec)
    log_memory("After cosine similarity")
    
    # --- Step 3: score and group by category ---
    scored = [
        {"id": ids[idx], "sim": sims[i], "category": categories[idx]}
        for i, idx in enumerate(candidate_indices)
    ]

    grouped = {}
    for item in scored:
        cat = item["category"]
        grouped.setdefault(cat, []).append(item)
    
    # --- Step 5: pick top-N per category ---
    top_ids = []
    for cat, items in grouped.items():
        top_items = sorted(items, key=lambda x: x["sim"], reverse=True)[:TOP_N_PER_CATEGORY]
        top_ids.extend([i["id"] for i in top_items])
    
    # --- Step 6: fetch all details in one query (selected + top candidates) ---
    fetch_ids = [selected_item_id] + top_ids
    all_details = get_details_for_ids(fetch_ids, with_image=False)
    log_memory("After get_details_for_ids()")
    
    # --- Step 7: split selected vs candidates ---
    selected_item = next((i for i in all_details if i["id"] == selected_item_id), None)
    candidates_by_category = {cat: [] for cat in grouped.keys()}
    
    for cat, items in grouped.items():
        ids_list = [i["id"] for i in items]
        candidates_by_category[cat] = [i for i in all_details if i["id"] in ids_list]

    return {
        "selected_item": selected_item,
        "candidates_by_category": candidates_by_category
    }