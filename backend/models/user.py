from .. import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    phone = db.Column(db.String(15), nullable=False, unique=True)
    password = db.Column(db.String(100), nullable=False)
    birth_date = db.Column(db.Date, nullable=False)
    role = db.Column(db.String(100), nullable=False)

    def __init__(self, name, email, phone, password, birth_date, role):
        self.name = name
        self.email = email
        self.phone = phone
        self.password = password
        self.birth_date = birth_date
        self.role = role

    def to_json(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'birth_date': str(self.birth_date),
            'role': self.role
        }
