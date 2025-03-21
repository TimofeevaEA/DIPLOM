from .. import db
class Directions(db.Model):
    __tablename__ = 'directions'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=True)
    photo = db.Column(db.String(200), nullable=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)

    def __init__(self, name, description, photo, category_id):
        self.name = name
        self.description = description
        self.photo = photo
        self.category_id = category_id

    def to_json(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'photo': self.photo,
            'category_id': self.category_id
        }

