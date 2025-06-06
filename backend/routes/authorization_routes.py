from flask import Blueprint, request, jsonify
from datetime import datetime
from ..models.user import User
from .. import db

# Создаем Blueprint для авторизации
auth_bp = Blueprint('authorization', __name__)

#авторизоваться
@auth_bp.route('/api/authorization/login', methods=['POST'])
def login():
    try:
        data = request.json
        
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({
                'error': 'Email и пароль обязательны'
            }), 400

        user = User.query.filter_by(email=data['email']).first()

        if user and user.password == data['password']:  # В реальном приложении используйте хеширование
            print("User found:", user.id, user.name, user.email, user.phone)  # Добавляем логирование
            return jsonify({
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'role': user.role,
                    'phone': user.phone
                }
            }), 200
        else:
            return jsonify({
                'error': 'Неверный email или пароль'
            }), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500

#зарегистрироваться
@auth_bp.route('/api/authorization/register', methods=['POST'])
def register():
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
        
        return jsonify({
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'phone': user.phone
            },
            'message': 'Регистрация успешна'
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

#выйти из учетной записи
@auth_bp.route('/api/authorization/logout', methods=['POST'])
def logout():
    return jsonify({'message': 'Вы успешно вышли из учетной записи'}), 200

#сменить пароль
@auth_bp.route('/api/authorization/change-password', methods=['POST'])
def change_password():
    try:
        data = request.json
        
        if not data or 'currentPassword' not in data or 'newPassword' not in data or 'email' not in data:
            return jsonify({
                'error': 'Текущий пароль, новый пароль и email обязательны'
            }), 400

        # Получаем пользователя по email
        current_user = User.query.filter_by(email=data['email']).first()
        
        if not current_user:
            return jsonify({
                'error': 'Пользователь не найден'
            }), 404

        # Проверяем текущий пароль
        if current_user.password != data['currentPassword']:  # В реальном приложении используйте хеширование
            return jsonify({
                'error': 'Неверный текущий пароль'
            }), 401

        # Обновляем пароль
        current_user.password = data['newPassword']  # В реальном приложении используйте хеширование
        db.session.commit()

        return jsonify({
            'message': 'Пароль успешно изменен'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


