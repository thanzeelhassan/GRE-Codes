import json

# specify your JSON file path
file_path = "../json_results_from_browser/institutions_and_fellowship_sponsors.json"

# Path to output file
output_file = "./countries.txt"

# Read the JSON file
with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Extract all countries
countries = [entry["Country"] for entry in data["institutions_and_fellowship_sponsors"]]

# Remove duplicates and sort alphabetically
countries = sorted(set(countries))

# Write to output file
with open(output_file, "w", encoding="utf-8") as f:
    for country in countries:
        f.write(country + "\n")

print(f"✅ Extracted {len(countries)} countries and saved to {output_file}")
