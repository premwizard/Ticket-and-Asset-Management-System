"""
app/socketio_instance.py — Production-ready Flask-SocketIO Initialization
"""

from flask_socketio import SocketIO
import logging

logger = logging.getLogger(__name__)

# Initialize SocketIO without app context first.
# Enabled with Eventlet async mode, proper origins, and production logs.
socketio = SocketIO(
    cors_allowed_origins=[
        "https://ticket-and-asset-management-system-premwizards-projects.vercel.app",
        "https://ticket-and-asset-management-system.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    async_mode='eventlet',
    logger=True,
    engineio_logger=True,
    ping_timeout=60,
    ping_interval=25
)

def init_socketio(app):
    """Binds SocketIO to the Flask application instance."""
    socketio.init_app(app)
    logger.info("[SOCKET] Production Socket.IO initialized with eventlet successfully.")
    return socketio
