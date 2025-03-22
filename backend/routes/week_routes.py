from flask import Blueprint, request, jsonify
from ..models.week_schedule import Week, Schedule
from .. import db
from datetime import datetime, timedelta

week_bp = Blueprint('week', __name__)

# Получить все недели
@week_bp.route('/api/weeks', methods=['GET'])
def get_weeks():
    try:
        # Получаем параметр is_template из query string
        is_template = request.args.get('is_template', type=bool)
        
        if is_template is not None:
            weeks = Week.query.filter_by(is_template=is_template).all()
        else:
            weeks = Week.query.all()
            
        return jsonify([week.to_json() for week in weeks]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Создать новую неделю
@week_bp.route('/api/weeks', methods=['POST'])
def create_week():
    try:
        data = request.json
        
        # Проверка обязательных полей
        if 'start_date' not in data:
            return jsonify({
                'error': 'Дата начала недели обязательна'
            }), 400
            
        # Преобразование строковых дат в объекты date
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        # Если end_date не указана, автоматически установим на 6 дней позже
        end_date = datetime.strptime(data.get('end_date', ''), '%Y-%m-%d').date() if data.get('end_date') else start_date + timedelta(days=6)
        
        # Проверка, нет ли пересечения с существующими неделями
        overlapping_week = Week.query.filter(
            Week.start_date <= end_date,
            Week.end_date >= start_date,
            Week.is_template == data.get('is_template', False)
        ).first()
        
        if overlapping_week:
            return jsonify({
                'error': 'Указанный период пересекается с существующей неделей'
            }), 400

        week = Week(
            start_date=start_date,
            end_date=end_date,
            is_template=data.get('is_template', False)
        )
        
        db.session.add(week)
        db.session.commit()
        
        return jsonify({
            'message': 'Неделя успешно создана',
            'week': week.to_json()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Обновить неделю
@week_bp.route('/api/weeks/<int:week_id>', methods=['PATCH'])
def update_week(week_id):
    try:
        week = Week.query.get(week_id)
        if not week:
            return jsonify({'error': 'Неделя не найдена'}), 404

        data = request.json
        
        if 'start_date' in data:
            week.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        if 'end_date' in data:
            week.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        if 'is_template' in data:
            week.is_template = data['is_template']

        db.session.commit()
        
        return jsonify({
            'message': 'Неделя успешно обновлена',
            'week': week.to_json()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Удалить неделю
@week_bp.route('/api/weeks/<int:week_id>', methods=['DELETE'])
def delete_week(week_id):
    try:
        week = Week.query.get(week_id)
        if not week:
            return jsonify({'error': 'Неделя не найдена'}), 404

        # Проверяем, есть ли связанные записи в расписании
        if week.schedules:
            return jsonify({
                'error': 'Невозможно удалить неделю, так как существуют связанные записи в расписании'
            }), 400

        db.session.delete(week)
        db.session.commit()
        
        return jsonify({
            'message': 'Неделя успешно удалена'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Копировать шаблон недели
@week_bp.route('/api/weeks/copy-template', methods=['POST'])
def copy_template_week():
    try:
        data = request.get_json()
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        end_date = start_date + timedelta(days=6)

        # Создаем новую неделю
        new_week = Week(
            start_date=start_date,
            end_date=end_date,
            is_template=False
        )
        db.session.add(new_week)
        db.session.commit()

        # Находим шаблонную неделю и копируем из нее расписание
        template_week = Week.query.filter_by(is_template=True).first()
        if template_week:
            template_schedules = Schedule.query.filter_by(week_id=template_week.id).all()
            for schedule in template_schedules:
                new_schedule = Schedule(
                    week_id=new_week.id,
                    day_of_week=schedule.day_of_week,
                    start_time=schedule.start_time,
                    direction_id=schedule.direction_id,
                    room_id=schedule.room_id,
                    trainer_id=schedule.trainer_id,
                    capacity=schedule.capacity
                )
                db.session.add(new_schedule)
            db.session.commit()

        return jsonify(new_week.to_json()), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error copying template week: {str(e)}")
        return jsonify({'error': str(e)}), 400 