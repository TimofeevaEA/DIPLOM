from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
import os

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    
    # Настройка CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:96293@localhost:5432/ivafit_db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Добавляем конфигурацию для загрузки файлов
    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB макс размер файла
    
    # Создаем папку для загрузок, если её нет
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Импорт моделей
    from .models.categories import Categories
    from .models.directions import Directions
    from .models.subscriptions import Subscription
    from .models.trainer import Trainer
    from .models.user import User
    from .models.purchased_subscription import PurchasedSubscription
    from .models.week_schedule import Week, Schedule
    from .models.client_schedule import ClientSchedule
    from .models.article import Article  # Добавляем импорт модели статей
    
    # Регистрация blueprints
    from .routes.user_routes import user_bp
    from .routes.authorization_routes import auth_bp
    from .routes.category_routes import category_bp
    from .routes.direction_routes import directions
    from .routes.trainer_routes import trainers
    from .routes.subscription_routes import subscriptions
    from .routes.purchased_subscription_routes import purchased_subscriptions
    from .routes.week_routes import week_bp
    from .routes.schedule_routes import schedule_bp
    from .routes.room_routes import rooms_bp
    from .routes.article_routes import articles_bp  # Добавляем импорт роутов для статей
    from .routes.client_schedule_routes import client_schedule_bp
    from .routes.admin_routes import admin_bp
    
    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(category_bp)
    app.register_blueprint(directions)
    app.register_blueprint(trainers)
    app.register_blueprint(subscriptions)
    app.register_blueprint(purchased_subscriptions)
    app.register_blueprint(week_bp)
    app.register_blueprint(schedule_bp)
    app.register_blueprint(rooms_bp)
    app.register_blueprint(articles_bp)  # Регистрируем блюпринт для статей
    app.register_blueprint(client_schedule_bp)
    app.register_blueprint(admin_bp)
    
    return app