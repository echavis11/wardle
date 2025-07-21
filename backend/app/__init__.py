# backend/app/__init__.py

from flask import Flask
from instance import config
from flask_cors import CORS # <--- ADD THIS LINE

def create_app():
    app = Flask(__name__)
    app.config.from_object(config)

    # Initialize CORS BEFORE registering blueprints
    # This will allow requests from http://localhost:3000 (your Next.js dev server)
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}) # <--- ADD/MODIFY THIS LINE

    from app.routes import api_bp
    app.register_blueprint(api_bp)

    @app.route('/')
    def hello():
        return "Welcome to Wardle Backend API!"

    return app