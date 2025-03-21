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
    
    # Импорт всех моделей
    from .models.categories import Categories
    from .models.directions import Directions
    from .models.subscriptions import Subscription
    from .models.trainer import Trainer
    from .models.user import User
    from .models.purchased_subscription import PurchasedSubscription
    from .models.week_schedule import Week, Schedule
    from .models.client_schedule import ClientSchedule

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
    
    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(category_bp)
    app.register_blueprint(directions)
    app.register_blueprint(trainers)
    app.register_blueprint(subscriptions)
    app.register_blueprint(purchased_subscriptions)
    app.register_blueprint(week_bp)
    app.register_blueprint(schedule_bp)
    
    with app.app_context():
        db.create_all()  # Теперь создадутся все таблицы
        
    return app