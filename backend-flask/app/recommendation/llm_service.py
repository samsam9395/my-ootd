import requests
import json

# ---------- 2. Ask Hugging Face LLM ----------
# def ask_ai_for_outfit(shortlist, selected_item, inference):
#     # Build selected item text
#     style_names = [cs['styles']['name'] for cs in selected_item.get('clothes_styles', [])]
#     prompt = f"You are a fashion stylist. Suggest a set of matching outfit for:\n"
#     prompt += f"- {selected_item['name']}, color: {selected_item['colour']}, style: {', '.join(style_names)}\n\n"

#     # Flatten candidates (exclude the selected item itself)
#     prompt += "Here are the candidates:\n"
#     for category, items in shortlist.items():
#         for item in items:
#             if item['id'] == selected_item['id']:
#                 continue  # skip the selected item
#             item_styles = ", ".join([cs['styles']['name'] for cs in item.get("clothes_styles", [])])
#             prompt += f"- {item['type']}: {item['name']}, color: {item['colour']}, styles: {item_styles}\n"

#     # One instruction at the end
#     prompt += (
#         "\nPick ONE item from each category if available. "
#         "Only include categories that have candidates. "
#         "Return the outfit in the format: top, bottom, outerwear, shoes, accessories. "
#         "For missing categories, just skip them."
#     )

#     print("AI prompt:", prompt)

#     # gemma-3 returns plain text, use raw_response
#     response = inference(prompt, raw_response=True)
#     generated_text = response.content.decode("utf-8").strip()
#     print("AI response:", generated_text)

#     return generated_text

def ask_openrouter_for_outfit(shortlist, selected_item, open_router_api_key):
    style_names = [cs['styles']['name'] for cs in selected_item.get('clothes_styles', [])]
    prompt = f"You are a fashion stylist. Create a complete outfit based on:\n"
    prompt += f"- {selected_item['name']}, color: {selected_item['colour']}, style: {', '.join(style_names)}\n\n"

    prompt += "Here are the candidates:\n"
    for category, items in shortlist.items():
        for item in items:
            if item['id'] == selected_item['id']:
                continue
            item_styles = ", ".join([cs['styles']['name'] for cs in item.get("clothes_styles", [])])
            prompt += f"- {item['type']} (id: {item['id']}): {item['name']}, color: {item['colour']}, styles: {item_styles}\n"

    prompt += (
    "\nInstructions:"
    "\n- Pick 1 item per category."
    "\n- If no perfect match, pick the closest."
    "\n- Return outfit in 'category: id' format for all given categories."
    "\n- After the outfit, add ONE short phrase describing the outfit’s overall style as: " "Style Phrase: (e.g., \"casual chic\", \"spring clean-fit\", \"all-white chic\")."
    "\n- Do NOT invent categories."
    "\n- Do NOT explain or justify your choices."
    )
    
    print("AI prompt:", prompt)
    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {open_router_api_key}",
            "Content-Type": "application/json",
        },
        data=json.dumps({
            "model": "nvidia/nemotron-nano-9b-v2:free",
            "max_reasoning_depth": 0,
            "messages": [{"role": "user", "content": prompt}],
        })
    )
    res_json = response.json()
    print("AI response:", res_json)
    return res_json["choices"][0]["message"]["content"]