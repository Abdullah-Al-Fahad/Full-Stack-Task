from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# the SQLite database, relative to the app instance folder
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///stocks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Model
class Stock(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(10), nullable=False)
    trade_code = db.Column(db.String(10), nullable=False)
    high = db.Column(db.Float, nullable=False)
    low = db.Column(db.Float, nullable=False)
    open = db.Column(db.Float, nullable=False)
    close = db.Column(db.Float, nullable=False)
    volume = db.Column(db.Integer, nullable=False)

# Routes
@app.route('/api/stocks', methods=['GET'])
def get_stocks():
    stocks = Stock.query.all()
    output = []
    for stock in stocks:
        stock_data = {
            'id': stock.id,
            'date': stock.date,
            'trade_code': stock.trade_code,
            'high': stock.high,
            'low': stock.low,
            'open': stock.open,
            'close': stock.close,
            'volume': stock.volume
        }
        output.append(stock_data)
    return jsonify(output)

@app.route('/api/stocks', methods=['POST'])
def add_stock():
    stock_data = request.get_json()
    new_stock = Stock(
        date=stock_data['date'],
        trade_code=stock_data['trade_code'],
        high=stock_data['high'],
        low=stock_data['low'],
        open=stock_data['open'],
        close=stock_data['close'],
        volume=stock_data['volume']
    )
    db.session.add(new_stock)
    db.session.commit()
    return jsonify({'message': 'Stock added successfully'})

@app.route('/api/stocks/<int:id>', methods=['PUT'])
def update_stock(id):
    stock = Stock.query.get_or_404(id)
    stock_data = request.get_json()
    app.logger.info('Received data for updating stock: %s', stock_data)  # Add this line to log the received data
    stock.date = stock_data['date']
    stock.trade_code = stock_data['trade_code']
    stock.high = stock_data['high']
    stock.low = stock_data['low']
    stock.open = stock_data['open']
    stock.close = stock_data['close']
    stock.volume = stock_data['volume']
    db.session.commit()
    return jsonify({'message': 'Stock updated successfully'})


@app.route('/api/stocks/<int:id>', methods=['DELETE'])
def delete_stock(id):
    stock = Stock.query.get_or_404(id)
    db.session.delete(stock)
    db.session.commit()
    return jsonify({'message': 'Stock deleted successfully'})

if __name__ == '__main__':
    app.run(debug=True)
