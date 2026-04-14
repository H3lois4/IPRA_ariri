"""Rota da API para sincronização em lote (/api/sync)."""

import base64
import json
import os
import uuid
from datetime import datetime

from flask import Blueprint, current_app, jsonify, request

from backend.app import db
from backend.models import Form, Post, Receipt

sync_bp = Blueprint('sync', __name__)


def _save_base64_image(base64_data):
    """Decodifica imagem base64 e salva em uploads/. Retorna o filename."""
    if not base64_data:
        return None

    # Strip data URI prefix if present (e.g. "data:image/jpeg;base64,...")
    if ',' in base64_data:
        base64_data = base64_data.split(',', 1)[1]

    try:
        image_bytes = base64.b64decode(base64_data)
    except Exception:
        return None

    filename = f"{uuid.uuid4().hex}.jpg"
    uploads_dir = current_app.config['UPLOADS_DIR']
    os.makedirs(uploads_dir, exist_ok=True)
    with open(os.path.join(uploads_dir, filename), 'wb') as f:
        f.write(image_bytes)

    return filename


def _parse_created_at(value):
    """Parse ISO 8601 created_at string into a datetime object."""
    if not value:
        return datetime.utcnow()
    try:
        # Handle trailing Z (UTC indicator)
        if isinstance(value, str) and value.endswith('Z'):
            value = value[:-1] + '+00:00'
        return datetime.fromisoformat(value).replace(tzinfo=None)
    except (ValueError, TypeError):
        return datetime.utcnow()


def _sync_form(item_id, data, created_at):
    """Cria um registro Form a partir dos dados de sincronização."""
    actions = data.get('actions', [])
    if isinstance(actions, str):
        try:
            actions = json.loads(actions)
        except (json.JSONDecodeError, TypeError):
            actions = [actions]

    image_path = _save_base64_image(data.get('image'))

    age = data.get('age')
    age_int = None
    if age is not None and age != '':
        try:
            age_int = int(age)
        except (ValueError, TypeError):
            age_int = None

    form = Form(
        id=item_id,
        volunteer_name=data.get('volunteer_name', ''),
        actions=actions if isinstance(actions, list) else [actions],
        full_name=data.get('full_name'),
        age=age_int,
        locality=data.get('locality'),
        description=data.get('description'),
        image_path=image_path,
        people_served=int(data.get('people_served', 1) or 1),
        created_at=created_at,
    )
    db.session.add(form)


def _sync_post(item_id, data, created_at):
    """Cria um registro Post a partir dos dados de sincronização."""
    image_path = _save_base64_image(data.get('image'))

    post = Post(
        id=item_id,
        volunteer_name=data.get('volunteer_name', ''),
        title=data.get('title', ''),
        description=data.get('description'),
        image_path=image_path,
        created_at=created_at,
    )
    db.session.add(post)


def _sync_receipt(item_id, data, created_at):
    """Cria um registro Receipt a partir dos dados de sincronização."""
    image_path = _save_base64_image(data.get('image'))

    receipt = Receipt(
        id=item_id,
        title=data.get('title', ''),
        description=data.get('description'),
        image_path=image_path,
        created_at=created_at,
    )
    db.session.add(receipt)


# Map type names to their handler and model
_TYPE_HANDLERS = {
    'form': (_sync_form, Form),
    'post': (_sync_post, Post),
    'receipt': (_sync_receipt, Receipt),
}


@sync_bp.route('/api/sync', methods=['POST'])
def batch_sync():
    """Recebe array de itens e sincroniza em lote."""
    try:
        body = request.get_json(silent=True)
        if not body or 'items' not in body:
            return jsonify({"error": "Campo 'items' é obrigatório"}), 400

        items = body['items']
        if not isinstance(items, list):
            return jsonify({"error": "'items' deve ser uma lista"}), 400

        synced = []
        errors = []

        for item in items:
            item_id = item.get('id')
            item_type = item.get('type')
            data = item.get('data', {})
            created_at_raw = item.get('created_at')

            if not item_id:
                errors.append({"id": item_id, "error": "Campo 'id' é obrigatório"})
                continue

            if item_type not in _TYPE_HANDLERS:
                errors.append({"id": item_id, "error": f"Tipo '{item_type}' não suportado"})
                continue

            handler, model = _TYPE_HANDLERS[item_type]

            # Check for duplicate — already exists in DB
            existing = db.session.get(model, item_id)
            if existing:
                synced.append(item_id)
                continue

            created_at = _parse_created_at(created_at_raw)

            try:
                handler(item_id, data, created_at)
                db.session.commit()
                synced.append(item_id)
            except Exception as e:
                db.session.rollback()
                errors.append({"id": item_id, "error": str(e)})

        return jsonify({"synced": synced, "errors": errors}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
