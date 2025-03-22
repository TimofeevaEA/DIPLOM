from flask import Blueprint, request, jsonify
from ..models.week_schedule import Schedule, DayOfWeek
from ..models.directions import Directions
from ..models.trainer import Trainer
from ..models.client_schedule import ClientSchedule
from .. import db
from datetime import datetime, time

schedule_bp = Blueprint('schedule', __name__)

# Получить расписание по ID недели
@schedule_bp.route('/api/schedule/week/<int:week_id>', methods=['GET'])
def get_schedule_by_week(week_id):
    try:
        schedules = Schedule.query.filter_by(week_id=week_id).all()
        return jsonify([schedule.to_json() for schedule in schedules])
    except Exception as e:
        print(f"Error fetching schedule: {str(e)}")  # для отладки
        return jsonify({'error': str(e)}), 500

# Создать новую запись в расписании
@schedule_bp.route('/api/schedule', methods=['POST'])
def create_schedule():
    try:
        data = request.get_json()
        
        # Создаем новое расписание
        new_schedule = Schedule(
            week_id=data['week_id'],
            day_of_week=data['day_of_week'],
            start_time=data['start_time'],
            direction_id=data['direction_id'],
            room_id=data['room_id'],
            trainer_id=data['trainer_id'],
            capacity=data['capacity'],
            spots_left=data['capacity'],  # Устанавливаем начальное значение равным capacity
            is_completed=False  # По умолчанию тренировка не проведена
        )
        
        db.session.add(new_schedule)
        db.session.commit()
        
        return jsonify(new_schedule.to_json()), 201
        
    except Exception as e:
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

# Запись клиента на тренировку
@schedule_bp.route('/api/schedule/<int:schedule_id>/book', methods=['POST'])
def book_client(schedule_id):
    try:
        data = request.get_json()
        client_id = data.get('clientId')  # изменили с client_id на clientId

        if not client_id:
            return jsonify({'error': 'Client ID is required'}), 400

        schedule = Schedule.query.get_or_404(schedule_id)
        
        if schedule.spots_left <= 0:
            return jsonify({'error': 'Нет свободных мест'}), 400

        # Проверяем, не записан ли уже клиент
        existing_booking = ClientSchedule.query.filter_by(
            client_id=client_id,
            schedule_id=schedule_id
        ).first()

        if existing_booking:
            return jsonify({'error': 'Клиент уже записан'}), 400

        # Создаем новую запись
        booking = ClientSchedule(
            client_id=client_id,
            schedule_id=schedule_id,
            status='Записан'
        )
        
        # Уменьшаем количество свободных мест
        schedule.spots_left -= 1

        db.session.add(booking)
        db.session.commit()

        return jsonify({
            'message': 'Успешно записан',
            'spots_left': schedule.spots_left
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error booking client: {str(e)}")  # для отладки
        return jsonify({'error': str(e)}), 500

# Отмена записи клиента
@schedule_bp.route('/api/client-schedule/<int:booking_id>', methods=['DELETE'])
def cancel_booking(booking_id):
    try:
        booking = ClientSchedule.query.get_or_404(booking_id)
        schedule = Schedule.query.get(booking.schedule_id)
        
        # Увеличиваем количество свободных мест
        schedule.spots_left += 1
        
        db.session.delete(booking)
        db.session.commit()

        return '', 204

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Проведение тренировки
@schedule_bp.route('/api/schedule/<int:schedule_id>/complete', methods=['PUT'])
def complete_training(schedule_id):
    try:
        schedule = Schedule.query.get_or_404(schedule_id)
        schedule.is_completed = True
        
        # Обновляем статусы клиентов
        client_schedules = ClientSchedule.query.filter_by(schedule_id=schedule_id).all()
        for client_schedule in client_schedules:
            if client_schedule.status == 'Записан':
                client_schedule.status = 'Пропустил'  # По умолчанию отмечаем как пропуск

        db.session.commit()
        return jsonify({'message': 'Тренировка проведена'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Обновление статуса клиента на тренировке
@schedule_bp.route('/api/client-schedule/<int:booking_id>/status', methods=['PUT'])
def update_client_status(booking_id):
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        booking = ClientSchedule.query.get_or_404(booking_id)
        booking.status = new_status
        
        db.session.commit()
        return jsonify({'message': 'Статус обновлен'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Получение списка клиентов на тренировке
@schedule_bp.route('/api/schedule/<int:schedule_id>/clients', methods=['GET'])
def get_training_clients(schedule_id):
    try:
        bookings = ClientSchedule.query.filter_by(schedule_id=schedule_id).all()
        clients_data = [{
            'id': booking.id,
            'client_name': booking.client.name,
            'status': booking.status,
            'phone': booking.client.phone
        } for booking in bookings]
        
        return jsonify(clients_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@schedule_bp.route('/api/schedule/<int:schedule_id>', methods=['GET'])
def get_schedule(schedule_id):
    try:
        schedule = Schedule.query.get_or_404(schedule_id)
        return jsonify(schedule.to_json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500 