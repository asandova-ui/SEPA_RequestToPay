import hashlib
from models import Log

def cambiar_estado_rtp(db, rtp_obj, new_status):
    old_status = rtp_obj.status
    rtp_obj.status = new_status
    db.session.commit()

    # Generar un hash
    hash_input = f"{rtp_obj.id}{rtp_obj.iban}{rtp_obj.amount}{old_status}{new_status}".encode('utf-8')
    hash_value = hashlib.sha256(hash_input).hexdigest()

    nuevo_log = Log(
        rtp_id=rtp_obj.id,
        old_status=old_status,
        new_status=new_status,
        hash_value=hash_value
    )
    db.session.add(nuevo_log)
    db.session.commit()

    return {
        "message": f"RTP {rtp_obj.id} actualizado de {old_status} a {new_status}"
    }

def rechazar_rtp(db, rtp_obj, motivo):
    return cambiar_estado_rtp(db, rtp_obj, "rechazado")

import string

def validar_iban(iban: str) -> bool:
    """
    Valida un IBAN (ISO 13616) usando el algoritmo de
    “módulo 97 = 1”.

    Parámetros
    ----------
    iban : str
        IBAN en cualquier formato (con o sin espacios).

    Retorna
    -------
    bool
        True si el IBAN es sintácticamente correcto, False en caso contrario.
    """
    if not iban:
        return False

    # 1) Limpiar y normalizar
    iban = iban.replace(" ", "").upper()
    if len(iban) < 15 or len(iban) > 34 or not iban.isalnum():
        return False

    # 2) Reorganizar: los cuatro primeros caracteres al final
    rearranged = iban[4:] + iban[:4]

    # 3) Convertir letras a números (A=10, B=11, …, Z=35)
    digits = []
    for ch in rearranged:
        if ch.isdigit():
            digits.append(ch)
        elif ch.isalpha():
            digits.append(str(10 + string.ascii_uppercase.index(ch)))
        else:
            return False
    numeric_iban = int("".join(digits))

    # 4) Comprobar resto
    return numeric_iban % 97 == 1

