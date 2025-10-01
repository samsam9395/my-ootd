from supabase import create_client
from flask import current_app
import unicodedata

_supabase = None

def get_supabase():
    global _supabase
    if _supabase is None:
        _supabase = create_client(
            current_app.config["SUPABASE_URL"],
            current_app.config["SUPABASE_KEY"]
        )
    return _supabase

# Fetch cloth by type and pagination
def get_clothes_by_type(category: str | None, limit: int, offset: int):
    supabase = get_supabase()
    query = supabase.table("clothes").select("""
        id, name, type, colour, category, image_url,
        clothes_styles!inner(
            styles!inner(id, name)
        )
    """).range(offset, offset + limit - 1)
    print('query in DB:', query)
    if category:  # only filter if category is specified
        query = query.eq("category", category)

    data = query.execute()
    result = [
        {
            "id": row["id"],
            "name": row["name"],
            "type": row["type"],
            "colour": row["colour"],
            "category": row["category"],
            "styles": [cs["styles"]["name"] for cs in row.get("clothes_styles", []) if cs.get("styles")],
            "image_url": row["image_url"]
        }
        for row in data.data
    ]
    return result

# Fetch all items
def get_all_items():
    supabase = get_supabase()
    try:
        response = supabase.table("clothes").select("""
            id,
            name,
            type,
            colour,
            category,
            image_url,
            clothes_styles (
                styles (
                    id,
                    name
                )
            )
        """).execute()
        
        return response.data
    except Exception as e:
        print("Error fetching items:", e)
        return None
   

# Fetch all style tags
def fetch_style_tags():
    supabase = get_supabase()
    try:
        response = supabase.table("styles").select("*").execute()
        return response.data
    except Exception as e:
        print("Error fetching style tags:", e)
        return None

# Add new style tags
def create_style_tags(names):
    supabase = get_supabase()
    new_tags = [{"name": name.strip().lower()} for name in names if name.strip()]
    
    if not new_tags:  # nothing new
        return []  

    try:
        response = supabase.table("styles").upsert(new_tags).execute()
        return response.data  # this is already your inserted rows
    except Exception as e:
        # handle the Supabase error
        print("Error inserting style tags:", e)
        return None

# Add cloth style relation table
def insert_cloth_style_relation(cloth_styles):
    supabase = get_supabase()
    try:
        response = supabase.table("clothes_styles").upsert(cloth_styles).execute()
        return response.data
    except Exception as e:
        print("Error inserting cloth styles:", e)
        return None

# Get random 5 items for Shuffle
def get_random_items():
    supabase = get_supabase()
    try:
        response = supabase.rpc("get_random_clothes", {"limit_count": 5}).execute()
        return response.data

    except Exception as e:
        print("Error fetching random items:", e)
        return None
    


# Add cloth item
def insert_cloth(name,type_, category, colour, image_url):
    supabase = get_supabase()
    # Normalize here
    clean_name = unicodedata.normalize('NFC', name)
    name = clean_name.strip()
    type_ = unicodedata.normalize('NFC', type_).strip().lower()
    category = unicodedata.normalize('NFC', category).strip().lower()
    colour = unicodedata.normalize('NFC', colour).strip().lower()

    try:
            # 1. Check if cloth with the same name exists
        existing = supabase.table("clothes").select("*").eq("name", name).execute()
        
        if existing.data and len(existing.data) > 0:
            # 2. Update existing row
            cloth_id = existing.data[0]["id"]
            response = supabase.table("clothes").update({
                "type": type_,
                "category": category,
                "colour": colour,
                "image_url": image_url
            }).eq("id", cloth_id).execute()
            return response.data[0]
        else:
            # 3. Insert new row
            response = supabase.table("clothes").insert({
                "name": name,
                "type": type_,
                "category": category,
                "colour": colour,
                "image_url": image_url
            }).execute()
            return response.data[0] if response.data else None
    except Exception as e:
        print("Error inserting cloth:", e)
        return None


    # Update existing cloth item using RPC (transactional)
def update_cloth_in_db(cloth_id, cloth_data):
    supabase = get_supabase()

    try:
        # 1. Extract style IDs from input
        style_ids = []
        new_style_names = []

        for s in cloth_data.get("styles", []):
            if s.get("id"):  # existing style
                style_ids.append(int(s["id"]))
            elif s.get("name"):  # new style
                new_style_names.append(s["name"].strip().lower())

        # 2. Ensure new styles exist (returns rows with IDs)
        new_style_rows = create_style_tags(new_style_names) if new_style_names else []

        # 3. Combine all style IDs
        all_style_ids = style_ids + [row["id"] for row in (new_style_rows or [])]

        # 4. Call the RPC to update cloth and relations in a transaction
        response = supabase.rpc(
    "update_cloth_with_styles",
    {
        "p_cloth_id": cloth_id,
        "p_name": cloth_data["name"],
        "p_colour": cloth_data["colour"],
        "p_type": cloth_data["type"],
        "p_style_ids": all_style_ids  # list of integers
    }
).execute()
        print("RPC response:", response)

        return {"success": True}

    except Exception as e:
        print("Error in update_cloth_in_db:", e)
        return {"success": False, "error": str(e)}
        

# Delete cloth item
def delete_cloth_in_db(cloth_id: int) -> bool:
    """
    Deletes a cloth item by its ID.
    Returns True if deletion succeeded, False otherwise.
    """
    supabase = get_supabase()
    res = supabase.table("clothes").delete().eq("id", cloth_id).execute()
    
    # res.data is a list of deleted rows
    return bool(res.data)  # True if at least one row deleted