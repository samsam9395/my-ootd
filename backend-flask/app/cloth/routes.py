
from flask import Blueprint, request, jsonify
import os

from app.auth.auth_utils import token_required

# define the blueprint
bp = Blueprint("clothes", __name__)

from .db_service import (
    get_all_items,
    fetch_style_tags,
    create_style_tags,
    insert_cloth,
    insert_cloth_style_relation,
    get_random_items,
    insert_cloth_with_styles_embedding,
    update_cloth_in_db,
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

#Create new cloth item
@bp.route("", methods=["POST"])
@token_required
def add_cloth():
    """
    Expecting JSON body:
    {
        "name": "T-shirt",
        "colour": "Red",
        "image_url": "https://..."
    }
    """
    data = request.json

    # Basic validation
    if not all([data.get("name"), data.get("type"), data.get("category"),
                data.get("colour")]):
        return jsonify({"message": "Missing required fields"}), 400

    cloth = insert_cloth(
    name=data.get("name", "").strip(),
    type_=data.get("type", "").strip(),
    category=data.get("category", "").strip(),
    colour=data.get("colour", "").strip()
)
    if not cloth:
        return jsonify({"message": "Insert failed"}), 500

    return jsonify(cloth), 201


# Update existing cloth 
@bp.route("/<int:id>", methods=["PUT"])
@token_required
def update_cloth(id):
    data = request.json
    try:
        result = update_cloth_in_db(id, data)
        if not data:
            return jsonify({"message": "No valid fields to update"}), 400
        return jsonify({"success": True, "updated": result}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

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

# Add new style tags
@bp.route("/style-tags", methods=["POST"])
@token_required
def add_style_tags():
    data = request.json
    """
    Expecting { names: ["casual", "formal", ...] }
    """
    names: list[str] = data.get("names", [])
    if not names:
        return jsonify({"message": "No style names provided"}), 400

    add_styles_res = create_style_tags(
        names=[name.lower() for name in names]
    )
    return jsonify(add_styles_res)


# Add styles to a cloth item
@bp.route("/cloth_styles", methods=["POST"])
@token_required
def add_cloth_styles():
    """
    Expecting JSON body:
    [
        {"cloth_id": 1, "style_id": 2},
        {"cloth_id": 1, "style_id": 3}
    ]
    """
    data = request.json

    if not isinstance(data, list) or not data:
        return jsonify({"message": "Invalid input, expected a non-empty list"}), 400
    try:
        response = insert_cloth_style_relation(data)

        return jsonify(response), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 500

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
    

# Create new cloth with embedding
@bp.route("/embedded", methods=["POST"])
@token_required
def insert_cloth_embedded():
    data = request.json
    try:
        result = insert_cloth_with_styles_embedding(data)
        if not result:
            return jsonify({"message": "Insert failed"}), 500

        return jsonify(result), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 500