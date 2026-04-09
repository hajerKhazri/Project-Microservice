import pandas as pd
import json

file_path = r'C:\Users\dali\Desktop\Freelance Platform Projects.csv'
try:
    df = pd.read_csv(file_path, nrows=5)
    info = {
        "columns": df.columns.tolist(),
        "sample_rows": df.head(5).to_dict(orient='records')
    }
    with open('csv_info.json', 'w') as f:
        json.dump(info, f, indent=4)
    print("Successfully extracted CSV info to csv_info.json")
except Exception as e:
    print(f"Error: {e}")
