# routes_actors.py (podrías crear un nuevo archivo de rutas o incluirlo en routes.py)

from flask import Blueprint, request, jsonify
from models import db, Actor

actors_blueprint = Blueprint('actors', __name__)

@actors_blueprint.route('/actors', methods=['POST'])
def create_actor():
    data = request.get_json()
    name = data.get('name')
    role = data.get('role')  # 'beneficiary', 'psp_beneficiary', 'psp_payer', 'payer'

    if not name or not role:
        return jsonify({"error": "Faltan campos requeridos: name, role"}), 400

    # Validar que el role sea uno de los cuatro permitidos:
    valid_roles = ['beneficiary', 'psp_beneficiary', 'psp_payer', 'payer']
    if role not in valid_roles:
        return jsonify({"error": f"Rol '{role}' no válido"}), 400

    actor = Actor(name=name, role=role)
    db.session.add(actor)
    db.session.commit()

    return jsonify({"message": "Actor creado", "id": actor.id, "role": actor.role}), 201
