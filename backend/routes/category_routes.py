from flask import Blueprint, request, jsonify
from ..models.categories import Categories
from .. import db

# Создаем Blueprint для категорий
category_bp = Blueprint('category', __name__)

# Получить все категории
@category_bp.route('/api/categories', methods=['GET'])
def get_categories():
    try:
        categories = Categories.query.all()
        return jsonify([category.to_json() for category in categories]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Создать новую категорию
@category_bp.route('/api/categories', methods=['POST'])
def create_category():
    try:
        data = request.json
        
        # Проверка наличия обязательных полей
        if 'name' not in data:
            return jsonify({
                'error': 'Название категории обязательно'
            }), 400

        # Проверка уникальности названия
        if Categories.query.filter_by(name=data['name']).first():
            return jsonify({
                'error': 'Категория с таким названием уже существует'
            }), 400

        category = Categories(
            name=data['name'],
            description=data.get('description', '')  # Если description не указан, будет пустая строка
        )
        
        db.session.add(category)
        db.session.commit()
        
        return jsonify({
            'message': 'Категория успешно создана',
            'category': category.to_json()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Обновить категорию
@category_bp.route('/api/categories/<int:category_id>', methods=['PATCH'])
def update_category(category_id):
    try:
        category = Categories.query.get(category_id)
        if not category:
            return jsonify({'error': 'Категория не найдена'}), 404

        data = request.json

        # Проверка уникальности названия, если оно меняется
        if 'name' in data and data['name'] != category.name:
            existing_category = Categories.query.filter_by(name=data['name']).first()
            if existing_category:
                return jsonify({
                    'error': 'Категория с таким названием уже существует'
                }), 400
            category.name = data['name']

        if 'description' in data:
            category.description = data['description']

        db.session.commit()
        
        return jsonify({
            'message': 'Категория успешно обновлена',
            'category': category.to_json()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Удалить категорию
@category_bp.route('/api/categories/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    try:
        category = Categories.query.get(category_id)
        if not category:
            return jsonify({'error': 'Категория не найдена'}), 404

        db.session.delete(category)
        db.session.commit()
        
        return jsonify({
            'message': 'Категория успешно удалена'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
