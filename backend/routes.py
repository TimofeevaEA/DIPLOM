from app import app, db
from flask import request, jsonify
from models import User

#получить всех пользователей
@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_json() for user in users])

from datetime import datetime  # добавьте этот импорт в начало файла

#создать нового пользователя
@app.route('/api/users', methods=['POST'])
def create_user():
    try:
        data = request.json
        # Преобразуем строку даты в объект date
        birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d').date()
        
        user = User(
            name=data['name'], 
            email=data['email'], 
            phone=data['phone'], 
            password=data['password'], 
            birth_date=birth_date,  # используем преобразованную дату
            role=data['role']
        )
        db.session.add(user)
        db.session.commit()
        return jsonify(user.to_json()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

#удалить пользователя
@app.route('/api/users/<int:user_id>', methods=['DELETE'])
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
@app.route('/api/users/<int:user_id>', methods=['PATCH'])
def update_user(user_id):
    try:
        data = request.json
        user = User.query.get(user_id)
        if user is None:
            return jsonify({'error': 'Пользователь не найден'}), 404
        user.name = data.get('name', user.name)
        user.email = data.get('email', user.email)
        user.phone = data.get('phone', user.phone)
        user.password = data.get('password', user.password)
        user.birth_date = data.get('birth_date', user.birth_date)
        user.role = data.get('role', user.role)
        db.session.commit()
        return jsonify(user.to_json()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

