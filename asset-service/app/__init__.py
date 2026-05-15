"""
app/__init__.py — Asset Service Application Factory

The Asset Service is a standalone Flask microservice that:
  - Connects to its own PostgreSQL database (asset_db)
  - Verifies Supabase JWT access tokens
  - Exposes /assets/* CRUD endpoints

Authentication Note:
  The Asset Service validates the same Supabase JWT used by the frontend.
  Local role records are used to map authenticated users to app roles.
"""

import logging

from flask import Flask, jsonify, request, g
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from sqlalchemy import text

from app.config.settings import settings
from app.middleware.auth import require_auth

logger = logging.getLogger(__name__)

# SQLAlchemy extension instance
db = SQLAlchemy()
migrate = Migrate()


def create_app() -> Flask:
    """Asset Service application factory."""
    app = Flask(__name__)
    app.url_map.strict_slashes = False

    # ── SQLAlchemy ─────────────────────────────────────────────────────────
    app.config["SQLALCHEMY_DATABASE_URI"] = settings.SQLALCHEMY_DATABASE_URI
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_size":     settings.DB_POOL_SIZE,
        "max_overflow":  settings.DB_MAX_OVERFLOW,
        "pool_pre_ping": True,    # Reconnect if connection is stale
        "pool_timeout":  5,       # Fail fast if pool is exhausted
        "pool_recycle":  300,     # Refresh connections every 5 minutes
        "connect_args": {
            "connect_timeout": 5, # 5s max to establish DB connection
        },
    }
    db.init_app(app)
    migrate.init_app(app, db)

    # ── CORS — Allow configured origins ─────────────────────────────────────
    CORS(app,
         resources={r"/*": {"origins": settings.CORS_ORIGINS}},
         allow_headers=["Authorization", "Content-Type", "Accept"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         supports_credentials=False)

    # Force CORS headers on EVERY response — belt and suspenders
    @app.after_request
    def add_cors_headers(response):
        origin = request.headers.get('Origin')
        if origin in settings.CORS_ORIGINS:
            response.headers['Access-Control-Allow-Origin'] = origin
        elif "*" in settings.CORS_ORIGINS:
            response.headers['Access-Control-Allow-Origin'] = "*"
            
        response.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, Accept'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        return response

    # Handle ALL preflight requests — NO AUTH CHECK
    @app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
    @app.route('/<path:path>', methods=['OPTIONS'])
    def options_handler(path):
        response = jsonify({})
        origin = request.headers.get('Origin')
        if origin in settings.CORS_ORIGINS:
            response.headers['Access-Control-Allow-Origin'] = origin
        elif "*" in settings.CORS_ORIGINS:
            response.headers['Access-Control-Allow-Origin'] = "*"
            
        response.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, Accept'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        return response, 200

    # ── Blueprint registration ─────────────────────────────────────────────
    from app.routes.assets import assets_bp
    app.register_blueprint(assets_bp, url_prefix="/assets")

    # ── Logging Middleware ──────────────────────────────────────────────────
    @app.before_request
    def log_request():
        print(f"[{request.method}] {request.path}")
        print(f"Headers: {dict(request.headers)}")
        if request.is_json:
            print(f"Body: {request.get_json(silent=True)}")

    # ── Core routes ────────────────────────────────────────────────────────



    @app.route("/health", methods=["GET"])
    def health_check():
        """Health-check — no auth required."""
        try:
            db.session.execute(text('SELECT 1'))
            return jsonify({"status": "ok", "db": "connected", "service": "asset-service"}), 200
        except Exception as e:
            return jsonify({"status": "error", "db": str(e), "service": "asset-service"}), 500

    # ── Error handlers ─────────────────────────────────────────────────────

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({"error": "Unauthorized"}), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({"error": "Forbidden"}), 403

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Route not found", "path": request.path}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

    @app.errorhandler(405)
    def method_not_allowed(e):
        print(f"DEBUG: 405 Method Not Allowed: {request.method} {request.path}")
        return jsonify({"error": "Method not allowed", "method": request.method, "path": request.path}), 405

    @app.errorhandler(Exception)
    def unhandled(e):
        print(f"DEBUG: Unhandled Exception: {str(e)}")
        import traceback
        traceback.print_exc()
        logger.exception("Unhandled exception")
        return jsonify({"error": str(e)}), 500

    # Print routes for debugging
    for rule in app.url_map.iter_rules():
        print(f"Route: {rule}")

    logger.info("Asset Service application created on port %s", settings.FLASK_PORT)
    return app
