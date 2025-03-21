from flask import Blueprint, request, jsonify
from ..models.purchased_subscription import PurchasedSubscription
from .. import db
from flask_cors import CORS
from datetime import datetime

purchased_subscriptions = Blueprint('purchased_subscriptions', __name__)
CORS(purchased_subscriptions)

# Получение всех купленных абонементов
@purchased_subscriptions.route('/api/purchased_subscriptions', methods=['GET'])
def get_purchased_subscriptions():
    all_purchased_subscriptions = PurchasedSubscription.query.all()
    return jsonify([ps.to_json() for ps in all_purchased_subscriptions])

# Создание нового купленного абонемента
@purchased_subscriptions.route('/api/purchased_subscriptions', methods=['POST'])
def create_purchased_subscription():
    try:
        data = request.json
        print("Received data:", data)  # для отладки
        
        client_id = data.get('client_id')
        subscription_id = data.get('subscription_id')
        remaining_sessions = data.get('remaining_sessions')

        if not all([client_id, subscription_id, remaining_sessions]):
            return jsonify({'error': 'Missing required fields'}), 400

        new_purchased_subscription = PurchasedSubscription(
            client_id=client_id,
            subscription_id=subscription_id,
            remaining_sessions=remaining_sessions
        )
        
        db.session.add(new_purchased_subscription)
        db.session.commit()
        
        return jsonify(new_purchased_subscription.to_json()), 201
    except Exception as e:
        print("Error:", str(e))  # для отладки
        return jsonify({'error': str(e)}), 400

# Обновление купленного абонемента
@purchased_subscriptions.route('/api/purchased_subscriptions/<int:id>', methods=['PUT'])
def update_purchased_subscription(id):
    try:
        purchased_subscription = PurchasedSubscription.query.get_or_404(id)
        
        # Обновляем количество занятий
        if 'remaining_sessions' in request.json:
            purchased_subscription.remaining_sessions = request.json.get('remaining_sessions')
        
        # Обновляем дату покупки
        if 'purchase_date' in request.json:
            purchased_subscription.purchase_date = datetime.strptime(request.json.get('purchase_date'), '%Y-%m-%d')
        
        db.session.commit()
        return jsonify(purchased_subscription.to_json())
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Удаление купленного абонемента
@purchased_subscriptions.route('/api/purchased_subscriptions/<int:id>', methods=['DELETE'])
def delete_purchased_subscription(id):
    try:
        purchased_subscription = PurchasedSubscription.query.get_or_404(id)
        db.session.delete(purchased_subscription)
        db.session.commit()
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 400