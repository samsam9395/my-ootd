import os

# Get available memory (Render provides 512MB)
workers = 1
threads = 2
worker_class = 'gthread'  # Use threaded workers instead of sync
timeout = 300
graceful_timeout = 300
keepalive = 5

# Memory optimization
max_requests = 1000  # Restart workers after 1000 requests to prevent memory leaks
max_requests_jitter = 50
preload_app = False  # CRITICAL: Don't preload to avoid double memory usage

# Logging
loglevel = "info"  # Change from debug to info to reduce memory
accesslog = "-"
errorlog = "-"

# Worker tmp directory (use tmpfs for better performance)
worker_tmp_dir = "/dev/shm"
print("✅ Gunicorn config loaded: preload_app =", preload_app)