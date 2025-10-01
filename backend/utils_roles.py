# utils_roles.py (archivo nuevo para la lógica de roles)
from functools import wraps
from flask import request, jsonify
from models import Actor, db

def role_required(required_role):
    """
    Decorador que verifica que el actor que invoca el endpoint
    tenga el rol adecuado.
    Se espera que en el body JSON llegue "actor_id".
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            data = request.get_json() or {}
            actor_id = data.get('actor_id')
            if not actor_id:
                return jsonify({"error": "Se requiere actor_id para esta acción"}), 400

            actor = Actor.query.get(actor_id)
            if not actor:
                return jsonify({"error": "Actor no encontrado"}), 404

            if actor.role != required_role:
                return jsonify({"error": f"Rol '{actor.role}' no tiene acceso a esta acción"}), 403

            # Si el rol coincide, continuamos
            return f(*args, **kwargs)
        return wrapper
    return decorator
