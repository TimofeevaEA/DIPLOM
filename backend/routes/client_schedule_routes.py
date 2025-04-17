from flask import Blueprint, jsonify, request
from ..models.week_schedule import Schedule
from ..models.client_schedule import ClientSchedule
from ..models.subscriptions import Subscription
from .. import db

client_schedule_bp = Blueprint('client_schedule', __name__)

# Получить всех клиентов на конкретной тренировке
@client_schedule_bp.route('/api/schedule/<int:schedule_id>/clients', methods=['GET'])
def get_booked_clients(schedule_id):
    try:
        bookings = ClientSchedule.query.filter_by(schedule_id=schedule_id).all()
        
        return jsonify([{
            'id': booking.id,
            'client_id': booking.client_id,
            'client_name': booking.client.name,  # Получаем имя через связь
            'phone': booking.client.phone,       # Получаем телефон через связь
            'status': booking.status
        } for booking in bookings])
        
    except Exception as e:
        print("Error fetching booked clients:", str(e))  # Отладочный вывод
        return jsonify({'error': str(e)}), 400

# Записать клиента на тренировку
@client_schedule_bp.route('/api/schedule/<int:schedule_id>/book', methods=['POST'])
def book_client(schedule_id):
    try:
        data = request.get_json()
        schedule = Schedule.query.get_or_404(schedule_id)
        
        # Проверяем, не закончилась ли тренировка
        if schedule.is_completed:
            return jsonify({'error': 'Тренировка уже проведена'}), 400
            
        # Проверяем наличие свободных мест
        if schedule.spots_left <= 0:
            return jsonify({'error': 'Нет свободных мест'}), 400

        # Проверяем, не записан ли уже клиент
        existing = ClientSchedule.query.filter_by(
            client_id=data['client_id'],
            schedule_id=schedule_id
        ).first()
        
        if existing:
            return jsonify({'error': 'Клиент уже записан'}), 400

        # Создаем запись и уменьшаем количество свободных мест
        booking = ClientSchedule(
            client_id=data['client_id'],
            schedule_id=schedule_id,
            status='Записан'
        )
        
        schedule.spots_left -= 1  # Уменьшаем количество свободных мест
        
        db.session.add(booking)
        db.session.commit()

        return jsonify({
            'id': booking.id,
            'client_id': booking.client_id,
            'client_name': booking.client.name,
            'status': booking.status,
            'spots_left': schedule.spots_left  # Возвращаем обновленное количество мест
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# Обновить статус клиента на тренировке
@client_schedule_bp.route('/api/client-schedule/<int:booking_id>/status', methods=['PUT'])
def update_booking_status(booking_id):
    try:
        print("Updating status for booking:", booking_id)  # Отладочный вывод
        data = request.get_json()
        print("Received data:", data)  # Отладочный вывод
        
        booking = ClientSchedule.query.get_or_404(booking_id)
        
        if 'status' not in data:
            return jsonify({'error': 'Status is required'}), 400
            
        # Проверяем валидность статуса
        valid_statuses = ['Записан', 'Посетил', 'Пропустил', 'Отменил']
        if data['status'] not in valid_statuses:
            return jsonify({'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400

        booking.status = data['status']
        db.session.commit()

        return jsonify({
            'id': booking.id,
            'client_id': booking.client_id,
            'client_name': booking.client.name,
            'status': booking.status
        })

    except Exception as e:
        print("Error updating status:", str(e))  # Отладочный вывод
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# Удалить запись клиента с тренировки
@client_schedule_bp.route('/api/client-schedule/<int:booking_id>', methods=['DELETE'])
def delete_booking(booking_id):
    try:
        booking = ClientSchedule.query.get_or_404(booking_id)
        schedule = Schedule.query.get(booking.schedule_id)
        
        if schedule.is_completed:
            return jsonify({'error': 'Нельзя отменить запись на проведенную тренировку'}), 400
            
        schedule.spots_left += 1  # Увеличиваем количество свободных мест при отмене записи
        
        db.session.delete(booking)
        db.session.commit()
        
        return jsonify({
            'message': 'Запись удалена',
            'spots_left': schedule.spots_left
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@client_schedule_bp.route('/api/schedule/<int:schedule_id>/complete', methods=['PUT'])
def complete_training(schedule_id):
    try:
        schedule = Schedule.query.get_or_404(schedule_id)
        schedule.is_completed = True
        
        # Обновляем статусы клиентов
        bookings = ClientSchedule.query.filter_by(schedule_id=schedule_id).all()
        for booking in bookings:
            if booking.status == 'Записан':
                booking.status = 'Пропустил'
        
        db.session.commit()
        return jsonify({'message': 'Тренировка проведена'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# Получить историю тренировок клиента
@client_schedule_bp.route('/api/users/<int:client_id>/training-history', methods=['GET'])
def get_client_training_history(client_id):
    try:
        # Получаем параметры пагинации
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int) # По умолчанию 10 записей на страницу
        
        # Получаем записи со статусами 'Посетил' и 'Пропустил'
        query = ClientSchedule.query.filter(
            ClientSchedule.client_id == client_id,
            ClientSchedule.status.in_(['Посетил', 'Пропустил'])
        ).order_by(ClientSchedule.id.desc()) # сортировка от новых к старым
        
        # Применяем пагинацию
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        bookings = pagination.items
        
        result = []
        for booking in bookings:
            schedule = booking.schedule
            if not schedule:
                continue
            
            # Получаем данные о тренере
            trainer_name = "Не указан"
            if schedule.trainer and schedule.trainer.user:
                trainer_name = schedule.trainer.user.name
            
            # Получаем данные о направлении
            direction_name = "Не указано"
            if schedule.direction:
                direction_name = schedule.direction.name
            
            # Получаем точную дату тренировки
            training_date = None
            if schedule.week and hasattr(schedule.week, 'start_date'):
                from datetime import datetime, timedelta
                start_date = schedule.week.start_date
                if isinstance(start_date, str):
                    start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                training_date = start_date + timedelta(days=schedule.day_of_week - 1)
                training_date = training_date.strftime('%Y-%m-%d')
            
            # Формируем полную информацию о тренировке
            booking_data = {
                'id': booking.id,
                'status': booking.status,
                'direction_name': direction_name,
                'trainer_name': trainer_name,
                'day_of_week': schedule.day_of_week,
                'start_time': schedule.start_time,
                'week_id': schedule.week_id,
                'training_date': training_date
            }
            result.append(booking_data)
        
        # Возвращаем данные с информацией о пагинации
        return jsonify({
            'items': result,
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page,
            'per_page': per_page,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev,
            'next_page': page + 1 if pagination.has_next else None,
            'prev_page': page - 1 if pagination.has_prev else None
        })
    except Exception as e:
        print(f"Error fetching training history: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Добавляем новый маршрут для получения архива тренировок
@client_schedule_bp.route('/api/users/<int:client_id>/training-archive', methods=['GET'])
def get_training_archive(client_id):
    try:
        # Получаем записи со статусами "Посетил" и "Пропустил"
        bookings = ClientSchedule.query.filter(
            ClientSchedule.client_id == client_id,
            ClientSchedule.status.in_(['Посетил', 'Пропустил'])
        ).all()
        
        # Формируем список с данными о тренировках
        result = []
        for booking in bookings:
            schedule = booking.schedule
            if schedule:
                # Безопасное получение имени тренера
                trainer_name = "Не указан"
                try:
                    if schedule.trainer:
                        # Проверим все возможные поля имени
                        if hasattr(schedule.trainer, 'name'):
                            trainer_name = schedule.trainer.name
                        elif hasattr(schedule.trainer, 'full_name'):
                            trainer_name = schedule.trainer.full_name
                        elif hasattr(schedule.trainer, 'firstname'):
                            trainer_name = schedule.trainer.firstname
                except Exception as trainer_error:
                    print(f"Error getting trainer name: {str(trainer_error)}")
                
                # Безопасное получение названия направления
                direction_name = "Не указано"
                try:
                    if schedule.direction and hasattr(schedule.direction, 'name'):
                        direction_name = schedule.direction.name
                except Exception as direction_error:
                    print(f"Error getting direction name: {str(direction_error)}")
                
                booking_data = {
                    'id': booking.id,
                    'status': booking.status,
                    'schedule_id': booking.schedule_id,
                    'direction_name': direction_name,
                    'trainer_name': trainer_name,
                    'day_of_week': schedule.day_of_week,
                    'start_time': schedule.start_time,
                    'week_id': schedule.week_id
                }
                result.append(booking_data)
        
        return jsonify(result)
    except Exception as e:
        print(f"Error fetching training archive: {str(e)}")
        return jsonify({'error': str(e)}), 500

@client_schedule_bp.route('/api/users/<int:client_id>/training-statistics', methods=['GET'])
def get_client_training_statistics(client_id):
    try:
        # Получаем все бронирования пользователя
        all_bookings = ClientSchedule.query.filter_by(client_id=client_id).all()
        
        # Считаем статистику
        total = len(all_bookings)
        attended = sum(1 for b in all_bookings if b.status == 'Посетил')
        missed = sum(1 for b in all_bookings if b.status == 'Пропустил')
        upcoming = sum(1 for b in all_bookings if b.status == 'Записан')
        
        # Группируем посещения по направлениям
        directions = {}
        for booking in all_bookings:
            if booking.schedule and booking.schedule.direction:
                direction_name = booking.schedule.direction.name
                if direction_name not in directions:
                    directions[direction_name] = {'total': 0, 'attended': 0, 'missed': 0}
                
                directions[direction_name]['total'] += 1
                if booking.status == 'Посетил':
                    directions[direction_name]['attended'] += 1
                elif booking.status == 'Пропустил':
                    directions[direction_name]['missed'] += 1
        
        return jsonify({
            'total_bookings': total,
            'attended': attended,
            'missed': missed,
            'upcoming': upcoming,
            'directions': directions
        })
    
    except Exception as e:
        print(f"Error fetching training statistics: {str(e)}")
        return jsonify({'error': str(e)}), 500 