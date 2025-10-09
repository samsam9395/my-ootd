from flask import Blueprint, request, jsonify, current_app

from app.auth.auth_utils import token_required
from .embedding_service import recommend_clothes, prefilter_candidates
from .recommendation_service import recommend_outfit

# define the blueprint
bp = Blueprint("recommendations", __name__)

@bp.route("/ai", methods=["POST"])
@token_required
def recommend_ai():
    data = request.json
    try:
            selected_item_id = int(data.get("item_id"))  # <--- convert to int
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid item_id"}), 400
    
    try:
        outfit = recommend_outfit(
            selected_item_id=selected_item_id)
        return jsonify(outfit)
    except Exception as e:
        print("Error in /recommend_ai:", e)
        return jsonify({"error": str(e)}), 500