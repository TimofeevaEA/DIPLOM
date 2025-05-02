from flask import Blueprint, jsonify
from ..models.user import User
from ..models.purchased_subscription import PurchasedSubscription

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/api/admin/statistics', methods=['GET'])
def get_statistics():
    try:
        # Получаем общее количество пользователей
        total_users = User.query.count()

        # Получаем количество тренеров
        total_trainers = User.query.filter_by(role='trainer').count()

        # Получаем количество клиентов (пользователей с ролью 'user')
        total_clients = User.query.filter_by(role='user').count()

        # Получаем количество активных абонементов
        active_subscriptions = PurchasedSubscription.query.filter(
            PurchasedSubscription.remaining_sessions > 0
        ).count()

        return jsonify({
            'totalUsers': total_users,
            'totalTrainers': total_trainers,
            'totalClients': total_clients,
            'activeSubscriptions': active_subscriptions
        })

    except Exception as e:
        print(f"Error getting statistics: {str(e)}")
        return jsonify({'error': str(e)}), 500 