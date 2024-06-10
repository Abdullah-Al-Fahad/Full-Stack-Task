from flask import Flask, jsonify
from flask_cors import CORS 
import json

app = Flask(__name__)
CORS(app) 

JSON_FILE = 'C:/Users/Abdullah Al Fahad/Downloads/Task/stock-market-app/backend/data.json'

@app.route('/api/data')
def get_data():
    with open(JSON_FILE) as f:
        data = json.load(f)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
