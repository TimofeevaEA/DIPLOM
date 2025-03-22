from .. import db

class Trainer(db.Model):
    __tablename__ = 'trainers'

    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.Text)
    photo = db.Column(db.String(255))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Добавляем связь с User
    user = db.relationship('User', backref='trainer')

    def __init__(self, description, photo, user_id):
        self.description = description
        self.photo = photo
        self.user_id = user_id

    def to_json(self):
        return {
            'id': self.id,
            'description': self.description,
            'photo': self.photo,
            'user_id': self.user_id,
            'name': self.user.name if self.user else None
        }
  

