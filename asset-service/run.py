"""
run.py — Asset Service Entry Point

Usage:
  python run.py

Production (Gunicorn):
  gunicorn "app:create_app()" --bind 0.0.0.0:5002 --workers 4
"""

import logging
import sys

from dotenv import load_dotenv

load_dotenv()

import os
required_vars = ['SUPABASE_JWT_SECRET', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'FLASK_ENV', 'FLASK_PORT']
for var in required_vars:
    if not os.getenv(var):
        raise RuntimeError(f"Missing required env var: {var}")

# DB check: Require either DATABASE_URL or the full set of separate variables
db_vars = ['DATABASE_HOST', 'DATABASE_NAME', 'DATABASE_USER', 'DATABASE_PASSWORD']
if not os.getenv('DATABASE_URL'):
    for var in db_vars:
        if not os.getenv(var):
            raise RuntimeError(f"Missing required env var: {var} (or DATABASE_URL)")

from app import create_app
from app.config.settings import settings
import app.models  # noqa: F401

logging.basicConfig(
    level=logging.DEBUG if settings.FLASK_DEBUG else logging.INFO,
    format="%(asctime)s [%(levelname)-8s] %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[logging.StreamHandler(sys.stdout)],
)

logger = logging.getLogger(__name__)

app = create_app()

with app.app_context():
    from app import db
    db.create_all()
    print("Database tables verified/created.")


if __name__ == "__main__":
    logger.info("Starting Asset Service on http://localhost:%s", settings.FLASK_PORT)
    app.run(
        host="0.0.0.0",
        port=settings.FLASK_PORT,
        debug=settings.FLASK_DEBUG,
        threaded=True,        # Handle multiple concurrent requests
        use_reloader=False,   # Faster startup, no double-init
    )
