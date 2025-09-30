from flask import Blueprint, request, jsonify, current_app
from ..cloth.db_service import (
    get_all_items,
)
from .embedding_service import recommend_clothes, prefilter_candidates
from .recommendation_service import recommend_outfit

# define the blueprint
bp = Blueprint("recommendations", __name__)

# Cosine similarity recommendation
@bp.route("/cosine",methods=["POST"])
def recommend_cosine():
    data = request.json
    selected_item_id = data.get("item_id")
    
    # Fetch all clothes using current app configs
    all_items = get_all_items()
    
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

# AI-based recommendation
@bp.route("/ai", methods=["POST"])
def recommend_ai():
    data = request.json
    selected_item_id = data.get("item_id")
    print("Selected item ID:", selected_item_id)
    try:
        outfit = recommend_outfit(
            selected_item_id=selected_item_id)
        return jsonify(outfit)
    except Exception as e:
        print("Error in /recommend_ai:", e)
        return jsonify({"error": str(e)}), 500