from .. import db
from datetime import datetime

class Article(db.Model):
    __tablename__ = 'articles'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)  # Добавляем CASCADE
    content = db.Column(db.Text, nullable=False)
    photo = db.Column(db.String(255))
    category = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Добавляем проверку на категорию
    __table_args__ = (
        db.CheckConstraint(category.in_(['sport', 'food', 'news']), name='check_category'),
    )

    author = db.relationship(
        'User', 
        backref=db.backref('articles', lazy=True, cascade='all, delete-orphan'),
        lazy='joined'  # Оптимизация загрузки
    )

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'author': {
                'id': self.author.id,
                'name': self.author.name,
                'email': self.author.email
            },
            'content': self.content,
            'photo': self.photo,
            'category': self.category,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }