from flask import Blueprint, request, jsonify, g
from app.middleware.auth import require_auth, require_admin
from app.models import Project, db

projects_bp = Blueprint('projects', __name__)

# VIEW — all users
@projects_bp.route('/', methods=['GET'])
@require_auth
def get_projects():
  projects = Project.query.all()
  return jsonify([p.to_dict() for p in projects]), 200

# CREATE — all users
@projects_bp.route('/', methods=['POST'])
@require_auth
def create_project():
  data = request.get_json()
  if not data or not data.get('name'):
    return jsonify({"error": "Name is required"}), 400
  project = Project(
    name=data['name'],
    description=data.get('description', ''),
    status=data.get('status', 'active'),
    created_by=g.user['id']
  )
  db.session.add(project)
  db.session.commit()
  return jsonify(project.to_dict()), 201

# UPDATE — admin only
@projects_bp.route('/<int:project_id>', methods=['PUT'])
@require_auth
@require_admin
def update_project(project_id):
  project = Project.query.get_or_404(project_id)
  data = request.get_json()
  for field in ['name', 'description', 'status']:
    if field in data:
      setattr(project, field, data[field])
  db.session.commit()
  return jsonify(project.to_dict()), 200

# DELETE — admin only
@projects_bp.route('/<int:project_id>', methods=['DELETE'])
@require_auth
@require_admin
def delete_project(project_id):
  project = Project.query.get_or_404(project_id)
  db.session.delete(project)
  db.session.commit()
  return jsonify({"message": "Project deleted"}), 200
