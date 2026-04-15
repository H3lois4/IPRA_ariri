import os
from flask import Flask, send_from_directory, request as flask_request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'frontend'))
UPLOADS_DIR = os.path.join(BASE_DIR, 'uploads')


def create_app():
    app = Flask(__name__, static_folder=None)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, 'ariri.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['UPLOADS_DIR'] = UPLOADS_DIR
    app.config['ACCESS_PIN'] = os.environ.get('ARIRI_PIN', '1234')

    db.init_app(app)
    CORS(app)
    os.makedirs(UPLOADS_DIR, exist_ok=True)

    # Register API blueprints
    _register_blueprints(app)

    with app.app_context():
        try:
            from . import models
        except ImportError:
            pass
        db.create_all()

    # Serve uploaded files
    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(UPLOADS_DIR, filename)

    # Root
    @app.route('/')
    def serve_index():
        return send_from_directory(FRONTEND_DIR, 'index.html')

    @app.route('/index.html')
    def serve_index_html():
        return send_from_directory(FRONTEND_DIR, 'index.html')

    # Serve static frontend files explicitly (CSS, JS, assets)
    @app.route('/css/<path:filename>')
    def serve_css(filename):
        return send_from_directory(os.path.join(FRONTEND_DIR, 'css'), filename)

    @app.route('/js/<path:filename>')
    def serve_js(filename):
        return send_from_directory(os.path.join(FRONTEND_DIR, 'js'), filename)

    @app.route('/assets/<path:filename>')
    def serve_assets(filename):
        return send_from_directory(os.path.join(FRONTEND_DIR, 'assets'), filename)

    @app.route('/manifest.json')
    def serve_manifest():
        return send_from_directory(FRONTEND_DIR, 'manifest.json')

    @app.route('/sw.js')
    def serve_sw():
        resp = send_from_directory(FRONTEND_DIR, 'sw.js')
        resp.headers['Service-Worker-Allowed'] = '/'
        return resp

    @app.route('/favicon.ico')
    def serve_favicon():
        return send_from_directory(FRONTEND_DIR, 'favicon.ico') if os.path.isfile(os.path.join(FRONTEND_DIR, 'favicon.ico')) else ('', 204)

    return app


def _register_blueprints(app):
    try:
        from backend.routes.ping import ping_bp
        app.register_blueprint(ping_bp)
    except ImportError:
        pass
    try:
        from backend.routes.pin import pin_bp
        app.register_blueprint(pin_bp)
    except ImportError:
        pass
    try:
        from backend.routes.forms import forms_bp
        app.register_blueprint(forms_bp)
    except ImportError:
        pass
    try:
        from backend.routes.posts import posts_bp
        app.register_blueprint(posts_bp)
    except ImportError:
        pass
    try:
        from backend.routes.receipts import receipts_bp
        app.register_blueprint(receipts_bp)
    except ImportError:
        pass
    try:
        from backend.routes.volunteers import volunteers_bp
        app.register_blueprint(volunteers_bp)
    except ImportError:
        pass
    try:
        from backend.routes.schedule import schedule_bp
        app.register_blueprint(schedule_bp)
    except ImportError:
        pass
    try:
        from backend.routes.sync import sync_bp
        app.register_blueprint(sync_bp)
    except ImportError:
        pass


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=False)
