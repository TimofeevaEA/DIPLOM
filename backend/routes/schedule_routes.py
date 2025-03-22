from flask import Blueprint, request, jsonify
from ..models.week_schedule import Schedule, DayOfWeek
from ..models.directions import Directions
from ..models.trainer import Trainer
from .. import db
from datetime import datetime, time

schedule_bp = Blueprint('schedule', __name__)

# Получить расписание по ID недели
@schedule_bp.route('/api/schedule/week/<int:week_id>', methods=['GET'])
def get_schedule_by_week(week_id):
    try:
        schedules = Schedule.query.filter_by(week_id=week_id).all()
        result = []
        for schedule in schedules:
            result.append({
                'id': schedule.id,
                'week_id': schedule.week_id,
                'day_of_week': schedule.day_of_week,  # теперь просто число
                'start_time': schedule.start_time,    # теперь просто число
                'direction_id': schedule.direction_id,
                'room_id': schedule.room_id,
                'trainer_id': schedule.trainer_id,
                'capacity': schedule.capacity,
                'direction_name': schedule.direction.name if schedule.direction else None,
                'trainer_name': schedule.trainer.user.name if schedule.trainer and schedule.trainer.user else None,
                'available_spots': schedule.capacity
            })
        print("Returning schedules:", result)  # для отладки
        return jsonify(result)
    except Exception as e:
        print("Error getting schedules:", str(e))
        return jsonify({'error': str(e)}), 400

# Создать новую запись в расписании
@schedule_bp.route('/api/schedule', methods=['POST'])
def create_schedule():
    try:
        data = request.get_json()
        print("Received data:", data)  # для отладки
        
        new_schedule = Schedule(
            week_id=int(data['week_id']),
            day_of_week=int(data['day_of_week']),  # 1-7
            start_time=int(data['start_time']),    # просто число 8-21, без преобразования в time
            direction_id=int(data['direction_id']),
            room_id=int(data['room_id']),
            trainer_id=int(data['trainer_id']),
            capacity=int(data['capacity'])
        )
        
        db.session.add(new_schedule)
        db.session.commit()
        
        return jsonify(new_schedule.to_json()), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating schedule: {str(e)}")
        return jsonify({'error': str(e)}), 400

# Обновить запись в расписании
@schedule_bp.route('/api/schedule/<int:schedule_id>', methods=['PATCH'])
def update_schedule(schedule_id):
    try:
        schedule = Schedule.query.get(schedule_id)
        if not schedule:
            return jsonify({'error': 'Запись в расписании не найдена'}), 404

        data = request.json

        if 'day_of_week' in data:
            try:
                schedule.day_of_week = DayOfWeek[data['day_of_week'].upper()]
            except KeyError:
                return jsonify({
                    'error': 'Некорректный день недели'
                }), 400

        if 'start_time' in data:
            try:
                schedule.start_time = datetime.strptime(data['start_time'], '%H:%M').time()
            except ValueError:
                return jsonify({
                    'error': 'Некорректный формат времени (требуется HH:MM)'
                }), 400

        # Обновление остальных полей
        if 'direction_id' in data:
            schedule.direction_id = data['direction_id']
        if 'room' in data:
            schedule.room = data['room']
        if 'trainer_id' in data:
            schedule.trainer_id = data['trainer_id']
        if 'capacity' in data:
            schedule.capacity = data['capacity']

        db.session.commit()
        
        return jsonify({
            'message': 'Запись в расписании успешно обновлена',
            'schedule': schedule.to_json()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Удалить запись из расписания
@schedule_bp.route('/api/schedule/<int:schedule_id>', methods=['DELETE'])
def delete_schedule(schedule_id):
    try:
        schedule = Schedule.query.get_or_404(schedule_id)
        db.session.delete(schedule)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting schedule: {str(e)}")
        return jsonify({'error': str(e)}), 400

# Получить все записи в расписании по дню недели
@schedule_bp.route('/api/schedule/day/<day_of_week>', methods=['GET'])
def get_schedule_by_day(day_of_week):
    try:
        try:
            day = DayOfWeek[day_of_week.upper()]
        except KeyError:
            return jsonify({
                'error': 'Некорректный день недели'
            }), 400

        schedules = Schedule.query.filter_by(day_of_week=day).all()
        return jsonify([schedule.to_json() for schedule in schedules]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500 