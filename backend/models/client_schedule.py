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
    purchased_subscription_id = db.Column(db.Integer, db.ForeignKey('purchased_subscriptions.id'), nullable=False)
    status = db.Column(db.String(50), default='Записан')
    
    client = db.relationship('User')
    schedule = db.relationship('Schedule')
    purchased_subscription = db.relationship('PurchasedSubscription')

    def to_json(self):
        return {
            'id': self.id,
            'client_id': self.client_id,
            'schedule_id': self.schedule_id,
            'client_name': self.client.name if self.client else None,
            'phone': self.client.phone if self.client else None,
            'status': self.status,
            'remaining_sessions': self.purchased_subscription.remaining_sessions if self.purchased_subscription else 0
        }