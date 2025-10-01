from flask import Flask, send_from_directory
from ext_socketio import socketio, join_room
from config import Config
from models import db, Actor
import os
import webbrowser
from routes import rtp_blueprint

STATIC_FOLDER = os.path.join(os.path.dirname(__file__), '../frontend')
app = Flask(__name__, static_folder=STATIC_FOLDER)
app.config.from_object(Config)
db.init_app(app)

# Inicialización de SocketIO
socketio.init_app(app, cors_allowed_origins="*")

with app.app_context():
    db.drop_all()
    db.create_all()

    # Crear los 4 usuarios predefinidos:
    # 1) "Mercadona" => beneficiary
    # 2) "PSPMercadona" => psp_beneficiary
    # 3) "PSPalonso" => psp_payer
    # 4) "alonso" => payer
    # Contraseñas ficticias, p.ej. "1234"
    mercadona = Actor(
        username="e",
        password="1",
        name="Empresa",
        role="beneficiary",
        iban="ES26001234567890123456",
        balance=0.0
    )
    psp_merc = Actor(
        username="pm",
        password="1",
        name="PSP de empresa",
        role="psp_beneficiary"
    )
    psp_alonso = Actor(
        username="pa",
        password="1",
        name="PSP de Alonso",
        role="psp_payer"
    )
    alonso = Actor(
        username="a",
        password="1",
        name="Alonso",
        role="payer",
        iban="ES45098765432100000000",
        balance=1000.0
    )

    db.session.add_all([mercadona, psp_merc, psp_alonso, alonso])
    db.session.commit()

    # Ahora vinculamos:
    # - Mercadona -> PSPMercadona
    # - alonso -> PSPalonso
    mercadona.psp_id = psp_merc.id
    alonso.psp_id = psp_alonso.id
    db.session.commit()

# Servir index.html en la raíz
@app.route('/')
def home():
    return app.send_static_file('index.html')

# Servir archivos estáticos desde el directorio frontend
@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)

# Registrar el blueprint con todos los endpoints de RTP
app.register_blueprint(rtp_blueprint)

@socketio.on('join')
def handle_join(data):
    actor_id = data['actor_id']
    actor = Actor.query.get(actor_id)
    if actor:
        room = f"{actor.role}_{actor_id}"
        join_room(room)
        print(f"Actor {actor_id} se unió a la sala {room}")

if __name__ == '__main__':
    webbrowser.open("http://127.0.0.1:5000/")
    socketio.run(app, debug=True)
