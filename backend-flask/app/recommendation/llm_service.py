import requests
import json
import os


OPENROUTER_API_KEY = os.getenv("OPEN_ROUTER_API_KEY")


def ask_openrouter_for_outfit(shortlist, selected_item):
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
        "\n- Pick exactly **1 item per category** from the candidates list ONLY."
        "\n- You must return the **id** value of each chosen item (not its name)."
        "\n- Do NOT invent or mention any items not listed in the candidates."
        f"\n- Do NOT include the base category ('{category}') in your outfit."
        "\n- If no perfect match, pick the closest style or color match."
        "\n- Return the outfit as a single JSON object with keys for each category, plus two extra keys: 'style_phrase' and 'style_flair'."
        "\n- After the outfit JSON, do NOT add explanations or commentary."
        "\n- Example output format (must return cloth IDs integer, not names text):"
        '\n  {"shoes": 2, "accessory": 10, "jacket": 26, "style_phrase": "formal minimalist", "style_flair": "Perfect for a laid-back lunch event."}'
    )
    
    
    print("AI prompt:", prompt)
    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        },
        data=json.dumps({
            "model": "nvidia/nemotron-nano-9b-v2:free",
            "max_reasoning_depth": 0,
            "messages": [{"role": "user", "content": prompt}],
        })
    )
    res_json = response.json()
    # print("AI response:", res_json["choices"][0]["message"]["content"])
    return res_json["choices"][0]["message"]["content"]