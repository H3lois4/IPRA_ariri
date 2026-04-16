"""Rotas da API para comprovantes de prestação de contas (/api/receipts)."""

import os
import uuid

from flask import Blueprint, current_app, jsonify, request
from werkzeug.utils import secure_filename

from backend.app import db
from backend.models import Receipt

receipts_bp = Blueprint('receipts', __name__)


@receipts_bp.route('/api/receipts', methods=['POST'])
def create_receipt():
    """Recebe comprovante via multipart/form-data e salva no banco."""
    try:
        title = request.form.get('title')
        if not title:
            return jsonify({"error": "title é obrigatório"}), 400

        description = request.form.get('description')

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

        receipt_id = request.form.get('id') or str(uuid.uuid4())

        receipt = Receipt(
            id=receipt_id,
            title=title,
            description=description,
            image_path=image_path,
        )

        db.session.add(receipt)
        db.session.commit()

        return jsonify({
            "id": receipt.id,
            "title": receipt.title,
            "description": receipt.description,
            "image_path": receipt.image_path,
            "created_at": receipt.created_at.isoformat() if receipt.created_at else None,
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@receipts_bp.route('/api/receipts', methods=['GET'])
def list_receipts():
    """Lista todos os comprovantes ordenados por created_at decrescente."""
    try:
        receipts = Receipt.query.order_by(Receipt.created_at.desc()).all()
        result = []
        for r in receipts:
            result.append({
                "id": r.id,
                "title": r.title,
                "description": r.description,
                "image_path": r.image_path,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            })
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@receipts_bp.route('/api/receipts/<string:receipt_id>', methods=['DELETE'])
def delete_receipt(receipt_id):
    """Exclui um comprovante pelo ID."""
    try:
        receipt = db.session.get(Receipt, receipt_id)
        if not receipt:
            return jsonify({"error": "Comprovante não encontrado"}), 404
        db.session.delete(receipt)
        db.session.commit()
        return jsonify({"deleted": receipt_id}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@receipts_bp.route('/api/receipts/<string:receipt_id>', methods=['PUT'])
def update_receipt(receipt_id):
    """Edita um comprovante pelo ID."""
    try:
        receipt = db.session.get(Receipt, receipt_id)
        if not receipt:
            return jsonify({"error": "Comprovante não encontrado"}), 404
        title = request.form.get('title')
        if title:
            receipt.title = title
        desc = request.form.get('description')
        if desc is not None:
            receipt.description = desc
        db.session.commit()
        return jsonify({"id": receipt.id, "title": receipt.title, "description": receipt.description}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
