from .. import db

class Subscription(db.Model):
    __tablename__ = 'subscriptions'
    
    id = db.Column(db.Integer, primary_key=True)
    session_count = db.Column(db.Integer, nullable=False)
    day_count = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    discounted_price = db.Column(db.Float, nullable=False)
    name = db.Column(db.String(255), nullable=False)

    def __init__(self, session_count, day_count, price, discounted_price, name):
        self.session_count = session_count
        self.day_count = day_count
        self.price = price
        self.discounted_price = discounted_price
        self.name = name

    def to_json(self):
        return {
            'id': self.id,
            'session_count': self.session_count,
            'day_count': self.day_count,
            'price': self.price,
            'discounted_price': self.discounted_price,
            'name': self.name
        }

