from flask import Flask, request, jsonify
import yfinance as yf
from datetime import datetime, timedelta
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/item-shop")
def route_item_shop():
    pass


@app.route('/stock', methods=['GET'])
def get_stock_data():
    ticker = request.args.get('ticker')
    if not ticker:
        return jsonify({"error": "Ticker symbol is required"}), 400

    end_date = datetime.today()

    stock = yf.Ticker(ticker)
    stock_info = stock.info
    hist = stock.history(period="8d", interval="1m")

    historical_data = [
            {"open": row["Open"], "high": row["High"], "low": row["Low"], "close": row["Close"]}
            for _, row in hist.iterrows()
    ]

    return jsonify({
        "symbol": stock_info.get("symbol", ticker),
        "name": stock_info.get("shortName", "N/A"),
        "current_price": stock_info.get("currentPrice", "N/A"),
        "market_cap": stock_info.get("marketCap", "N/A"),
        "52_week_high": stock_info.get("fiftyTwoWeekHigh", "N/A"),
        "52_week_low": stock_info.get("fiftyTwoWeekLow", "N/A"),
        "historical_data": historical_data
        })


if (__name__ == "__main__"):
    app.run(host="0.0.0.0", port=5000, debug=True)
