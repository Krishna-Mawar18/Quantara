# /api/index.py
import sys
import os
from pathlib import Path

# Make sure Python can find the backend module
backend_path = str(Path(__file__).parent.parent)
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from backend.app.main import app

# Vercel will automatically use 'app' as the ASGI application
__all__ = ["app"]