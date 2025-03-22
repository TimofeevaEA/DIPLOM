from flask import Blueprint, jsonify, request
from ..models.room import Room
from .. import db

rooms_bp = Blueprint('rooms', __name__)

@rooms_bp.route('/api/rooms', methods=['GET'])
def get_rooms():
    rooms = Room.query.all()
    return jsonify([{'id': room.id, 'name': room.name} for room in rooms])

@rooms_bp.route('/api/rooms', methods=['POST'])
def create_room():
    data = request.get_json()
    
    new_room = Room(
        name=data['name'],
        capacity=data['capacity']
    )
    
    db.session.add(new_room)
    db.session.commit()
    
    return jsonify(new_room.to_json()), 201 