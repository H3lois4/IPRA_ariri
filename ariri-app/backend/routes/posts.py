"""Rotas da API para postagens do Diário de Bordo (/api/posts)."""

import os
import uuid

from flask import Blueprint, current_app, jsonify, request
from werkzeug.utils import secure_filename

from backend.app import db
from backend.models import Post

posts_bp = Blueprint('posts', __name__)


@posts_bp.route('/api/posts', methods=['POST'])
def create_post():
    """Recebe postagem via multipart/form-data e salva no banco."""
    try:
        volunteer_name = request.form.get('volunteer_name')
        if not volunteer_name:
            return jsonify({"error": "volunteer_name é obrigatório"}), 400

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

        post_id = request.form.get('id') or str(uuid.uuid4())

        post = Post(
            id=post_id,
            volunteer_name=volunteer_name,
            title=title,
            description=description,
            image_path=image_path,
        )

        db.session.add(post)
        db.session.commit()

        return jsonify({
            "id": post.id,
            "volunteer_name": post.volunteer_name,
            "title": post.title,
            "description": post.description,
            "image_path": post.image_path,
            "created_at": post.created_at.isoformat() if post.created_at else None,
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@posts_bp.route('/api/posts', methods=['GET'])
def list_posts():
    """Lista todas as postagens ordenadas por created_at decrescente."""
    try:
        posts = Post.query.order_by(Post.created_at.desc()).all()
        result = []
        for p in posts:
            result.append({
                "id": p.id,
                "volunteer_name": p.volunteer_name,
                "title": p.title,
                "description": p.description,
                "image_path": p.image_path,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            })
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@posts_bp.route('/api/posts/<string:post_id>', methods=['DELETE'])
def delete_post(post_id):
    """Exclui uma postagem pelo ID."""
    try:
        post = db.session.get(Post, post_id)
        if not post:
            return jsonify({"error": "Postagem não encontrada"}), 404
        db.session.delete(post)
        db.session.commit()
        return jsonify({"deleted": post_id}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@posts_bp.route('/api/posts/<string:post_id>', methods=['PUT'])
def update_post(post_id):
    """Edita uma postagem pelo ID."""
    try:
        post = db.session.get(Post, post_id)
        if not post:
            return jsonify({"error": "Postagem não encontrada"}), 404
        title = request.form.get('title')
        if title:
            post.title = title
        desc = request.form.get('description')
        if desc is not None:
            post.description = desc
        db.session.commit()
        return jsonify({"id": post.id, "title": post.title, "description": post.description}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
