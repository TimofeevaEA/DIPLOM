from enum import Enum
from .. import db

class WorkoutStatus(Enum):
    BOOKED = 'BOOKED'         # Забронировано
    ATTENDED = 'ATTENDED'      # Посетил
    CANCELLED = 'CANCELLED'    # Отменено
    NO_SHOW = 'NO_SHOW'       # Не явился

class ClientSchedule(db.Model):
    __tablename__ = 'client_schedule'
    
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    schedule_id = db.Column(db.Integer, db.ForeignKey('schedule.id'), nullable=False)
    status = db.Column(db.Enum(WorkoutStatus), default=WorkoutStatus.BOOKED)
    created_at = db.Column(db.DateTime, default=db.func.now())
    
    # Связи
    schedule = db.relationship('Schedule', backref='client_bookings')
    client = db.relationship('User', backref='schedule_bookings')

    def to_json(self):
        return {
            'id': self.id,
            'client_id': self.client_id,
            'schedule_id': self.schedule_id,
            'status': self.status.value,
            'created_at': str(self.created_at)
        }