from flask import Flask, request, jsonify, g
from flask_cors import CORS
from auth import require_auth, require_role
from database import Database
import os

app = Flask(__name__)
CORS(app)

# Inizializzazione database
# i valori vengono letti dalle variabili d'ambiente (fallback ai default locali)
db = Database(
    host=os.getenv('DB_HOST', 'mysql-1b94f8f1-iisgalvanimi-9fad.b.aivencloud.com'),
    user=os.getenv('DB_USER', 'avnadmin'),
    password=os.getenv('DB_PASS', 'AVNS_-ztvhHD8WceEzyo2TAI'),
    database=os.getenv('DB_NAME', 'defaultdb'),
    port=int(os.getenv('DB_PORT', '15180')),
    ssl_mode=os.getenv('DB_SSL_MODE'),  # es. "REQUIRED"
)

# Crea le tabelle all'avvio
db.create_tables()



# ---------- ENDPOINT REGISTRO ELETTRONICO ----------

@app.route("/voti", methods=["GET"])
@require_auth
@require_role("docente")
def get_all_voti():
    """Docente: ottiene tutti i voti di tutti gli studenti"""
    try:
        voti = db.get_all_voti()
        return jsonify({"voti": voti}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/voti/studente", methods=["GET"])
@require_auth
def get_voti_studente():
    """Studente: ottiene i propri voti"""
    try:
        username = g.user.get("preferred_username")
        voti = db.get_voti_studente(username)
        return jsonify({"voti": voti}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/voti", methods=["POST"])
@require_auth
@require_role("docente")
def insert_voto():
    """Docente: inserisce un voto per uno studente"""
    try:
        data = request.get_json()
        
        # Validazione campi
        username_studente = data.get("username_studente", "").strip()
        nome_studente = data.get("nome_studente", "").strip()
        materia = data.get("materia", "").strip()
        voto = data.get("voto")
        
        if not all([username_studente, nome_studente, materia, voto is not None]):
            return jsonify({"error": "Campi mancanti"}), 400
        
        if not isinstance(voto, (int, float)) or voto < 0 or voto > 10:
            return jsonify({"error": "Voto deve essere tra 0 e 10"}), 400
        
        username_docente = g.user.get("preferred_username")
        
        voto_inserito = db.insert_voto(
            username_studente=username_studente,
            nome_studente=nome_studente,
            materia=materia,
            voto=int(voto),
            username_docente=username_docente
        )
        
        return jsonify({"message": "Voto inserito", "voto": voto_inserito}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/voti/<int:voto_id>", methods=["DELETE"])
@require_auth
@require_role("docente")
def delete_voto(voto_id):
    """Docente: elimina un voto"""
    try:
        if db.delete_voto(voto_id):
            return '', 204
        return jsonify({"error": "Voto non trovato"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)