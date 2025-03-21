from .. import db
from enum import Enum
from .client_schedule import ClientSchedule, WorkoutStatus
from .directions import Directions
from .trainer import Trainer

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
    
    # Связь с расписанием
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
    day_of_week = db.Column(db.Enum(DayOfWeek), nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    direction_id = db.Column(db.Integer, db.ForeignKey('directions.id'), nullable=False)
    room = db.Column(db.Integer, nullable=False)  # Меняем тип на Integer
    trainer_id = db.Column(db.Integer, db.ForeignKey('trainers.id'), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)  # количество мест

    # Добавим связи
    direction = db.relationship('Directions', backref='schedules')
    trainer = db.relationship('Trainer', backref='schedules')

    def get_booked_clients_count(self):
        """Получить количество записанных клиентов"""
        return ClientSchedule.query.filter_by(
            schedule_id=self.id,
            status=WorkoutStatus.BOOKED
        ).count()

    def has_available_spots(self):
        """Проверить наличие свободных мест"""
        return self.get_booked_clients_count() < self.capacity

    def to_json(self):
        return {
            'id': self.id,
            'week_id': self.week_id,
            'day_of_week': self.day_of_week.name,
            'start_time': str(self.start_time),
            'direction_id': self.direction_id,
            'room': self.room,
            'trainer_id': self.trainer_id,
            'capacity': self.capacity,
            'booked_count': self.get_booked_clients_count(),
            'available_spots': self.capacity - self.get_booked_clients_count(),
            'direction_name': self.direction.name if self.direction else None,
            'trainer_name': self.trainer.user.name if self.trainer and self.trainer.user else None
        }