"""Rotas da API para dados da equipe de voluntários (/api/volunteers)."""

import os
import uuid

from flask import Blueprint, current_app, jsonify, request
from werkzeug.utils import secure_filename

from backend.app import db
from backend.models import Volunteer

volunteers_bp = Blueprint('volunteers', __name__)


@volunteers_bp.route('/api/volunteers', methods=['GET'])
def list_volunteers():
    try:
        volunteers = Volunteer.query.all()
        result = []
        for v in volunteers:
            result.append({
                "id": v.id,
                "full_name": v.full_name,
                "profile_image": v.profile_image,
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@volunteers_bp.route('/api/volunteers/<int:id>', methods=['GET'])
def get_volunteer(id):
    try:
        v = db.session.get(Volunteer, id)
        if v is None:
            return jsonify({"error": "Voluntário não encontrado"}), 404
        return jsonify({
            "id": v.id, "full_name": v.full_name, "profile_image": v.profile_image,
            "rg": v.rg, "cpf": v.cpf,
            "birth_date": v.birth_date.isoformat() if v.birth_date else None,
            "gender": v.gender, "profession": v.profession,
            "email": v.email, "phone": v.phone, "address": v.address,
            "terms_path": v.terms_path, "medical_data_path": v.medical_data_path,
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@volunteers_bp.route('/api/volunteers', methods=['POST'])
def create_volunteer():
    try:
        full_name = request.form.get('full_name')
        if not full_name:
            return jsonify({"error": "Nome é obrigatório"}), 400

        # Handle multiple terms images
        terms_paths = []
        terms_files = request.files.getlist('terms')
        uploads_dir = current_app.config['UPLOADS_DIR']
        os.makedirs(uploads_dir, exist_ok=True)

        for f in terms_files:
            if f.filename:
                ext = os.path.splitext(f.filename)[1] or '.jpg'
                filename = secure_filename(f"{uuid.uuid4().hex}{ext}")
                f.save(os.path.join(uploads_dir, filename))
                terms_paths.append(filename)

        v = Volunteer(
            full_name=full_name,
            rg=request.form.get('rg'),
            cpf=request.form.get('cpf'),
            birth_date=request.form.get('birth_date') or None,
            gender=request.form.get('gender'),
            profession=request.form.get('profession'),
            email=request.form.get('email'),
            phone=request.form.get('phone'),
            address=request.form.get('address'),
            medical_data_path=request.form.get('medical_data'),
            terms_path=','.join(terms_paths) if terms_paths else None,
        )

        # Parse birth_date
        bd = request.form.get('birth_date')
        if bd:
            try:
                from datetime import date
                parts = bd.split('-') if '-' in bd else bd.split('/')
                if len(parts) == 3:
                    if len(parts[0]) == 4:
                        v.birth_date = date(int(parts[0]), int(parts[1]), int(parts[2]))
                    else:
                        v.birth_date = date(int(parts[2]), int(parts[1]), int(parts[0]))
            except (ValueError, IndexError):
                pass

        db.session.add(v)
        db.session.commit()

        return jsonify({"id": v.id, "full_name": v.full_name}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@volunteers_bp.route('/api/volunteers/<int:id>', methods=['DELETE'])
def delete_volunteer(id):
    try:
        v = db.session.get(Volunteer, id)
        if not v:
            return jsonify({"error": "Voluntário não encontrado"}), 404
        db.session.delete(v)
        db.session.commit()
        return jsonify({"deleted": id}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
