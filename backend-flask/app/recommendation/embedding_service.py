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
        styles = " ".join([cs['styles']['name'] for cs in item.get('clothes_styles', [])])
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

# ---------- 1. Prefilter with embeddings ----------
def prefilter_candidates(selected_item, all_items, top_k=3):
    """
    Select top_k similar items per category using embeddings.
    selected_item: dict {type, name, colour, styles}
    all_items: list of dicts
    """

    # Load embedding model once
    embedder = SentenceTransformer("all-MiniLM-L6-v2")
    print("selected_item",selected_item)
   
    styles_list = [cs['styles']['name'] for cs in selected_item['clothes_styles']]
    styles_str = ", ".join(styles_list)
    selected_text = f"{selected_item['type']}: {selected_item['name']}, {selected_item['colour']}, styles: {styles_str}"

    print("selected_text",selected_text)
    selected_emb = embedder.encode(selected_text, convert_to_tensor=True)

    shortlist = {}


    for category in ["top","bottom", "outerwear", "shoes", "accessory"]:
        # filter by category
        candidates = [i for i in all_items if i["type"] == category]
        if not candidates:
            continue

        # encode candidates
        texts = []
        for c in candidates:
            style_names = [cs['styles']['name'] for cs in c.get('clothes_styles', [])]
            styles_str = ", ".join(style_names)
            texts.append(f"{c['type']} (id: {c['id']}): {c['name']}, {c['colour']}, styles: {styles_str}")
        embeddings = embedder.encode(texts, convert_to_tensor=True)

        # cosine similarity
        cos_scores = util.cos_sim(selected_emb, embeddings)[0]
        top_indices = torch.topk(cos_scores, k=min(top_k, len(candidates))).indices.tolist()

        shortlist[category] = [candidates[i] for i in top_indices]

    return shortlist
