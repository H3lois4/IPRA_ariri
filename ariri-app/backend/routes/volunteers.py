"""Rotas da API para dados da equipe de voluntários (/api/volunteers)."""

from flask import Blueprint, jsonify

from backend.app import db
from backend.models import Volunteer

volunteers_bp = Blueprint('volunteers', __name__)


@volunteers_bp.route('/api/volunteers', methods=['GET'])
def list_volunteers():
    """Lista todos os voluntários com nome e foto de perfil."""
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
    """Retorna perfil completo de um voluntário."""
    try:
        v = db.session.get(Volunteer, id)
        if v is None:
            return jsonify({"error": "Voluntário não encontrado"}), 404

        return jsonify({
            "id": v.id,
            "full_name": v.full_name,
            "profile_image": v.profile_image,
            "rg": v.rg,
            "cpf": v.cpf,
            "birth_date": v.birth_date.isoformat() if v.birth_date else None,
            "gender": v.gender,
            "profession": v.profession,
            "email": v.email,
            "phone": v.phone,
            "address": v.address,
            "terms_path": v.terms_path,
            "medical_data_path": v.medical_data_path,
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
