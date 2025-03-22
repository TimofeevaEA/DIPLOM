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