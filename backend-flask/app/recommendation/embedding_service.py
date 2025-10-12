# from sentence_transformers import SentenceTransformer, util
# import torch

import ast
from app.cloth.db_service import get_all_cloth_embedding, get_details_for_ids

import numpy as np
from time import time
from app.memory_logger import log_memory
from app.utils import get_current_user_id


# Cache
EMBED_CACHE = {}
CACHE_TTL = 60 * 60  # 1 hour
TOP_N_PER_CATEGORY = 3

# Recommend clothes
# def recommend_clothes(selected_item, all_items, top_k=5):

#     # Exclude same type
#     candidates = [item for item in all_items if item['type'] != selected_item['type']]
#     if not candidates:
#         return []

#     # Prepare text
#     def get_text(item):
#         styles = " ".join(item.get('styles', []))
#         color = item.get('colour', '')
#         return f"{styles} {color} {item.get('description', '')}"

#     selected_text = get_text(selected_item)
#     selected_emb = model.encode(selected_text, convert_to_tensor=True)

#     candidate_texts = [get_text(item) for item in candidates]
#     candidate_embs = model.encode(candidate_texts, convert_to_tensor=True)

#     # Cosine similarity
#     cosine_scores = util.cos_sim(selected_emb, candidate_embs)[0]
#     top_results = torch.topk(cosine_scores, k=min(top_k, len(candidates)))
#     recommended_items = [candidates[i] for i in top_results.indices.tolist()]

#     return recommended_items


# Prefilter with embeddings 
# def prefilter_candidates(selected_item, all_items_by_category, top_k=3):
#     """
#     Select top_k similar items per category using embeddings.
#     selected_item: dict with 'type', 'name', 'colour', 'styles' (list of strings)
#     all_items_by_category: dict {category: [items]}
#     """


#     # Prepare selected item text
#     selected_styles = ", ".join(selected_item.get("styles", []))
#     selected_text = f"{selected_item['type']}: {selected_item['name']}, {selected_item['colour']}, styles: {selected_styles}"
#     selected_emb = embedder.encode(selected_text, convert_to_tensor=True)

#     shortlist = {}

#     for category, candidates in all_items_by_category.items():
#         if not candidates:
#             continue

#         # Encode candidate texts
#         texts = []
#         for c in candidates:
#             styles_str = ", ".join(c.get("styles", []))
#             texts.append(f"{c['type']} (id: {c['id']}): {c['name']}, {c['colour']}, styles: {styles_str}")
#         candidate_embs = embedder.encode(texts, convert_to_tensor=True)

#         # Cosine similarity
#         cos_scores = util.cos_sim(selected_emb, candidate_embs)[0]
#         top_indices = torch.topk(cos_scores, k=min(top_k, len(candidates))).indices.tolist()

#         shortlist[category] = [candidates[i] for i in top_indices]

#     return shortlist

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
        
    print('inside create_candidate_by_category, after checking cache')
    # --- Step 1: locate selected item ---
    selected_idx = ids.index(selected_item_id)
    selected_vec = embeddings[selected_idx]
    selected_cat = categories[selected_idx]
    
    # --- Step 2: cosine similarity using cache---
    sims = np.dot(norms, selected_vec)
    log_memory("After cosine similarity")
    # --- Step 3: score and group by category, skip selected itself ---
    scored = [
        {"id": ids[i], "sim": sims[i], "category": categories[i]}
        for i in range(len(ids))
        if ids[i] != selected_item_id
    ]

    grouped = {}
    for item in scored:
        cat = item["category"]
        if cat == selected_cat:
            continue  # skip same category if desired
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