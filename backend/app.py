from flask import Flask, request, jsonify, g
from flask_cors import CORS
from auth import require_auth, require_role

app = Flask(__name__)
CORS(app)

#lista condivisa tra tutti gli utenti
#niente db per ora (ve lo lascio come esercizio)
#se l'avete già fatto vedete voi come fare
shopping_list: list = []
counter: int = 1

@app.route("/items", methods=["GET"])
@require_auth
def get_items():
    #tutti gli utenti autenticati possono vedere la lista
    return jsonify({"items": shopping_list})

@app.route("/items", methods=["POST"])
@require_auth
@require_role("user_plus")  #solo user_plus può aggiungere
def add_item():
    global counter
    data = request.get_json()
    item = data.get("item", "").strip()
    if not item:
        return jsonify({"error": "Item non può essere vuoto"}), 400

    nuovo = {"id": counter, "nome": item}
    shopping_list.append(nuovo)
    counter += 1

    return jsonify({"message": "Aggiunto", "items": shopping_list}), 201

@app.route("/items/<int:item_id>", methods=["DELETE"])
@require_auth
@require_role("user_plus")  #solo user_plus può eliminare
def delete_item(item_id):
    for i, item in enumerate(shopping_list):
        if item["id"] == item_id:
            shopping_list.pop(i)
            return '', 204

    return jsonify({"error": "Elemento non trovato"}), 404

if __name__ == "__main__":
    app.run(debug=True)