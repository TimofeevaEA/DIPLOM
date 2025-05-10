from flask import Blueprint, request, jsonify
from ..models.week_schedule import Schedule, DayOfWeek, Week
from ..models.directions import Directions
from ..models.trainer import Trainer
from ..models.client_schedule import ClientSchedule
from ..models.purchased_subscription import PurchasedSubscription
from .. import db
from datetime import datetime, time, timedelta

schedule_bp = Blueprint('schedule', __name__)

# Получить расписание по ID недели
@schedule_bp.route('/api/schedule/week/<int:week_id>', methods=['GET'])
def get_schedule_by_week(week_id):
    try:
        print(f"Getting schedule for week_id: {week_id}")
        schedules = Schedule.query.filter_by(week_id=week_id).all()
        schedule_json = [schedule.to_json() for schedule in schedules]
        print(f"Found schedules: {schedule_json}")
        return jsonify(schedule_json)
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

@schedule_bp.route('/api/schedule/today', methods=['GET'])
def get_today_schedule():
    today = datetime.now()
    day_of_week = today.isoweekday()  # 1 for Monday, 7 for Sunday
    
    # Находим текущую неделю
    current_week = Week.query.filter(
        Week.start_date <= today,
        Week.end_date >= today,
        Week.is_template == False
    ).first()
    
    if not current_week:
        return jsonify([])
    
    # Получаем расписание на сегодня
    schedule = Schedule.query.filter(
        Schedule.week_id == current_week.id,
        Schedule.day_of_week == day_of_week
    ).order_by(Schedule.start_time).all()
    
    return jsonify([{
        'id': item.id,
        'start_time': item.start_time,
        'direction_name': item.direction.name,
        'trainer_name': item.trainer.user.name,
        'capacity': item.capacity,
        'spots_left': item.spots_left
    } for item in schedule])

@schedule_bp.route('/api/schedule/current-week', methods=['GET'])
def get_current_week():
    try:
        today = datetime.now().date()
        week_offset = request.args.get('offset', default=0, type=int)
        
        # Находим неделю, которая содержит текущую дату
        current_week = Week.query.filter(
            Week.start_date <= today,
            Week.end_date >= today
        ).first()
        
        if not current_week:
            return jsonify({'error': 'Не найдена текущая неделя'}), 404
            
        # Если есть смещение, находим соответствующую неделю
        if week_offset != 0:
            # Получаем все недели, отсортированные по дате начала
            weeks = Week.query.order_by(Week.start_date).all()
            current_index = weeks.index(current_week)
            target_index = current_index + week_offset
            
            if 0 <= target_index < len(weeks):
                current_week = weeks[target_index]
            else:
                return jsonify({'error': 'Неделя не найдена'}), 404
            
        return jsonify({
            'id': current_week.id,
            'start_date': current_week.start_date.strftime('%Y-%m-%d'),
            'end_date': current_week.end_date.strftime('%Y-%m-%d')
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@schedule_bp.route('/api/schedule/upcoming', methods=['GET'])
def get_upcoming_schedule():
    try:
        trainer_id = request.args.get('trainer_id', type=int)
        if not trainer_id:
            return jsonify({'error': 'Не указан trainer_id'}), 400

        # Получаем текущую дату и время
        now = datetime.now()
        current_weekday = now.isoweekday()  # 1 = Понедельник, 7 = Воскресенье
        current_time = now.time()

        # Находим текущую неделю
        current_week = Week.query.filter(
            Week.start_date <= now.date(),
            Week.end_date >= now.date()
        ).first()

        if not current_week:
            return jsonify({'error': 'Не найдена текущая неделя'}), 404

        # Получаем расписание для текущей недели
        schedule = Schedule.query.filter(
            Schedule.week_id == current_week.id,
            Schedule.trainer_id == trainer_id
        ).all()

        # Фильтруем только предстоящие тренировки
        upcoming = []
        for lesson in schedule:
            # Если день недели больше текущего - тренировка впереди
            if lesson.day_of_week > current_weekday:
                upcoming.append(lesson)
            # Если это текущий день, проверяем время
            elif lesson.day_of_week == current_weekday:
                lesson_time = lesson.start_time if isinstance(lesson.start_time, time) else time(hour=int(lesson.start_time))
                if lesson_time > current_time:
                    upcoming.append(lesson)

        return jsonify([lesson.to_json() for lesson in upcoming])

    except Exception as e:
        print(f"Error getting upcoming schedule: {str(e)}")
        return jsonify({'error': str(e)}), 500 