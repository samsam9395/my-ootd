
from sentence_transformers import SentenceTransformer
from flask import g

# -------------------------------
# Helper to get current user_id from token (set in g.user_id by token_required)
def get_current_user_id():
    return getattr(g, "user_id", None)
# -------------------------------

# -------------------------------
# Helper for embedding generation
EMBEDDING_DIM = 384
MODEL_NAME = "all-MiniLM-L6-v2"
embedder = SentenceTransformer(MODEL_NAME)  # load ONCE when module is imported


def generate_embedding(text):
    return embedder.encode(text).tolist()  # convert tensor to python list
# -------------------------------