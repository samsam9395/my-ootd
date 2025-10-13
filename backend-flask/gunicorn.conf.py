import os

# Worker configuration
workers = 1
threads = 2
worker_class = 'gthread'

# Timeouts
timeout = 300
graceful_timeout = 300
keepalive = 5

# Memory optimization
max_requests = 1000
max_requests_jitter = 50
preload_app = False  # Don't preload - this is the key setting!

# Binding
bind = "0.0.0.0:10000"

# Logging
loglevel = "info"
accesslog = "-"
errorlog = "-"

# Performance
worker_tmp_dir = "/dev/shm"
print("✅ Gunicorn config loaded: preload_app =", preload_app)