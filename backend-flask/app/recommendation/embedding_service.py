from sentence_transformers import SentenceTransformer, util
import torch


# Recommend clothes
def recommend_clothes(selected_item, all_items, top_k=5, model_name="all-MiniLM-L6-v2"):
    model = SentenceTransformer(model_name)

    # Exclude same type
    candidates = [item for item in all_items if item['type'] != selected_item['type']]
    if not candidates:
        return []

    # Prepare text
    def get_text(item):
        styles = " ".join(item.get('styles', []))
        color = item.get('colour', '')
        return f"{styles} {color} {item.get('description', '')}"

    selected_text = get_text(selected_item)
    selected_emb = model.encode(selected_text, convert_to_tensor=True)

    candidate_texts = [get_text(item) for item in candidates]
    candidate_embs = model.encode(candidate_texts, convert_to_tensor=True)

    # Cosine similarity
    cosine_scores = util.cos_sim(selected_emb, candidate_embs)[0]
    top_results = torch.topk(cosine_scores, k=min(top_k, len(candidates)))
    recommended_items = [candidates[i] for i in top_results.indices.tolist()]

    return recommended_items


# Prefilter with embeddings 
def prefilter_candidates(selected_item, all_items_by_category, top_k=3, model_name="all-MiniLM-L6-v2"):
    """
    Select top_k similar items per category using embeddings.
    selected_item: dict with 'type', 'name', 'colour', 'styles' (list of strings)
    all_items_by_category: dict {category: [items]}
    """

    # Load embedding model once
    embedder = SentenceTransformer(model_name)

    # Prepare selected item text
    selected_styles = ", ".join(selected_item.get("styles", []))
    selected_text = f"{selected_item['type']}: {selected_item['name']}, {selected_item['colour']}, styles: {selected_styles}"
    selected_emb = embedder.encode(selected_text, convert_to_tensor=True)

    shortlist = {}

    for category, candidates in all_items_by_category.items():
        if not candidates:
            continue

        # Encode candidate texts
        texts = []
        for c in candidates:
            styles_str = ", ".join(c.get("styles", []))
            texts.append(f"{c['type']} (id: {c['id']}): {c['name']}, {c['colour']}, styles: {styles_str}")
        candidate_embs = embedder.encode(texts, convert_to_tensor=True)

        # Cosine similarity
        cos_scores = util.cos_sim(selected_emb, candidate_embs)[0]
        top_indices = torch.topk(cos_scores, k=min(top_k, len(candidates))).indices.tolist()

        shortlist[category] = [candidates[i] for i in top_indices]

    return shortlist
   