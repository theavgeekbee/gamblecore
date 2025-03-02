import csv
import json

def csv_to_json_map(csv_file_path, output_json_path):
    """
    Extracts Symbol, Name, Sector, and Industry from a CSV file and converts it to a JSON map.
    
    Args:
        csv_file_path (str): Path to the input CSV file
        output_json_path (str): Path where the JSON file will be saved
    """
    # Initialize an empty dictionary to store the data
    json_map = {}
    
    # Open and read the CSV file
    with open(csv_file_path, 'r', encoding='utf-8') as csv_file:
        # Create a CSV reader
        csv_reader = csv.DictReader(csv_file)
        
        # Iterate through each row in the CSV
        for row in csv_reader:
            symbol = row.get('Symbol')
            
            # Skip rows without a symbol
            if not symbol:
                continue
            
            # Add the data to our JSON map
            json_map[symbol] = {
                "symbol": symbol,
                "name": row.get('Name', ''),
                "sector": row.get('Sector', ''),
                "industry": row.get('Industry', '')
            }
    
    # Write the JSON map to a file
    with open(output_json_path, 'w', encoding='utf-8') as json_file:
        json.dump(json_map, json_file, indent=2)
    
    print(f"Conversion complete. JSON map saved to {output_json_path}")
    return json_map

# Example usage
if __name__ == "__main__":
    input_csv = "nasdaq_screener_1740873790162.csv"
    output_json = "symbols_data.json"
    csv_to_json_map(input_csv, output_json)
