from flask import Flask, jsonify, request
from flask_cors import CORS
from pony.orm import *

app = Flask(__name__)
CORS(app)

db = Database()
db.bind(provider='sqlite', filename='database.sqlite', create_db=True)

class Pice(db.Entity):
    id = PrimaryKey(int, auto=True)
    naziv = Required(str)
    kategorija = Required(str)
    cijena = Required(float)
    kolicina = Required(int)
    minimalna_kolicina = Required(int)

db.generate_mapping(create_tables=True)

@app.route('/api/drinks', methods=['GET'])
@db_session
def get_drinks():
    drinks = select(p for p in Pice)[:]
    return jsonify([{
        'id': p.id,
        'naziv': p.naziv,
        'kategorija': p.kategorija,
        'cijena': p.cijena,
        'kolicina': p.kolicina,
        'minimalna_kolicina': p.minimalna_kolicina
    } for p in drinks])

@app.route('/api/drinks', methods=['POST'])
@db_session
def add_drink():
    data = request.get_json()
    p = Pice(
        naziv=data['naziv'],
        kategorija=data['kategorija'],
        cijena=float(data['cijena']),
        kolicina=int(data['kolicina']),
        minimalna_kolicina=int(data['minimalna_kolicina'])
    )
    commit()
    return jsonify({'id': p.id}), 201

@app.route('/api/drinks/<int:id>', methods=['DELETE'])
@db_session
def delete_drink(id):
    Pice[id].delete()
    commit()
    return jsonify({'status': 'deleted'})

@app.route('/api/drinks/<int:id>', methods=['PUT'])
@db_session
def update_drink(id):
    data = request.get_json()
    pice = Pice.get(id=id)
    if not pice:
        return jsonify({'error': 'Piće nije pronađeno'}), 404

    pice.naziv = data['naziv']
    pice.kategorija = data['kategorija']
    pice.cijena = float(data['cijena'])
    pice.kolicina = int(data['kolicina'])
    pice.minimalna_kolicina = int(data['minimalna_kolicina'])
    commit()
    return jsonify({'status': 'updated'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
