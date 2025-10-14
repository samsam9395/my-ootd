
import requests
import os
import time
from flask import g

# Helper to get current user_id from token (set in g.user_id by token_required)
def get_current_user_id():
    return getattr(g, "user_id", None)



def generate_embedding(embedding_text):
    """
    Generate 384-dimensional embedding using Hugging Face Inference API (FREE).
    Returns a list of floats.
    """
    HF_API_KEY = os.getenv("HUGGING_FACE_API_KEY")
    if not HF_API_KEY:
        raise ValueError("HUGGING_FACE_API_KEY not set in environment")
    
    # Correct endpoint for feature extraction (embeddings)
    API_URL = "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction"

    
    headers = {
        "Authorization": f"Bearer {HF_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "inputs": embedding_text,
        "options": {
            "wait_for_model": True  # Wait if model is loading (cold start)
        }
    }
    
    
    
    max_retries = 3
    retry_delay = 2  # seconds
    
    for attempt in range(max_retries):
        try:
            response = requests.post(
                API_URL,
                headers=headers,
                json=payload,
                timeout=30
            )
            
            # Check for rate limiting or model loading
            if response.status_code == 503:
                error_data = response.json()
                if "loading" in str(error_data).lower():
                    wait_time = error_data.get("estimated_time", 20)
                    time.sleep(wait_time)
                    continue
            
            response.raise_for_status()
            
            # Parse response
            result = response.json()
            # HF returns different formats, handle both:
            if isinstance(result, list):
                # Format 1: [[embedding]] (nested list)
                if len(result) > 0 and isinstance(result[0], list):
                    embedding = result[0]  # Extract from nested list
                # Format 2: [embedding] (flat list)
                elif len(result) > 0 and isinstance(result[0], (int, float)):
                    embedding = result  # Already flat
                else:
                    raise ValueError(f"Unexpected response format: {result[:2]}...")
            else:
                raise ValueError(f"Response is not a list: {type(result)}")
            
            # Verify dimensions (all-MiniLM-L6-v2 = 384 dims)
            if len(embedding) != 384:
                raise ValueError(f"Expected 384 dimensions, got {len(embedding)}")
            
            print(f"✅ Embedding generated: {len(embedding)} dimensions", flush=True)
            return embedding
            
        except requests.exceptions.Timeout:
            print(f"⚠️ Request timeout (attempt {attempt + 1}/{max_retries})", flush=True)
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
            else:
                raise Exception("HF API timeout after multiple retries")
                
        except requests.exceptions.HTTPError as e:
            print(f"❌ HTTP error: {e.response.status_code} - {e.response.text}", flush=True)
            if attempt < max_retries - 1 and e.response.status_code in [503, 429]:
                time.sleep(retry_delay * (attempt + 1))  # Exponential backoff
            else:
                raise
                
        except Exception as e:
            print(f"❌ Unexpected error: {str(e)}", flush=True)
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
            else:
                raise
    
    raise Exception("Failed to generate embedding after all retries")