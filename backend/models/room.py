from .. import db

class Room(db.Model):
    __tablename__ = 'rooms'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)  # Название зала
    capacity = db.Column(db.Integer, nullable=False)  # Максимальная вместимость
    description = db.Column(db.Text)  # Описание зала (опционально)
    
    # Используем back_populates вместо backref
    schedules = db.relationship('Schedule', back_populates='room', lazy=True)

    def to_json(self):
        return {
            'id': self.id,
            'name': self.name,
            'capacity': self.capacity
        } 