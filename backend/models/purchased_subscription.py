from .. import db
from datetime import datetime

class PurchasedSubscription(db.Model):
    __tablename__ = 'purchased_subscriptions'
    
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    subscription_id = db.Column(db.Integer, db.ForeignKey('subscriptions.id'), nullable=False)
    purchase_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    remaining_sessions = db.Column(db.Integer, nullable=False)

    def __init__(self, client_id, subscription_id, remaining_sessions, purchase_date=None):
        self.client_id = client_id
        self.subscription_id = subscription_id
        self.remaining_sessions = remaining_sessions
        self.purchase_date = purchase_date or datetime.utcnow()

    def to_json(self):
        return {
            'id': self.id,
            'client_id': self.client_id,
            'subscription_id': self.subscription_id,
            'purchase_date': self.purchase_date.isoformat(),
            'remaining_sessions': self.remaining_sessions
        } 