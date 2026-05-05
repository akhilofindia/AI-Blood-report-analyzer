# AI Blood Report Analyzer

## Git Link
**Repository**: [https://github.com/akhilofindia/AI-Blood-report-analyzer.git](https://github.com/akhilofindia/AI-Blood-report-analyzer.git)

## Software Used
This project is built using a modern tech stack bridging web technologies with machine learning:
- **Frontend**: React.js with Vite for fast bundling, styled using Tailwind CSS.
- **Backend**: Node.js and Express.js orchestrating API calls and child processes.
- **Machine Learning**: Python (v3.9+), utilizing `pandas` for data manipulation, `numpy` for arrays, and `scikit-learn` for the core hematology predictive model.
- **Package Management**: npm or bun for Node modules, and pip for Python dependencies.
- **Database**: MongoDB (via Mongoose) to securely store generated reports.

## How to Use

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` directory.
2. Install Node dependencies: `npm install`
3. Install Python dependencies: `pip install pandas scikit-learn numpy`
4. Start the backend server: `node server.js`
   *(The backend will run at `http://localhost:5000`)*

### 2. Frontend Setup
1. Open a new terminal window and navigate to the `frontend` directory.
2. Install UI dependencies: `npm install`
3. Start the Vite development server: `npm run dev`
   *(The frontend will run at `http://localhost:8080`)*

### 3. Usage Steps
1. Navigate to the web application URL.
2. Enter the CBC (Complete Blood Count) values from a physical blood report into the form fields.
3. Click **Analyze Report**.
4. View the **AI Interpretation** and **Hematological Profile** on the generated results page.

## Code Structure Highlights

### Backend API (`server.js` snippet)
The Node.js server receives the data from the frontend and hands it over to the Python ML script via a child process:
```javascript
app.post('/analyze', (req, res) => {
    const data = req.body;
    // ... Data processing ...
    const pythonProcess = spawn('python', [path.join(__dirname, 'predict.py')]);

    pythonProcess.stdin.write(JSON.stringify(processedData));
    pythonProcess.stdin.end();

    let result = '';
    pythonProcess.stdout.on('data', (data) => { result += data.toString(); });

    pythonProcess.on('close', (code) => {
        const parsedResult = JSON.parse(result);
        res.json(parsedResult);
    });
});
```

### Machine Learning Engine (`predict.py` snippet)
The Python script loads a pre-trained scikit-learn model, parses the incoming JSON data from Node, and makes a prediction:
```python
import sys
import json
import pickle
import pandas as pd

def predict():
    # Load model
    with open('backend/hematology_model.pkl', 'rb') as f:
        data = pickle.load(f)
        model = data[0] if isinstance(data, tuple) else data
    
    # Read input from stdin
    input_data = sys.stdin.read()
    request_data = json.loads(input_data)
    
    # Predict and Output
    df = pd.DataFrame([list(request_data.values())])
    prediction = model.predict(df)
    
    print(json.dumps({"status": "success", "prediction": str(prediction[0])}))

if __name__ == "__main__":
    predict()
```
