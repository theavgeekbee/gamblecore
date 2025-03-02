import requests
from datetime import datetime

# Define the URL of the endpoint
url = 'https://scrapyardsf.com/waltuh2/simulated-time'

# Define the datetime to be posted
simulated_time = datetime(2025, 2, 26, 14, 30, 0).isoformat()

# Create the payload
payload = {
    'simulated_time': simulated_time
}

# Send the POST request
response = requests.post(url, json=payload)

# Print the response
print(response.json())

requests.post("https://scrapyardsf.com/waltuh1/reset")

print("killed em all")
