import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Paths
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'frontend'))
UPLOADS_DIR = os.path.join(BASE_DIR, 'uploads')


def create_app():
    """Cria e configura a aplicação Flask."""
    app = Flask(
        __name__,
        static_folder=None  # Disable default static handler; we serve manually
    )

    # SQLite database stored in the backend directory
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, 'ariri.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['UPLOADS_DIR'] = UPLOADS_DIR

    # Initialize extensions
    db.init_app(app)
    CORS(app)

    # Ensure uploads directory exists
    os.makedirs(UPLOADS_DIR, exist_ok=True)

    # Register blueprints (lazy — modules created in later tasks)
    _register_blueprints(app)

    # Create database tables
    with app.app_context():
        # Import models so SQLAlchemy knows about them
        try:
            from . import models  # noqa: F401
        except ImportError:
            pass
        db.create_all()

    # Serve uploaded files (images from forms, diary, receipts, volunteer profiles)
    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(UPLOADS_DIR, filename)

    # SPA catch-all: return index.html for any non-API, non-static route
    @app.route('/')
    def serve_index():
        return send_from_directory(FRONTEND_DIR, 'index.html')

    @app.route('/<path:path>')
    def catch_all(path):
        # Serve actual static files if they exist
        file_path = os.path.join(FRONTEND_DIR, path)
        if os.path.isfile(file_path):
            return send_from_directory(FRONTEND_DIR, path)
        # Otherwise return index.html for SPA routing
        return send_from_directory(FRONTEND_DIR, 'index.html')

    return app


def _register_blueprints(app):
    """Register route blueprints. Skips any that aren't implemented yet."""
    blueprint_imports = [
        ('routes.ping', 'ping_bp'),
        ('routes.forms', 'forms_bp'),
        ('routes.posts', 'posts_bp'),
        ('routes.receipts', 'receipts_bp'),
        ('routes.volunteers', 'volunteers_bp'),
        ('routes.schedule', 'schedule_bp'),
        ('routes.sync', 'sync_bp'),
    ]
    for module_path, bp_name in blueprint_imports:
        try:
            module = __import__(f'backend.{module_path}', fromlist=[bp_name])
            bp = getattr(module, bp_name)
            app.register_blueprint(bp)
        except (ImportError, AttributeError):
            pass


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
