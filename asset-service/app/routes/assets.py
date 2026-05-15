from flask import Blueprint, request, jsonify, g
from app.middleware.auth import require_auth, require_admin
from app.models import Asset, db

assets_bp = Blueprint('assets', __name__)

# VIEW — all users
@assets_bp.route('/', methods=['GET'])
@require_auth
def get_assets():
  assets = Asset.query.all()
  return jsonify([a.to_dict() for a in assets]), 200

# CREATE — all users
@assets_bp.route('/', methods=['POST'])
@require_auth
def create_asset():
  data = request.get_json()
  if not data or not data.get('name'):
    return jsonify({"error": "Name is required"}), 400
  asset = Asset(
    name=data['name'],
    type=data.get('type', 'hardware'),
    serial_number=data.get('serial_number', ''),
    status=data.get('status', 'available'),
    value=data.get('value', 0),
    created_by=g.user['id']
  )
  db.session.add(asset)
  db.session.commit()
  return jsonify(asset.to_dict()), 201

# UPDATE — admin only
@assets_bp.route('/<int:asset_id>', methods=['PUT'])
@require_auth
@require_admin
def update_asset(asset_id):
  asset = Asset.query.get_or_404(asset_id)
  data = request.get_json()
  for field in ['name','type','serial_number',
                'status','value','assigned_to']:
    if field in data:
      setattr(asset, field, data[field])
  db.session.commit()
  return jsonify(asset.to_dict()), 200

# DELETE — admin only
@assets_bp.route('/<int:asset_id>', methods=['DELETE'])
@require_auth
@require_admin
def delete_asset(asset_id):
  asset = Asset.query.get_or_404(asset_id)
  db.session.delete(asset)
  db.session.commit()
  return jsonify({"message": "Asset deleted"}), 200
