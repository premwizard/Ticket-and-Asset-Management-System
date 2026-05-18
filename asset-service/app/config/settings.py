"""
app/config/settings.py — Asset Service Configuration
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    FLASK_ENV:   str  = os.getenv("FLASK_ENV",   "development")
    FLASK_DEBUG: bool = os.getenv("FLASK_DEBUG", "1") == "1"
    FLASK_PORT:  int  = int(os.getenv("FLASK_PORT", "5002"))

    DATABASE_HOST:     str = os.getenv("DATABASE_HOST",     "localhost")
    DATABASE_PORT:     int = int(os.getenv("DATABASE_PORT", "5432"))
    DATABASE_NAME:     str = os.getenv("DATABASE_NAME",     "asset_db")
    DATABASE_USER:     str = os.getenv("DATABASE_USER",     "postgres")
    DATABASE_PASSWORD: str = os.getenv("DATABASE_PASSWORD", "postgres")
    DB_POOL_SIZE:      int = int(os.getenv("DB_POOL_SIZE",  "5"))
    DB_MAX_OVERFLOW:   int = int(os.getenv("DB_MAX_OVERFLOW", "10"))
    DB_POOL_TIMEOUT:   int = int(os.getenv("DB_POOL_TIMEOUT", "30"))
    DB_POOL_RECYCLE:   int = int(os.getenv("DB_POOL_RECYCLE", "1800"))
    DATABASE_URL:      str = os.getenv("DATABASE_URL",      "")

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        # Prioritize DATABASE_URL (Standard for Render/Heroku)
        url = self.DATABASE_URL
        if not url:
            url = (
                f"postgresql://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}"
                f"@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"
            )

        # Handle Render's "postgres://" prefix which is incompatible with SQLAlchemy 1.4+
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)

        return url

    # ── Supabase / JWT ──────────────────────────────────────────────────────
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
    SUPABASE_JWT_AUD: str = os.getenv("SUPABASE_JWT_AUD", "")
    SUPABASE_ISSUER: str = os.getenv("SUPABASE_ISSUER", "")

    @property
    def CORS_ORIGINS(self) -> list[str]:
        # Include production frontend and localhost for development
        default_origins = "https://your-frontend.vercel.app,http://localhost:5173,http://localhost:3000"
        raw = os.getenv("CORS_ORIGINS", default_origins)
        return [o.strip() for o in raw.split(",")]


settings = Settings()
