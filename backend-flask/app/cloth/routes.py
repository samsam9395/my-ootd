
from flask import Blueprint, request, jsonify
from app.auth.auth_utils import token_required

# define the blueprint
bp = Blueprint("clothes", __name__)

from .db_service import (
    fetch_style_tags,
    get_random_items,
    insert_cloth_with_styles_embedding,
    delete_cloth_in_db,
    get_clothes_by_type,
    update_cloth_url
)     

# Get cloth by type
@bp.route("", methods=["GET"])
@token_required
def get_wardrobe():
    category = request.args.get("type", "all").lower()
    limit = int(request.args.get("limit", 3))
    offset = int(request.args.get("offset", 0))
   
    if category == "" or category == "all":
        clothes = get_clothes_by_type(None, limit, offset)  # no filter
    else:
        clothes = get_clothes_by_type(category, limit, offset)

    return jsonify(clothes)

# Create new cloth with embedding and styles
@bp.route("", methods=["POST"])
@token_required
def insert_update_cloth():
    data = request.json
    try:
        result = insert_cloth_with_styles_embedding(data)
        if not result:
            return jsonify({"message": "Insert failed"}), 500

        return jsonify(result), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 500



# Update cloth image URL only (for add cloth items)
@bp.route("/<int:id>/image", methods=["PUT"])
@token_required
def update_cloth_image(id):
    data = request.json
    image_url = data.get("image_url")
    if not image_url:
        return jsonify({"success": False, "message": "image_url is required"}), 400
    
    try:
        result = update_cloth_url(id, image_url)
        if not result:
            return jsonify({"success": False, "message": "Failed to update image"}), 500
        return jsonify({"success": True, "image_url": image_url}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# Get random clothes for Shuffle
@bp.route("/random", methods=["GET"])
@token_required
def get_random_clothes():
    try:

        items = get_random_items()
        return jsonify(items)
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    
    
# Fetch style tags
@bp.route("/style-tags", methods=["GET"])
@token_required
def get_style_tags():
    tags = fetch_style_tags()
    return jsonify(tags)


#Delete cloth item
@bp.route("/<int:id>", methods=["DELETE"])
@token_required
def delete_cloth(id):
    """" Delete cloth and its image by id """
    if not id:
        return jsonify({"message": "Cloth ID is required"}), 400
    try:
        success = delete_cloth_in_db(id)
        if not success:
            return jsonify({"message": "Cloth not found or delete failed"}), 404
        
        return jsonify({"message": "Cloth deleted successfully"}), 200
    
    except Exception as e:

        return jsonify({"message": "An error occurred while deleting the cloth item", "error": str(e)}), 500
    


