import os
import uuid
import requests
from flask import Blueprint, request, jsonify, g, current_app
from werkzeug.utils import secure_filename
from app.middleware.auth import require_auth, require_admin
from app.models import Ticket, TicketAttachment, Notification, db
from app.socketio_instance import socketio

tickets_bp = Blueprint('tickets', __name__)

# ── Storage Configuration ───────────────────────────────────────────────────

ALLOWED_EXTENSIONS = {
    'jpg', 'jpeg', 'png', 'gif', 'webp',  # images
    'pdf',                                  # documents
    'doc', 'docx',                          # word
    'xls', 'xlsx',                          # excel
    'txt', 'csv',                           # text
    'zip', 'rar'                            # archives
}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def upload_to_supabase_storage(file_data, file_path, content_type):
    """Internal helper to upload a file to Supabase Storage."""
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise Exception("Supabase storage configuration missing (URL or Service Role Key)")

    url = f"{SUPABASE_URL}/storage/v1/object/ticket-attachments/{file_path}"
    headers = {
        'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
        'Content-Type': content_type,
        'x-upsert': 'true'
    }
    
    response = requests.post(url, headers=headers, data=file_data, timeout=30)
    if response.status_code not in [200, 201]:
        raise Exception(f"Storage upload failed ({response.status_code}): {response.text}")
    return response.json()

def get_signed_url(file_path, expires_in=3600):
    """Internal helper to generate a signed URL for a private file."""
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        return None

    url = f"{SUPABASE_URL}/storage/v1/object/sign/ticket-attachments/{file_path}"
    headers = {
        'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
        'Content-Type': 'application/json'
    }
    
    response = requests.post(url, headers=headers, json={"expiresIn": expires_in}, timeout=10)
    if response.status_code == 200:
        data = response.json()
        signed_url_path = data.get('signedURL')
        # Supabase returns the path part, we need to prefix with the storage base URL
        return f"{SUPABASE_URL}/storage/v1{signed_url_path}"
    return None

def delete_from_supabase_storage(file_path):
    """Internal helper to purge a file from storage."""
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        return

    url = f"{SUPABASE_URL}/storage/v1/object/ticket-attachments/{file_path}"
    headers = {'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}'}
    requests.delete(url, headers=headers, timeout=10)

# ── Ticket Routes ───────────────────────────────────────────────────────────

@tickets_bp.route('/', methods=['GET'])
@require_auth
def get_tickets():
    tickets = Ticket.query.all()
    return jsonify([t.to_dict() for t in tickets]), 200

@tickets_bp.route('/<int:ticket_id>', methods=['GET'])
@require_auth
def get_ticket(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    return jsonify(ticket.to_dict()), 200

@tickets_bp.route('/', methods=['POST'])
@require_auth
def create_ticket():
    data = request.get_json()
    if not data or not data.get('title'):
        return jsonify({"error": "Title is required"}), 400
    ticket = Ticket(
        title=data['title'],
        description=data.get('description', ''),
        project_id=data.get('project_id'),
        priority=data.get('priority', 'medium'),
        status=data.get('status', 'open'),
        created_by=g.user['id']
    )
    db.session.add(ticket)
    db.session.commit()

    # ── Notification Logic ──
    try:
        # 1. Create notification for admins
        notif = Notification(
            user_id='admins', # Special marker for all admins
            title="New Ticket Created",
            message=f"A new ticket '{ticket.title}' has been submitted by {g.user['email']}.",
            type="ticket_new"
        )
        db.session.add(notif)
        db.session.commit()

        # 2. Emit Socket.IO event to 'admins' room
        socketio.emit('new_notification', notif.to_dict(), room='admins')
        print(f"[SOCKET] Emitted new_notification to admins for ticket {ticket.id}")
    except Exception as e:
        print(f"[NOTIFICATION ERROR]: {str(e)}")

    return jsonify(ticket.to_dict()), 201

@tickets_bp.route('/<int:ticket_id>', methods=['PUT'])
@require_auth
@require_admin
def update_ticket(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    data = request.get_json()
    for field in ['title','description','status','priority']:
        if field in data:
            setattr(ticket, field, data[field])
    db.session.commit()
    return jsonify(ticket.to_dict()), 200

@tickets_bp.route('/<int:ticket_id>', methods=['DELETE'])
@require_auth
@require_admin
def delete_ticket(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    # Purge all attachments from physical storage first
    for att in ticket.attachments:
        try:
            delete_from_supabase_storage(att.storage_path)
        except Exception as e:
            print(f"Failed to delete {att.storage_path}: {e}")
    
    db.session.delete(ticket)
    db.session.commit()
    return jsonify({"message": "Ticket and all attachments deleted"}), 200

# ── Attachment Routes ───────────────────────────────────────────────────────

@tickets_bp.route('/<int:ticket_id>/attachments', methods=['POST'])
@require_auth
def upload_attachment(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)

    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed", "allowed": list(ALLOWED_EXTENSIONS)}), 400

    file_data = file.read()
    file_size = len(file_data)
    
    # Generate unique path: ticket-{id}/{uuid}.ext
    original_name = secure_filename(file.filename)
    extension = original_name.rsplit('.', 1)[1].lower() if '.' in original_name else 'bin'
    unique_name = f"{uuid.uuid4()}.{extension}"
    storage_path = f"ticket-{ticket_id}/{unique_name}"
    content_type = file.content_type or 'application/octet-stream'

    try:
        # 1. Upload to Supabase
        upload_to_supabase_storage(file_data, storage_path, content_type)

        # 2. Get initial signed URL
        signed_url = get_signed_url(storage_path)

        # 3. Save to Database
        attachment = TicketAttachment(
            ticket_id=ticket_id,
            file_name=original_name,
            file_type=content_type,
            file_size=file_size,
            storage_path=storage_path,
            storage_url=signed_url,
            uploaded_by=g.user['id']
        )
        db.session.add(attachment)
        db.session.commit()

        return jsonify({
            "message": "File uploaded successfully",
            "attachment": attachment.to_dict()
        }), 201

    except Exception as e:
        print(f"Upload Error: {str(e)}")
        return jsonify({"error": "Upload failed", "details": str(e)}), 500

@tickets_bp.route('/<int:ticket_id>/attachments', methods=['GET'])
@require_auth
def get_attachments(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    
    # We refresh signed URLs on every list request to ensure they haven't expired
    results = []
    for att in ticket.attachments:
        att_data = att.to_dict()
        fresh_url = get_signed_url(att.storage_path)
        if fresh_url:
            att_data['storage_url'] = fresh_url
        results.append(att_data)
        
    return jsonify(results), 200

@tickets_bp.route('/<int:ticket_id>/attachments/<int:attachment_id>', methods=['DELETE'])
@require_auth
@require_admin
def delete_attachment(ticket_id, attachment_id):
    attachment = TicketAttachment.query.filter_by(id=attachment_id, ticket_id=ticket_id).first_or_404()
    
    try:
        delete_from_supabase_storage(attachment.storage_path)
        db.session.delete(attachment)
        db.session.commit()
        return jsonify({"message": "Attachment deleted"}), 200
    except Exception as e:
        return jsonify({"error": "Deletion failed", "details": str(e)}), 500

@tickets_bp.route('/<int:ticket_id>/attachments/<int:attachment_id>/download', methods=['GET'])
@require_auth
def download_attachment(ticket_id, attachment_id):
    attachment = TicketAttachment.query.filter_by(id=attachment_id, ticket_id=ticket_id).first_or_404()
    
    signed_url = get_signed_url(attachment.storage_path, expires_in=300) # 5 min expiry
    if not signed_url:
        return jsonify({"error": "Could not generate download link"}), 500
        
    return jsonify({
        "download_url": signed_url,
        "file_name": attachment.file_name,
        "file_type": attachment.file_type
    }), 200
