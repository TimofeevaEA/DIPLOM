from flask import Blueprint, request, jsonify
from datetime import datetime
from ..models.user import User  # Используем относительный импорт
from .. import db  # Импортируем db из корневого __init__.py
from ..models.purchased_subscription import PurchasedSubscription  # Импортируем модель PurchasedSubscription

# Создаем Blueprint
user_bp = Blueprint('user', __name__)

#получить всех пользователей
@user_bp.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_json() for user in users])

#создать нового пользователя
@user_bp.route('/api/users', methods=['POST'])
def create_user():
    try:
        data = request.json
        
        # Проверка наличия обязательных полей
        required_fields = ['name', 'email', 'phone', 'password', 'birth_date', 'role']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'Поле {field} обязательно для заполнения'
                }), 400

        # Проверка уникальности email
        if User.query.filter_by(email=data['email']).first():
            return jsonify({
                'error': 'Пользователь с таким email уже существует'
            }), 400

        # Проверка уникальности телефона
        if User.query.filter_by(phone=data['phone']).first():
            return jsonify({
                'error': 'Пользователь с таким телефоном уже существует'
            }), 400

        try:
            birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({
                'error': 'Неверный формат даты. Используйте формат YYYY-MM-DD'
            }), 400

        user = User(
            name=data['name'],
            email=data['email'],
            phone=data['phone'],
            password=data['password'],
            birth_date=birth_date,
            role=data['role']
        )
        db.session.add(user)
        db.session.commit()
        return jsonify(user.to_json()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

#удалить пользователя
@user_bp.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        user = User.query.get(user_id)
        if user:
            db.session.delete(user)
            db.session.commit()
            return jsonify({'message': 'Пользователь успешно удален'}), 200
        else:
            return jsonify({'error': 'Пользователь не найден'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#обновить пользователя
@user_bp.route('/api/users/<int:user_id>', methods=['PATCH'])
def update_user(user_id):
    try:
        data = request.json
        user = User.query.get(user_id)
        if user is None:
            return jsonify({'error': 'Пользователь не найден'}), 404

        # Обновляем простые поля
        if 'name' in data:
            user.name = data['name']
        if 'email' in data:
            user.email = data['email']
        if 'phone' in data:
            user.phone = data['phone']
        if 'password' in data and data['password']:  # Проверяем, что пароль не пустой
            user.password = data['password']
        if 'role' in data:
            user.role = data['role']
            
        # Обрабатываем дату рождения
        if 'birth_date' in data and data['birth_date']:
            try:
                birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d').date()
                user.birth_date = birth_date
            except ValueError:
                return jsonify({'error': 'Неверный формат даты'}), 400

        db.session.commit()
        return jsonify(user.to_json()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/api/users/search')
def search_users():
    query = request.args.get('query', '')
    with_subscriptions = request.args.get('with_subscriptions', 'false') == 'true'

    users = User.query.filter(
        (User.role == 'user') &
        (User.name.ilike(f'%{query}%') | User.phone.ilike(f'%{query}%'))
    ).all()

    if with_subscriptions:
        result = []
        for user in users:
            user_data = user.to_json()
            # Получаем активную подписку
            active_subscription = PurchasedSubscription.query.filter_by(
                client_id=user.id
            ).filter(
                PurchasedSubscription.remaining_sessions > 0
            ).first()
            
            user_data['active_subscription'] = active_subscription.to_json() if active_subscription else None
            result.append(user_data)
        return jsonify(result)
    
    return jsonify([user.to_json() for user in users])

