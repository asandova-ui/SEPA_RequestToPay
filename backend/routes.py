from flask import Blueprint, request, jsonify
from services import (
    crear_rtp_service,
    validar_beneficiario_service,
    enrutar_rtp_service,
    validar_payer_service,
    decision_payer_service
)
from utils_roles import role_required
from models import Actor, db
from flask import request

rtp_blueprint = Blueprint('rtp', __name__)

# 1. Creación del RTP
@rtp_blueprint.route('/rtp', methods=['POST'])
@role_required('beneficiary')
def crear_rtp():
    data = request.get_json()
    # ID del beneficiario que está logueado
    beneficiary_id = data.get('actor_id')
    # El IBAN del pagador
    payer_iban = data.get('payer_iban')
    # Monto
    amount = data.get('amount')

    if not payer_iban:
        return jsonify({"error": "Falta iban"}), 400
    
    if not amount:
        return jsonify({"error": "Falta amount"}), 400

    # Llamamos a la lógica de creación en services
    result = crear_rtp_service(data)
    status = 201 if "error" not in result else 400
    return jsonify(result), status

# 2. Validación Beneficiario
@rtp_blueprint.route('/rtp/<int:rtp_id>/validate-beneficiary', methods=['POST'])
@role_required('psp_beneficiary')
def validar_beneficiario(rtp_id):
    result = validar_beneficiario_service(rtp_id)
    status = 200 if "error" not in result else 400
    return jsonify(result), status

# 3. Enrutar al PSP del pagador
@rtp_blueprint.route('/rtp/<int:rtp_id>/route', methods=['POST'])
@role_required('psp_beneficiary')
def enrutar_rtp(rtp_id):
    result = enrutar_rtp_service(rtp_id)
    status = 200 if "error" not in result else 400
    return jsonify(result), status

# 4. Validación del Payer
@rtp_blueprint.route('/rtp/<int:rtp_id>/validate-payer', methods=['POST'])
@role_required('psp_payer')
def validar_payer(rtp_id):
    result = validar_payer_service(rtp_id)
    status = 200 if "error" not in result else 400
    return jsonify(result), status

# 5. Decisión final
@rtp_blueprint.route('/rtp/<int:rtp_id>/decision', methods=['POST'])
@role_required('payer')
def decision_payer(rtp_id):
    data = request.get_json()
    result = decision_payer_service(rtp_id, data)
    status = 200 if "error" not in result else 400
    return jsonify(result), status

# Ver logs
@rtp_blueprint.route('/logs', methods=['GET'])
def obtener_logs():
    from models import Log
    logs = Log.query.all()
    result = [log.to_dict() for log in logs]
    return jsonify(result)

# Crear Actor
@rtp_blueprint.route('/actors', methods=['POST'])
def create_actor():
    data = request.get_json()
    name = data.get('name')
    role = data.get('role')

    if not name or not role:
        return jsonify({"error": "Faltan campos requeridos: name, role"}), 400

    valid_roles = ['beneficiary', 'psp_beneficiary', 'psp_payer', 'payer']
    if role not in valid_roles:
        return jsonify({"error": f"Rol '{role}' no válido"}), 400

    actor = Actor(name=name, role=role)
    db.session.add(actor)
    db.session.commit()

    return jsonify({"message": "Actor creado", "id": actor.id, "role": actor.role}), 201


@rtp_blueprint.route('/actors_info/<int:actor_id>', methods=['GET'])
def get_actor_info(actor_id):
    from models import Actor
    actor = Actor.query.get(actor_id)
    if not actor:
        return jsonify({"error": "Actor no encontrado"}), 404
    return jsonify(actor.to_dict())


#auth_blueprint = Blueprint('auth', __name__)

@rtp_blueprint.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({"error": "Faltan credenciales"}), 400
    
    actor = Actor.query.filter_by(username=username).first()
    if not actor:
        return jsonify({"error": "Usuario no existe"}), 404
    
    if actor.password != password:
        return jsonify({"error": "Contraseña incorrecta"}), 401
    
    # Login exitoso
    return jsonify({
        "message": "Login correcto",
        "actor_id": actor.id,
        "role": actor.role,
        "name": actor.name
    })

@rtp_blueprint.route('/profile/<int:actor_id>', methods=['GET'])
def get_profile(actor_id):
    actor = Actor.query.get(actor_id)
    if not actor:
        return jsonify({"error": "Actor no encontrado"}), 404
    # Si quieres restringir a payer: verifícalo con su rol, etc.
    return jsonify(actor.to_dict()), 200


@rtp_blueprint.route('/profile', methods=['POST'])
@role_required('payer')
def update_profile():
    data = request.get_json() or {}
    actor_id = data.get('actor_id')
    actor = Actor.query.get(actor_id)
    if not actor:
        return jsonify({"error": "Actor no encontrado"}), 404

    # Campos opcionales
    new_photo = data.get('photo_url')
    new_iban = data.get('iban')
    new_balance = data.get('balance')

    if new_photo is not None:
        actor.photo_url = new_photo
    if new_iban is not None:
        actor.iban = new_iban
    if new_balance is not None:
        actor.balance = float(new_balance)

    db.session.commit()
    return jsonify({"message": "Perfil actualizado", "actor": actor.to_dict()})
