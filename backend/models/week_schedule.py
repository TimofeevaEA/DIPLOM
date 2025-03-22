from .. import db
from enum import Enum
from .directions import Directions
from .trainer import Trainer
from .room import Room

class DayOfWeek(Enum):
    MONDAY = 1
    TUESDAY = 2
    WEDNESDAY = 3
    THURSDAY = 4
    FRIDAY = 5
    SATURDAY = 6
    SUNDAY = 7

class Week(db.Model):
    __tablename__ = 'weeks'
    
    id = db.Column(db.Integer, primary_key=True)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    is_template = db.Column(db.Boolean, default=False)
    
    schedules = db.relationship('Schedule', backref='week', lazy=True)

    def to_json(self):
        return {
            'id': self.id,
            'start_date': str(self.start_date),
            'end_date': str(self.end_date),
            'is_template': self.is_template
        }

class Schedule(db.Model):
    __tablename__ = 'schedule'
    
    id = db.Column(db.Integer, primary_key=True)
    week_id = db.Column(db.Integer, db.ForeignKey('weeks.id'), nullable=False)
    day_of_week = db.Column(db.Integer, nullable=False)  # 1-7 для дней недели
    start_time = db.Column(db.Integer, nullable=False)   # 8-21 для часов
    direction_id = db.Column(db.Integer, db.ForeignKey('directions.id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'), nullable=False)
    trainer_id = db.Column(db.Integer, db.ForeignKey('trainers.id'), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)

    direction = db.relationship('Directions')
    trainer = db.relationship('Trainer')
    room = db.relationship('Room')

    def to_json(self):
        return {
            'id': self.id,
            'week_id': self.week_id,
            'day_of_week': self.day_of_week,  # просто число
            'start_time': self.start_time,    # просто число
            'direction_id': self.direction_id,
            'room_id': self.room_id,
            'trainer_id': self.trainer_id,
            'capacity': self.capacity,
            'direction_name': self.direction.name if self.direction else None,
            'trainer_name': self.trainer.user.name if self.trainer and self.trainer.user else None,
            'available_spots': self.capacity
        }