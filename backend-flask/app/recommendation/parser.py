
def map_ai_text_to_db_items(ai_text, all_items):
    """
    Convert AI plain text into your full clothes dicts using your DB items for image_url, id, etc.
    """
    outfit = {}
    lines = ai_text.strip().split("\n")
    for line in lines:
        if not line.strip():
            continue
        try:
            category_part, rest = line.split(":", 1)
            category = category_part.strip().lower()
            value = rest.strip()

            if category == "style phrase":
                outfit["_style_phrase"] = value
                continue

            # Find the DB item that matches name and category (or more fields if needed)
            db_item = next(
                (item for item in all_items if str(item["id"]) == value),
                None
            )

            if db_item:
                # keep same as DB item structure
                outfit[category] = {
                    "id": db_item.get("id"),
                    "type": db_item.get("type"),
                    "name": db_item.get("name"),
                    "colour": db_item.get("colour"),
                    "image_url": db_item.get("image_url"),
                    "styles": db_item.get("clothes_styles", [])
                }
        except Exception as e:
            print("Failed to parse line:", line, e)
    return outfit