"""
app/socketio_instance.py — Flask-SocketIO Initialization
"""

from flask_socketio import SocketIO
import logging

from app.config.settings import settings

logger = logging.getLogger(__name__)

# Initialize SocketIO without app context first
# We use eventlet as the async mode for high performance
socketio = SocketIO(
    cors_allowed_origins="*",
    async_mode='eventlet',
    logger=True,
    engineio_logger=True,
    ping_timeout=60,
    ping_interval=25
)

def init_socketio(app):
    """Binds SocketIO to the Flask app."""
    socketio.init_app(app)
    logger.info("Socket.IO initialized with eventlet")
    return socketio
