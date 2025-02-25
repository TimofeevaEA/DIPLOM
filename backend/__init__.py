from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///iva.sqlite'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    
    # Регистрация blueprints
    from .routes.user_routes import user_bp
    from .routes.authorization_routes import auth_bp
    
    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp)
    
    return app