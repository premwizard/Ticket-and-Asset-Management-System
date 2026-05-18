from flask import Blueprint, request, jsonify, g
from app.middleware.auth import require_auth, require_admin
from app.models.asset import Asset, AssetStatus, db

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
    
  # Map 'available' or custom statuses to valid AssetStatus enum
  status_str = data.get('status')
  if not status_str or status_str == 'available':
      status_val = AssetStatus.ACTIVE
  else:
      try:
          status_val = AssetStatus(status_str.lower())
      except ValueError:
          status_val = AssetStatus.ACTIVE

  asset = Asset(
    name=data['name'],
    type=data.get('type', 'hardware'),
    serial_number=data.get('serial_number') or None, # Unique constraint: empty string must be NULL
    status=status_val,
    purchase_cost=data.get('value') or data.get('purchase_cost') or 0.0,
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
  
  if 'name' in data:
      asset.name = data['name']
  if 'type' in data:
      asset.type = data['type']
  if 'serial_number' in data:
      asset.serial_number = data['serial_number'] or None
  if 'status' in data:
      status_str = data['status']
      if status_str == 'available':
          asset.status = AssetStatus.ACTIVE
      else:
          try:
              asset.status = AssetStatus(status_str.lower())
          except ValueError:
              asset.status = AssetStatus.ACTIVE
  if 'value' in data:
      asset.purchase_cost = data['value']
  elif 'purchase_cost' in data:
      asset.purchase_cost = data['purchase_cost']
  if 'assigned_to' in data:
      asset.assigned_to = data['assigned_to']
      
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
