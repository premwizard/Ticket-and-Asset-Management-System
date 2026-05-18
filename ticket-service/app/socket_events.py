"""
app/socket_events.py — Socket.IO Event Handlers
"""

from flask import request, g
from flask_socketio import emit, join_room, leave_room
from app.socketio_instance import socketio
from app.middleware.auth import verify_supabase_token, extract_role
import logging

logger = logging.getLogger(__name__)

@socketio.on('connect')
def handle_connect(auth=None):
    """
    Handle new socket connections.
    Validates JWT token passed in auth payload or headers.
    """
    token = None
    if auth and isinstance(auth, dict):
        token = auth.get('token')
        
    if not token:
        token = request.args.get('token') or request.headers.get('Authorization')
        
    if token and token.startswith('Bearer '):
        token = token.split(' ')[1]
    
    if not token:
        logger.warning("Connection attempt without token")
        return False # Reject connection
    
    try:
        payload = verify_supabase_token(token)
        user_id = payload.get('sub')
        role = extract_role(payload)
        
        # Store user info in socket session
        # (In SocketIO, 'request' is available but we can also use 'session')
        # Here we use it to decide which rooms to join
        logger.info(f"User {user_id} connected via socket (role: {role})")
        
        # Join a private room for the user
        join_room(f"user_{user_id}")
        
        # If admin, join the admins room
        if role == 'admin':
            join_room("admins")
            logger.info(f"User {user_id} joined admin room")
            
    except Exception as e:
        logger.error(f"Socket auth failed: {str(e)}")
        return False # Reject connection

@socketio.on('disconnect')
def handle_disconnect():
    logger.info("Client disconnected")

@socketio.on('join_admin_room')
def on_join_admin(data):
    """
    Explicitly join admin room if authorized.
    """
    token = data.get('token')
    try:
        payload = verify_supabase_token(token)
        role = extract_role(payload)
        if role == 'admin':
            join_room("admins")
            emit('status', {'msg': 'Joined admin room'})
        else:
            emit('error', {'msg': 'Unauthorized for admin room'})
    except:
        emit('error', {'msg': 'Invalid token'})

@socketio.on('mark_read')
def handle_mark_read(data):
    notification_id = data.get('id')
    # Update DB and emit confirmation if needed
    # (Implementation details omitted for brevity, usually handled via REST API)
    pass
