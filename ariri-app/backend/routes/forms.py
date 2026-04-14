"""Rotas da API para formulários de ação (/api/forms)."""

import json
import os
import uuid

from flask import Blueprint, current_app, jsonify, request
from werkzeug.utils import secure_filename

from backend.app import db
from backend.models import Form

forms_bp = Blueprint('forms', __name__)


@forms_bp.route('/api/forms', methods=['POST'])
def create_form():
    """Recebe formulário via multipart/form-data e salva no banco."""
    try:
        volunteer_name = request.form.get('volunteer_name')
        if not volunteer_name:
            return jsonify({"error": "volunteer_name é obrigatório"}), 400

        # Parse actions — aceita JSON string ou valor direto
        raw_actions = request.form.get('actions')
        if raw_actions is None:
            return jsonify({"error": "actions é obrigatório"}), 400

        try:
            actions = json.loads(raw_actions) if isinstance(raw_actions, str) else raw_actions
        except (json.JSONDecodeError, TypeError):
            actions = [raw_actions] if raw_actions else []

        if not isinstance(actions, list):
            actions = [actions]

        if len(actions) == 0:
            return jsonify({"error": "Ao menos uma ação deve ser selecionada"}), 400

        # Handle image upload
        image_path = None
        if 'image' in request.files:
            image = request.files['image']
            if image.filename:
                ext = os.path.splitext(image.filename)[1] or '.jpg'
                filename = secure_filename(f"{uuid.uuid4().hex}{ext}")
                uploads_dir = current_app.config['UPLOADS_DIR']
                os.makedirs(uploads_dir, exist_ok=True)
                image.save(os.path.join(uploads_dir, filename))
                image_path = filename

        # Parse optional fields
        full_name = request.form.get('full_name')
        age = request.form.get('age')
        locality = request.form.get('locality')
        description = request.form.get('description')

        age_int = None
        if age is not None and age != '':
            try:
                age_int = int(age)
            except (ValueError, TypeError):
                return jsonify({"error": "age deve ser um número inteiro"}), 400

        # Parse people_served
        people_served_raw = request.form.get('people_served')
        people_served = 1
        if people_served_raw is not None and people_served_raw != '':
            try:
                people_served = int(people_served_raw)
            except (ValueError, TypeError):
                people_served = 1

        form_id = request.form.get('id') or str(uuid.uuid4())

        form = Form(
            id=form_id,
            volunteer_name=volunteer_name,
            actions=actions,
            full_name=full_name,
            age=age_int,
            locality=locality,
            description=description,
            image_path=image_path,
            people_served=people_served,
        )

        db.session.add(form)
        db.session.commit()

        return jsonify({
            "id": form.id,
            "volunteer_name": form.volunteer_name,
            "actions": form.actions,
            "full_name": form.full_name,
            "age": form.age,
            "locality": form.locality,
            "description": form.description,
            "image_path": form.image_path,
            "people_served": form.people_served,
            "created_at": form.created_at.isoformat() if form.created_at else None,
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@forms_bp.route('/api/forms', methods=['GET'])
def list_forms():
    """Lista todos os formulários ordenados por created_at ascendente."""
    try:
        forms = Form.query.order_by(Form.created_at.asc()).all()
        result = []
        for f in forms:
            result.append({
                "id": f.id,
                "volunteer_name": f.volunteer_name,
                "actions": f.actions,
                "full_name": f.full_name,
                "age": f.age,
                "locality": f.locality,
                "description": f.description,
                "image_path": f.image_path,
                "people_served": f.people_served,
                "created_at": f.created_at.isoformat() if f.created_at else None,
            })
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
