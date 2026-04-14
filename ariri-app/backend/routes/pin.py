"""Rota de verificação de PIN /api/verify-pin."""

from flask import Blueprint, current_app, jsonify, request

pin_bp = Blueprint('pin', __name__)


@pin_bp.route('/api/verify-pin', methods=['POST'])
def verify_pin():
    """Verifica se o PIN informado está correto."""
    data = request.get_json(silent=True)
    if not data or 'pin' not in data:
        return jsonify({"error": "Campo 'pin' é obrigatório"}), 400

    correct_pin = current_app.config.get('ACCESS_PIN', '1234')
    if str(data['pin']) == str(correct_pin):
        return jsonify({"valid": True}), 200
    else:
        return jsonify({"valid": False, "error": "PIN incorreto"}), 200
