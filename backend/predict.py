import sys
import json
import pickle
import pandas as pd
import numpy as np
import os

# Set working directory to project root if needed
# os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def predict():
    try:
        # Load the model data
        model_path = 'backend/hematology_model.pkl'
        if not os.path.exists(model_path):
             model_path = 'hematology_model.pkl' # Fallback for different execution contexts

        with open(model_path, 'rb') as f:
            data = pickle.load(f)
        
        # Determine if it's a tuple (model, encoder, features) or just a model
        if isinstance(data, tuple):
            model = data[0]
            encoder = data[1]
            feature_names = data[2] if len(data) > 2 else ['Gender', 'Age', 'Hb', 'RBC', 'WBC', 'PLATELETS', 'LYMP', 'MONO', 'HCT', 'MCV', 'MCH', 'MCHC', 'RDW', 'PDW', 'MPV', 'PCT']
        else:
            model = data
            encoder = None
            feature_names = ['Gender', 'Age', 'Hb', 'RBC', 'WBC', 'PLATELETS', 'LYMP', 'MONO', 'HCT', 'MCV', 'MCH', 'MCHC', 'RDW', 'PDW', 'MPV', 'PCT']
        
        # Read input from stdin
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"status": "error", "message": "No input data provided"}))
            return

        request_data = json.loads(input_data)
        
        # Map input data to features expected by the model
        # The key names in request_data match the frontend BloodReportForm names
        mapping = {
            'Gender': 'gender',
            'Age': 'age',
            'Hb': 'hemoglobin',
            'RBC': 'rbcCount',
            'WBC': 'wbcCount',
            'PLATELETS': 'platelets',
            'LYMP': 'lymphocytes',
            'MONO': 'monocytes',
            'HCT': 'hct',
            'MCV': 'mcv',
            'MCH': 'mch',
            'MCHC': 'mchc',
            'RDW': 'rdw',
            'PDW': 'pdw',
            'MPV': 'mpv',
            'PCT': 'pct'
        }
        
        features_list = []
        for feat in feature_names:
            key = mapping.get(feat, feat.lower())
            val = request_data.get(key, 0)
            features_list.append(val)
        
        # Convert to DataFrame
        df = pd.DataFrame([features_list], columns=feature_names)
        
        # Make prediction
        prediction = model.predict(df)
        
        # Decode prediction if encoder exists
        final_result = str(prediction[0])
        if encoder is not None:
            try:
                final_result = str(encoder.inverse_transform(prediction)[0])
            except:
                pass
        
        print(json.dumps({"status": "success", "prediction": final_result}))
        
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))

if __name__ == "__main__":
    predict()
