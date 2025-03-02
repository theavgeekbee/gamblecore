from flask import Flask, request, jsonify
import yfinance as yf
from datetime import datetime, timedelta
from flask_cors import CORS
import os
import json

app = Flask(__name__)
CORS(app)

# Simulated start time
start_time = datetime(2025, 2, 26, 14, 42, 0)  # Example start time

# Directory for cached stock data
cache_dir = "stock_data/"
if not os.path.exists(cache_dir):
    os.makedirs(cache_dir)

def get_cached_stock_data(ticker):
    cache_file = os.path.join(cache_dir, f"{ticker}.json")
    if os.path.exists(cache_file):
        with open(cache_file, 'r') as f:
            return json.load(f)
    return None

def cache_stock_data(ticker, data):
    # Convert timestamps to strings
    for record in data['historical_data']:
        record['Datetime'] = record['Datetime'].isoformat()
    cache_file = os.path.join(cache_dir, f"{ticker}.json")
    with open(cache_file, 'w') as f:
        json.dump(data, f)

# Time rate multiplier
time_rate_multiplier = 1
last_update_time = datetime.now()

def calculate_simulated_time():
    global start_time, last_update_time, time_rate_multiplier
    current_time = datetime.now()
    real_time_passed = current_time - last_update_time
    simulated_current_time = start_time + real_time_passed * time_rate_multiplier
    return simulated_current_time

@app.route('/set-time-rate', methods=['POST'])
def set_time_rate():
    global time_rate_multiplier, last_update_time, start_time
    data = request.get_json()
    if 'multiplier' not in data:
        return jsonify({"error": "Multiplier is required"}), 400

    new_multiplier = data['multiplier']
    if not isinstance(new_multiplier, (int, float)) or new_multiplier <= 0:
        return jsonify({"error": "Multiplier must be a positive number"}), 400

    # Calculate the current simulated time before updating the multiplier
    current_time = datetime.now()
    real_time_passed = current_time - last_update_time
    simulated_current_time = start_time + real_time_passed * time_rate_multiplier

    # Update the start time to the current simulated time
    start_time = simulated_current_time

    # Update the multiplier and last update time
    time_rate_multiplier = new_multiplier
    last_update_time = current_time

    return jsonify({"message": "Time rate multiplier updated", "multiplier": time_rate_multiplier})

@app.route('/stock', methods=['GET'])
def get_stock_data():
    global last_update_time
    ticker = request.args.get('ticker')
    if not ticker:
        return jsonify({"error": "Ticker symbol is required"}), 400

    # Check cache
    cached_data = get_cached_stock_data(ticker)
    if cached_data:
        stock_info = cached_data['stock_info']
        hist = cached_data['historical_data']
        # Convert timestamps back to datetime objects
        for record in hist:
            record['Datetime'] = datetime.fromisoformat(record['Datetime']).replace(tzinfo=None)
    else:
        stock = yf.Ticker(ticker)
        stock_info = stock.info
        hist = stock.history(period="8d", interval="1m").reset_index().to_dict(orient='records')
        for record in hist:
            record['Datetime'] = record['Datetime'].replace(tzinfo=None)
        cache_stock_data(ticker, {"stock_info": stock_info, "historical_data": hist})

    # Calculate simulated current time
    simulated_current_time = calculate_simulated_time()

    # Update last update time
    #last_update_time = datetime.now()

    # Find the closest historical data point
    closest_data_point = min(hist, key=lambda x: abs(x['Datetime'] - simulated_current_time))

    # Filter out future data points
    filtered_hist = [
        record for record in hist if record['Datetime'] <= simulated_current_time
    ]

    return jsonify({
        "symbol": stock_info.get("symbol", ticker),
        "name": stock_info.get("shortName", "N/A"),
        "current_price": closest_data_point["Close"],
        "market_cap": stock_info.get("marketCap", "N/A"),
        "52_week_high": stock_info.get("fiftyTwoWeekHigh", "N/A"),
        "52_week_low": stock_info.get("fiftyTwoWeekLow", "N/A"),
        "historical_data": [
            {
                "open": record["Open"],
                "high": record["High"],
                "low": record["Low"],
                "close": record["Close"],
                "timestamp": int(record["Datetime"].timestamp())
            }
            for record in filtered_hist
        ]
    })

@app.route('/stock-info', methods=['GET'])
def get_stock_info():
    global last_update_time
    ticker = request.args.get('ticker')
    if not ticker:
        return jsonify({"error": "Ticker symbol is required"}), 400

    # Check cache
    cached_data = get_cached_stock_data(ticker)
    if cached_data:
        stock_info = cached_data['stock_info']
        hist = cached_data['historical_data']
        # Convert timestamps back to datetime objects
        for record in hist:
            record['Datetime'] = datetime.fromisoformat(record['Datetime']).replace(tzinfo=None)
    else:
        stock = yf.Ticker(ticker)
        stock_info = stock.info
        hist = stock.history(period="8d", interval="1m").reset_index().to_dict(orient='records')
        for record in hist:
            record['Datetime'] = record['Datetime'].replace(tzinfo=None)
        cache_stock_data(ticker, {"stock_info": stock_info, "historical_data": hist})

    # Calculate simulated current time
    simulated_current_time = calculate_simulated_time()

    # Update last update time
    #last_update_time = datetime.now()

    # Find the closest historical data point
    closest_data_point = min(hist, key=lambda x: abs(x['Datetime'] - simulated_current_time))

    print(closest_data_point)

    return jsonify({
        "symbol": stock_info.get("symbol", ticker),
        "name": stock_info.get("shortName", "N/A"),
        "current_price": closest_data_point["Close"],
        "market_cap": stock_info.get("marketCap", "N/A"),
        "52_week_high": stock_info.get("fiftyTwoWeekHigh", "N/A"),
        "52_week_low": stock_info.get("fiftyTwoWeekLow", "N/A"),
        "simulated_current_time": simulated_current_time.isoformat()
    })

@app.route('/simulated-time', methods=['GET', 'POST'])
def simulated_time():
    global start_time, last_update_time, time_rate_multiplier

    if request.method == 'GET':
        simulated_current_time = calculate_simulated_time()
        return jsonify({"simulated_current_time": simulated_current_time.isoformat()})

    if request.method == 'POST':
        data = request.get_json()
        if 'simulated_time' not in data:
            return jsonify({"error": "Simulated time is required"}), 400

        try:
            new_simulated_time = datetime.fromisoformat(data['simulated_time'])
        except ValueError:
            return jsonify({"error": "Invalid datetime format"}), 400

        # Update the start time and last update time
        current_time = datetime.now()
        real_time_passed = current_time - last_update_time
        start_time = new_simulated_time - real_time_passed * time_rate_multiplier
        last_update_time = current_time

        return jsonify({"message": "Simulated time updated", "simulated_current_time": new_simulated_time.isoformat()})

if (__name__ == "__main__"):
    app.run(host="0.0.0.0", port=5000, debug=True)
