# utils/memory_logger.py
import psutil, os

def log_memory(label=""):
    process = psutil.Process(os.getpid())
    mem = process.memory_info().rss / 1024 / 1024  # MB
    print(f"[MEMORY] {label}: {mem:.2f} MB used")