from flask import Blueprint, request, jsonify, current_app
from .. import db
from ..models.article import Article
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from flask_cors import cross_origin

articles_bp = Blueprint('articles', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                            'frontend', 'public', 'img', 'articles')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def cleanup_old_files(days=7):
    """Удаляет файлы старше указанного количества дней"""
    current_time = datetime.now()
    for filename in os.listdir(UPLOAD_FOLDER):
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file_modified = datetime.fromtimestamp(os.path.getmtime(file_path))
        if (current_time - file_modified).days > days:
            os.remove(file_path)

@articles_bp.route('/api/articles', methods=['GET'])
@cross_origin()
def get_articles():
    try:
        # Добавляем фильтрацию по категории
        category = request.args.get('category')
        query = Article.query
        if category:
            query = query.filter_by(category=category)
        
        # Добавляем сортировку по дате создания
        articles = query.order_by(Article.created_at.desc()).all()
        return jsonify([article.to_dict() for article in articles])
    except Exception as e:
        current_app.logger.error(f"Error fetching articles: {str(e)}")
        return jsonify({'error': 'Internal Server Error'}), 500

@articles_bp.route('/api/articles', methods=['POST'])
@cross_origin()
def create_article():
    try:
        title = request.form.get('title')
        content = request.form.get('content')
        category = request.form.get('category')
        author_id = request.form.get('author_id')
        
        if not all([title, content, category, author_id]):
            return jsonify({'error': 'Не все обязательные поля заполнены'}), 400

        photo_filename = None
        if 'photo' in request.files:
            photo = request.files['photo']
            if photo and allowed_file(photo.filename):
                filename = secure_filename(photo.filename)
                # Генерируем уникальное имя файла
                photo_filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
                photo.save(os.path.join(UPLOAD_FOLDER, photo_filename))

        article = Article(
            title=title,
            content=content,
            category=category,
            author_id=author_id,
            photo=photo_filename
        )
        
        db.session.add(article)
        db.session.commit()
        
        return jsonify({'message': 'Статья успешно создана', 'id': article.id}), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating article: {str(e)}")
        return jsonify({'error': 'Internal Server Error'}), 500

@articles_bp.route('/api/articles/<int:article_id>', methods=['GET'])
def get_article(article_id):
    try:
        article = Article.query.get_or_404(article_id)
        return jsonify(article.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@articles_bp.route('/api/articles/<int:article_id>', methods=['PUT'])
@cross_origin()
def update_article(article_id):
    try:
        article = Article.query.get_or_404(article_id)
        
        title = request.form.get('title')
        content = request.form.get('content')
        category = request.form.get('category')
        
        if title:
            article.title = title
        if content:
            article.content = content
        if category:
            article.category = category
            
        if 'photo' in request.files:
            photo = request.files['photo']
            if photo and allowed_file(photo.filename):
                # Удаляем старое фото, если оно есть
                if article.photo:
                    old_photo_path = os.path.join(UPLOAD_FOLDER, article.photo)
                    if os.path.exists(old_photo_path):
                        os.remove(old_photo_path)
                
                filename = secure_filename(photo.filename)
                photo_filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
                photo.save(os.path.join(UPLOAD_FOLDER, photo_filename))
                article.photo = photo_filename
        
        article.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Статья успешно обновлена'}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating article: {str(e)}")
        return jsonify({'error': 'Internal Server Error'}), 500

@articles_bp.route('/api/articles/<int:article_id>', methods=['DELETE'])
@cross_origin()
def delete_article(article_id):
    try:
        article = Article.query.get_or_404(article_id)
        
        # Удаляем фото, если оно есть
        if article.photo:
            photo_path = os.path.join(UPLOAD_FOLDER, article.photo)
            if os.path.exists(photo_path):
                os.remove(photo_path)
        
        db.session.delete(article)
        db.session.commit()
        
        return jsonify({'message': 'Статья успешно удалена'}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting article: {str(e)}")
        return jsonify({'error': 'Internal Server Error'}), 500

@articles_bp.route('/api/articles/upload-image', methods=['POST'])
def upload_image():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Нет файла'}), 400
            
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            unique_filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
            file.save(os.path.join(UPLOAD_FOLDER, unique_filename))
            
            # Возвращаем URL в формате, который ожидает TinyMCE
            return jsonify({
                'location': f"/static/uploads/{unique_filename}"
            })
            
        return jsonify({'error': 'Недопустимый тип файла'}), 400
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@articles_bp.route('/api/articles/test', methods=['GET'])
def test_articles():
    return jsonify({"message": "Articles route is working"})
