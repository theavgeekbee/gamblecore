from flask import Flask

app = Flask()

@app.route("/item-shop")
def route_item_shop():
    

if (__name__ == "__main__"):
    app.run(host="localhost", port=5000, debug=True)
