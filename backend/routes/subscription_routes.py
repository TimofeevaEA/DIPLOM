from flask import Blueprint, request, jsonify
from ..models.subscriptions import Subscription
from .. import db

subscriptions = Blueprint('subscriptions', __name__)

# Получение всех абонементов
@subscriptions.route('/api/subscriptions', methods=['GET'])
def get_subscriptions():
    all_subscriptions = Subscription.query.all()
    return jsonify([subscription.to_json() for subscription in all_subscriptions])

# Создание нового абонемента
@subscriptions.route('/api/subscriptions', methods=['POST'])
def create_subscription():
    try:
        session_count = request.json.get('session_count')
        day_count = request.json.get('day_count')
        price = request.json.get('price')
        discounted_price = request.json.get('discounted_price')
        name = request.json.get('name')
        new_subscription = Subscription(
            session_count=session_count,
            day_count=day_count,
            price=price,
            discounted_price=discounted_price,
            name=name
        )
        
        db.session.add(new_subscription)
        db.session.commit()
        
        return jsonify(new_subscription.to_json()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Обновление абонемента
@subscriptions.route('/api/subscriptions/<int:id>', methods=['PUT'])
def update_subscription(id):
    try:
        subscription = Subscription.query.get_or_404(id)
        
        subscription.session_count = request.json.get('session_count', subscription.session_count)
        subscription.day_count = request.json.get('day_count', subscription.day_count)
        subscription.price = request.json.get('price', subscription.price)
        subscription.discounted_price = request.json.get('discounted_price', subscription.discounted_price)
        
        db.session.commit()
        return jsonify(subscription.to_json())
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Удаление абонемента
@subscriptions.route('/api/subscriptions/<int:id>', methods=['DELETE'])
def delete_subscription(id):
    try:
        subscription = Subscription.query.get_or_404(id)
        db.session.delete(subscription)
        db.session.commit()
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 400