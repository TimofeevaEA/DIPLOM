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
        print(f"Получаем расписание для недели {week_id}")
        schedules = Schedule.query.filter_by(week_id=week_id).all()
        print(f"Найдено записей: {len(schedules)}")
        
        result = []
        for schedule in schedules:
            try:
                print(f"Обработка записи: ID={schedule.id}, день={schedule.day_of_week}")
                schedule_data = {
                    'id': schedule.id,
                    'week_id': schedule.week_id,
                    'day_of_week': schedule.day_of_week.name,
                    'start_time': schedule.start_time.strftime('%H:%M'),
                    'direction_id': schedule.direction_id,
                    'room': schedule.room,
                    'trainer_id': schedule.trainer_id,
                    'capacity': schedule.capacity,
                    'direction_name': schedule.direction.name if schedule.direction else None,
                    'trainer_name': schedule.trainer.user.name if schedule.trainer and schedule.trainer.user else None
                }
                print(f"Подготовлены данные: {schedule_data}")
                result.append(schedule_data)
            except Exception as e:
                print(f"Ошибка при обработке записи расписания: {str(e)}")
                continue

        print(f"Успешно обработано записей: {len(result)}")
        return jsonify(result)
    except Exception as e:
        print(f"Общая ошибка при получении расписания: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Создать новую запись в расписании
@schedule_bp.route('/api/schedule', methods=['POST'])
def create_schedule():
    try:
        data = request.get_json()
        print("Полученные данные:", data)
        
        # Преобразуем строку времени в объект time
        time_str = data['start_time']
        time_obj = datetime.strptime(time_str, '%H:%M').time()
        
        # Проверяем обязательные поля
        required_fields = ['week_id', 'day_of_week', 'start_time', 
                         'direction_id', 'trainer_id', 'room', 'capacity']
        
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                'error': f'Отсутствуют обязательные поля: {", ".join(missing_fields)}'
            }), 400

        schedule = Schedule(
            week_id=int(data['week_id']),
            day_of_week=data['day_of_week'],
            start_time=time_obj,
            direction_id=int(data['direction_id']),
            trainer_id=int(data['trainer_id']),
            room=data['room'],
            capacity=int(data['capacity'])
        )
        
        db.session.add(schedule)
        db.session.commit()
        
        return jsonify(schedule.to_json()), 201
    except Exception as e:
        print("Ошибка:", str(e))
        db.session.rollback()
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
        schedule = Schedule.query.get(schedule_id)
        if not schedule:
            return jsonify({'error': 'Запись в расписании не найдена'}), 404

        # Здесь можно добавить проверку на существование связанных записей клиентов
        # когда мы добавим таблицу client_schedule

        db.session.delete(schedule)
        db.session.commit()
        
        return jsonify({
            'message': 'Запись в расписании успешно удалена'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

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