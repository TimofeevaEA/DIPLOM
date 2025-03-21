from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import os
from ..models.trainer import Trainer
from ..models.user import User
from .. import db

trainers = Blueprint('trainers', __name__)

# Определяем абсолютный путь к папке uploads
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads/trainers')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Маршрут для раздачи файлов
@trainers.route('/uploads/trainers/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Получение всех тренеров
@trainers.route('/api/trainers', methods=['GET'])
def get_trainers():
    try:
        trainers = Trainer.query.all()
        result = []
        for trainer in trainers:
            trainer_data = trainer.to_json()
            if trainer.user:  # Проверяем наличие связанного пользователя
                trainer_data['user_name'] = trainer.user.name
            if trainer_data['photo']:
                trainer_data['photo'] = f'http://localhost:5000{trainer_data["photo"]}'
            result.append(trainer_data)
        
        print("Returning trainers:", result)  # Отладочный вывод
        return jsonify(result)
    except Exception as e:
        print("Error in get_trainers:", str(e))  # Отладочный вывод
        return jsonify({'error': str(e)}), 500

# Создание нового тренера
@trainers.route('/api/trainers', methods=['POST'])
def create_trainer():
    try:
        description = request.form.get('description')
        user_id = request.form.get('user_id')
        
        photo_path = None
        if 'photo' in request.files:
            file = request.files['photo']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                if not os.path.exists(UPLOAD_FOLDER):
                    os.makedirs(UPLOAD_FOLDER)
                file.save(os.path.join(UPLOAD_FOLDER, filename))
                photo_path = f'/uploads/trainers/{filename}'

        new_trainer = Trainer(
            description=description,
            photo=photo_path,
            user_id=user_id
        )
        
        db.session.add(new_trainer)
        db.session.commit()
        
        return jsonify(new_trainer.to_json()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Обновление данных тренера
@trainers.route('/api/trainers/<int:id>', methods=['PUT'])
def update_trainer(id):
    try:
        trainer = Trainer.query.get_or_404(id)
        
        trainer.description = request.form.get('description', trainer.description)
        trainer.user_id = request.form.get('user_id', trainer.user_id)
        
        if 'photo' in request.files:
            file = request.files['photo']
            if file and allowed_file(file.filename):
                # Удаляем старое фото если оно существует
                if trainer.photo and os.path.exists(trainer.photo[1:]):
                    os.remove(trainer.photo[1:])
                
                filename = secure_filename(file.filename)
                if not os.path.exists(UPLOAD_FOLDER):
                    os.makedirs(UPLOAD_FOLDER)
                file.save(os.path.join(UPLOAD_FOLDER, filename))
                trainer.photo = f'/uploads/trainers/{filename}'
        
        db.session.commit()
        return jsonify(trainer.to_json())
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Удаление тренера
@trainers.route('/api/trainers/<int:id>', methods=['DELETE'])
def delete_trainer(id):
    try:
        trainer = Trainer.query.get_or_404(id)
        
        # Удаляем фото если оно существует
        if trainer.photo and os.path.exists(trainer.photo[1:]):
            os.remove(trainer.photo[1:])
        
        db.session.delete(trainer)
        db.session.commit()
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 400 