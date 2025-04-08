from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import os
from ..models.directions import Directions
from .. import db

directions = Blueprint('directions', __name__)

# Определяем абсолютный путь к папке uploads
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                            'frontend', 'public', 'img', 'directions')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Добавляем маршрут для раздачи файлов
@directions.route('/uploads/directions/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@directions.route('/api/directions', methods=['GET'])
def get_directions():
    try:
        all_directions = Directions.query.all()
        directions_data = []
        for direction in all_directions:
            direction_dict = direction.to_json()
            if direction_dict['photo']:
                filename = os.path.basename(direction_dict['photo'])
                direction_dict['photo'] = filename
            directions_data.append(direction_dict)
        return jsonify(directions_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@directions.route('/api/directions', methods=['POST'])
def create_direction():
    try:
        name = request.form.get('name')
        description = request.form.get('description')
        category_id = request.form.get('category_id')
        
        photo_path = None
        if 'photo' in request.files:
            file = request.files['photo']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                if not os.path.exists(UPLOAD_FOLDER):
                    os.makedirs(UPLOAD_FOLDER)
                file.save(os.path.join(UPLOAD_FOLDER, filename))
                photo_path = filename  # Сохраняем только имя файла

        new_direction = Directions(
            name=name,
            description=description,
            photo=photo_path,
            category_id=category_id
        )
        
        db.session.add(new_direction)
        db.session.commit()
        
        return jsonify(new_direction.to_json()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@directions.route('/api/directions/<int:id>', methods=['PUT'])
def update_direction(id):
    try:
        direction = Directions.query.get_or_404(id)
        
        direction.name = request.form.get('name', direction.name)
        direction.description = request.form.get('description', direction.description)
        direction.category_id = request.form.get('category_id', direction.category_id)
        
        if 'photo' in request.files:
            file = request.files['photo']
            if file and allowed_file(file.filename):
                # Удаляем старое фото если оно существует
                if direction.photo and os.path.exists(direction.photo[1:]):
                    os.remove(direction.photo[1:])
                
                filename = secure_filename(file.filename)
                if not os.path.exists(UPLOAD_FOLDER):
                    os.makedirs(UPLOAD_FOLDER)
                file.save(os.path.join(UPLOAD_FOLDER, filename))
                direction.photo = f'/img/directions/{filename}'
        
        db.session.commit()
        return jsonify(direction.to_json())
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@directions.route('/api/directions/<int:id>', methods=['DELETE'])
def delete_direction(id):
    try:
        direction = Directions.query.get_or_404(id)
        
        # Удаляем фото если оно существует
        if direction.photo and os.path.exists(direction.photo[1:]):
            os.remove(direction.photo[1:])
        
        db.session.delete(direction)
        db.session.commit()
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 400 