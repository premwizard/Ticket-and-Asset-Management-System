"""
app/__init__.py — Ticket Service Application Factory

The create_app() factory function:
  1. Creates the Flask app
  2. Configures SQLAlchemy
  3. Applies CORS middleware
  4. Registers the tickets blueprint
  5. Adds JWT auth helper routes
  6. Sets up error handlers

This factory pattern makes the app testable and configurable
for different environments without singletons.
"""

import logging

from flask import Flask, jsonify, g, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from sqlalchemy import text

from app.config.settings import settings
from app.middleware.auth import require_auth
from app.socketio_instance import socketio, init_socketio

logger = logging.getLogger(__name__)

# SQLAlchemy extension instance — shared across models
db = SQLAlchemy()
migrate = Migrate()


def create_app() -> Flask:
    """
    Application factory — creates and configures the Flask app.
    Call this in run.py to get the app instance.
    """
    app = Flask(__name__)
    app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB limit
    app.url_map.strict_slashes = False

    # ── SQLAlchemy config ──────────────────────────────────────────────────
    db_uri = settings.SQLALCHEMY_DATABASE_URI
    # Log database connection attempt (redacting credentials)
    db_host = db_uri.split("@")[-1] if "@" in db_uri else "local"
    logger.info("Connecting to Database at %s...", db_host)

    app.config["SQLALCHEMY_DATABASE_URI"] = db_uri
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_size":     settings.DB_POOL_SIZE,
        "max_overflow":  settings.DB_MAX_OVERFLOW,
        "pool_timeout":  settings.DB_POOL_TIMEOUT,
        "pool_recycle":  settings.DB_POOL_RECYCLE,
        "pool_pre_ping": True,
        "connect_args": {
            "connect_timeout": 10,
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

    # ── Socket.IO ──────────────────────────────────────────────────────────
    init_socketio(app)
    from . import socket_events

    # Force CORS headers on EVERY response — belt and suspenders
    @app.after_request
    def add_cors_headers(response):
        # Use first origin as default if multiple, though CORS extension handles this better
        # For simplicity in after_request, we can echo the Origin if it's in our allowed list
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

    # ── Import and register Blueprints ─────────────────────────────────────
    from app.routes.tickets import tickets_bp
    from app.routes.projects import projects_bp
    from app.routes.auth import auth_bp
    from app.routes.notifications import notifications_bp
    app.register_blueprint(tickets_bp, url_prefix="/tickets")
    app.register_blueprint(projects_bp, url_prefix="/projects")
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(notifications_bp, url_prefix="/notifications")


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
        """Health-check endpoint — no auth required. Used by monitoring."""
        try:
            db.session.execute(text('SELECT 1'))
            return jsonify({"status": "ok", "db": "connected", "service": "ticket-service"}), 200
        except Exception as e:
            return jsonify({"status": "error", "db": str(e), "service": "ticket-service"}), 500

    @app.route("/me", methods=["GET"])
    @require_auth
    def get_current_user():
        """
        Returns the current authenticated user's ID, email, and role.
        Auto-creates a local user record if one doesn't exist yet.
        """
        user = g.user
        user_id = user["user_id"]
        email = user["email"]
        role = user.get("role", "user")

        # Auto-create or sync local user record on every request (idempotent upsert)
        try:
            from app.models.user import create_user_record
            create_user_record(user_id, email, role)
        except Exception as exc:
            logger.warning("Auto-sync user record failed: %s", exc)

        return jsonify({
            "user_id": user_id,
            "email":   email,
            "role":    role,
            "message": f"Authenticated as {role}",
        }), 200



    # ── Error handlers ─────────────────────────────────────────────────────

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({"error": "Unauthorized"}), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({"error": "Forbidden"}), 403

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Route not found", "path": request.path}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

    @app.errorhandler(Exception)
    def unhandled(e):
        logger.exception("Unhandled exception")
        return jsonify({"error": str(e)}), 500

    # Print routes for debugging
    for rule in app.url_map.iter_rules():
        print(f"Route: {rule}")

    logger.info("Ticket Service application created on port %s", settings.FLASK_PORT)
    return app
