
from flask import Blueprint, request, jsonify, current_app
from .recommendation import (
    get_all_items,
    recommend_clothes,   # cosine similarity flow
    recommend_outfit,    # OpenRouter AI flow
)
from huggingface_hub import InferenceApi
import os

bp = Blueprint("routes", __name__)

@bp.route("/recommend_cosine",methods=["POST"])
def recommend_cosine():
    data = request.json
    selected_item_id = data.get("item_id")
    
    # Fetch all clothes using current app configs
    all_items = get_all_items(
        supabase_url=current_app.config["SUPABASE_URL"],
        supabase_key=current_app.config["SUPABASE_KEY"]
    )
    
    selected_item = next((item for item in all_items if item['id'] == selected_item_id), None)
    if not selected_item:
        return jsonify({"error": "Item not found"}), 404

    recs = recommend_clothes(
        selected_item,
        all_items,
        top_k=5,
        model_name=current_app.config["HF_MODEL_NAME"]
    )
    return jsonify(recs)

# Recommend with HF gemma-3
HF_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
inference = InferenceApi(repo_id="google/gemma-3-270m", token=HF_API_KEY)



OPENROUTER_API_KEY = os.getenv("OPEN_ROUTER_API_KEY")

@bp.route("/recommend_ai", methods=["POST"])
def recommend_ai():
    data = request.json
    selected_item_id = data.get("item_id")
    print('OPENROUTER_API_KEY:', OPENROUTER_API_KEY)
    print('HF_API_KEY:', HF_API_KEY)
    try:
        outfit = recommend_outfit(
            selected_item_id=selected_item_id,
            supabase_url=current_app.config["SUPABASE_URL"],
            supabase_key=current_app.config["SUPABASE_KEY"],
            # inference=OPENROUTER_API_KEY
            open_router_api_key=OPENROUTER_API_KEY
        )
        return jsonify(outfit)
    except Exception as e:
        return jsonify({"error": str(e)}), 500