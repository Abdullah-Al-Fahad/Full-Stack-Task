from backend import app, db, Stock
import json

def create_database():
    with app.app_context():
        db.create_all()

def populate_db():
    try:
        
        with open('data.json', 'r') as file:
            data = json.load(file)

       
        with app.app_context():
            for item in data:
           
                for key in ['high', 'low', 'open', 'close', 'volume']:
                    if key in item:
                        item[key] = item[key].replace(',', '')

                
                date = item.get('date')
                trade_code = item.get('trade_code')
                high = float(item.get('high'))
                low = float(item.get('low'))
                open_val = float(item.get('open'))
                close = float(item.get('close'))
                volume = int(item.get('volume'))

                
                stock = Stock(date=date, trade_code=trade_code, high=high, low=low, open=open_val, close=close, volume=volume)
                db.session.add(stock)

            
            db.session.commit()
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == '__main__':
    create_database()
    populate_db()
