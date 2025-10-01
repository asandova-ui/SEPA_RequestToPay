from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Actor(db.Model):
    __tablename__ = 'actor'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True)
    password = db.Column(db.String(50))
    name = db.Column(db.String(50), nullable=False)
    role = db.Column(db.String(20), nullable=False)

    photo_url = db.Column(db.String(200), nullable=True)  # URL o base64
    iban = db.Column(db.String(34), nullable=True)
    balance = db.Column(db.Float, default=0.0)

    # Campo nuevo: psp_id, que referencia a otro Actor que es PSP
    psp_id = db.Column(db.Integer, db.ForeignKey('actor.id'), nullable=True)
    # Relación para que se pueda acceder con actor.psp
    psp = db.relationship('Actor', remote_side=[id])

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "name": self.name,
            "role": self.role,
            "photo_url": self.photo_url,
            "iban": self.iban,
            "balance": self.balance,
            "psp_id": self.psp_id  # Podríamos incluir más info del psp, etc.
        }

class RTP(db.Model):
    __tablename__ = 'rtp'
    id = db.Column(db.Integer, primary_key=True)
    iban = db.Column(db.String(34), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default="creado")
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())
    beneficiary_id = db.Column(db.Integer)
    psp_beneficiary_id = db.Column(db.Integer)
    psp_payer_id = db.Column(db.Integer)
    payer_id = db.Column(db.Integer)

    def to_dict(self):
        return {
            "id": self.id,
            "iban": self.iban,
            "amount": self.amount,
            "status": self.status,
            "timestamp": self.timestamp.isoformat(),
            "beneficiary_id": self.beneficiary_id,
            "psp_beneficiary_id": self.psp_beneficiary_id,
            "psp_payer_id": self.psp_payer_id,
            "payer_id": self.payer_id
        }

class Log(db.Model):
    __tablename__ = 'log'
    id = db.Column(db.Integer, primary_key=True)
    rtp_id = db.Column(db.Integer, nullable=False)
    old_status = db.Column(db.String(20))
    new_status = db.Column(db.String(20))
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())
    hash_value = db.Column(db.String(64))

    def to_dict(self):
        return {
            "id": self.id,
            "rtp_id": self.rtp_id,
            "old_status": self.old_status,
            "new_status": self.new_status,
            "timestamp": self.timestamp.isoformat(),
            "hash_value": self.hash_value
        }
