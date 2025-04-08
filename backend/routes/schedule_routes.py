from flask import Blueprint, request, jsonify
from ..models.week_schedule import Schedule, DayOfWeek
from ..models.directions import Directions
from ..models.trainer import Trainer
from ..models.client_schedule import ClientSchedule
from ..models.purchased_subscription import PurchasedSubscription
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
        print(f"Error fetching schedule: {str(e)}") 
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
            spots_left=data['capacity'], 
            is_completed=False  
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
        client_id = data.get('clientId')

        # Проверяем, не записан ли уже клиент
        existing_booking = ClientSchedule.query.filter_by(
            client_id=client_id,
            schedule_id=schedule_id
        ).first()

        if existing_booking:
            return jsonify({'error': 'Вы уже записаны на эту тренировку'}), 400

        # Проверяем наличие активной подписки
        active_subscription = PurchasedSubscription.query.filter_by(
            client_id=client_id
        ).filter(
            PurchasedSubscription.remaining_sessions > 0
        ).first()

        if not active_subscription:
            return jsonify({'error': 'У клиента нет активной подписки с доступными тренировками'}), 400

        schedule = Schedule.query.get_or_404(schedule_id)
        
        if schedule.spots_left <= 0:
            return jsonify({'error': 'Нет свободных мест'}), 400

        # Создаем запись
        booking = ClientSchedule(
            client_id=client_id,
            schedule_id=schedule_id,
            purchased_subscription_id=active_subscription.id,
            status='Записан'
        )
        
        schedule.spots_left -= 1
        
        db.session.add(booking)
        db.session.commit()

        return jsonify({
            'message': 'Успешно записан',
            'remaining_sessions': active_subscription.remaining_sessions
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error booking client: {str(e)}")
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
        
        # Если статус "Посетил", уменьшаем количество тренировок
        if new_status == 'Посетил':
            subscription = booking.purchased_subscription
            if subscription.remaining_sessions > 0:
                subscription.remaining_sessions -= 1
            else:
                return jsonify({'error': 'У клиента закончились тренировки'}), 400
        
        db.session.commit()
        return jsonify({
            'message': 'Статус обновлен',
            'remaining_sessions': booking.purchased_subscription.remaining_sessions
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Получение списка клиентов на тренировке
@schedule_bp.route('/api/schedule/<int:schedule_id>/clients', methods=['GET'])
def get_training_clients(schedule_id):
    try:
        bookings = ClientSchedule.query.filter_by(schedule_id=schedule_id).all()
        clients_data = []
        
        for booking in bookings:
            client_data = {
                'id': booking.id,
                'client_id': booking.client_id,
                'client_name': booking.client.name if booking.client else None,
                'phone': booking.client.phone if booking.client else None,
                'status': booking.status,
                'remaining_sessions': booking.purchased_subscription.remaining_sessions  # Добавляем это поле
            }
            clients_data.append(client_data)
        
        print("Sending clients data:", clients_data)  # для отладки
        return jsonify(clients_data), 200

    except Exception as e:
        print(f"Error getting clients: {str(e)}")  # для отладки
        return jsonify({'error': str(e)}), 500

@schedule_bp.route('/api/schedule/<int:schedule_id>', methods=['GET'])
def get_schedule(schedule_id):
    try:
        schedule = Schedule.query.get_or_404(schedule_id)
        return jsonify(schedule.to_json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@schedule_bp.route('/api/schedule/week/<int:week_id>/trainer/<int:trainer_id>', methods=['GET'])
def get_trainer_schedule(week_id, trainer_id):
    try:
        # Получаем тренера по ID пользователя
        trainer = Trainer.query.filter_by(user_id=trainer_id).first()
        if not trainer:
            return jsonify({'error': 'Тренер не найден'}), 404

        # Получаем расписание тренера
        schedules = Schedule.query.filter_by(
            week_id=week_id,
            trainer_id=trainer.id
        ).all()

        return jsonify([schedule.to_json() for schedule in schedules])
    except Exception as e:
        print(f"Error fetching trainer schedule: {str(e)}")
        return jsonify({'error': str(e)}), 500 