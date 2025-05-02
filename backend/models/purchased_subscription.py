from .. import db
from datetime import datetime, timedelta

class PurchasedSubscription(db.Model):
    __tablename__ = 'purchased_subscriptions'
    
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    subscription_id = db.Column(db.Integer, db.ForeignKey('subscriptions.id'), nullable=False)
    purchase_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    remaining_sessions = db.Column(db.Integer, nullable=False)

    # Добавляем связь с моделью Subscription
    subscription = db.relationship('Subscription', backref='purchased_subscriptions')

    def __init__(self, client_id, subscription_id, remaining_sessions, purchase_date=None):
        self.client_id = client_id
        self.subscription_id = subscription_id
        self.remaining_sessions = remaining_sessions
        self.purchase_date = purchase_date or datetime.utcnow()

    def calculate_remaining_days(self):
        if not self.subscription:
            return 0
        expiration_date = self.purchase_date + timedelta(days=self.subscription.day_count)
        remaining_days = (expiration_date - datetime.utcnow()).days
        return max(0, remaining_days)

    def to_json(self):
        return {
            'id': self.id,
            'client_id': self.client_id,
            'subscription_id': self.subscription_id,
            'purchase_date': self.purchase_date.isoformat(),
            'remaining_sessions': self.remaining_sessions,
            'remaining_days': self.calculate_remaining_days(),
            'subscription_name': self.subscription.name if self.subscription else None
        } 