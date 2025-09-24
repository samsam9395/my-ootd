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


# Update existing cloth item
def update_cloth_in_db(cloth_id, name=None, type_=None, colour=None):
    supabase = get_supabase()
    updates = {}
    if name is not None:
        updates["name"] = name
    if type_ is not None:
        updates["type"] = type_
    if colour is not None:
        updates["colour"] = colour

    if not updates:
        return None  # nothing to update

    result = (
        supabase.table("clothes")
        .update(updates)
        .eq("id", cloth_id)
        .execute()
    )

    if not result.data:
        return None
    return result.data[0]

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