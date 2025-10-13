import os
import psutil
from flask import g

# Global cache (initially None)
_embedder = None


# Helper to get current user_id from token (set in g.user_id by token_required)
def get_current_user_id():
    return getattr(g, "user_id", None)

_embedder = None

def generate_embedding(text):
    global _embedder
    
    # Check available memory before loading
    if _embedder is None:
        process = psutil.Process(os.getpid())
        current_mem = process.memory_info().rss / 1024 / 1024  # MB
        
        if current_mem > 300:  # If already using >300MB, don't load model
            raise Exception("Not enough memory to load embedding model. Use API instead.")
        
        from sentence_transformers import SentenceTransformer
        _embedder = SentenceTransformer("all-MiniLM-L6-v2")
        
        new_mem = process.memory_info().rss / 1024 / 1024
        print(f"✅ Model loaded. Memory: {current_mem:.0f}MB → {new_mem:.0f}MB")
    
    return _embedder.encode(text).tolist()
