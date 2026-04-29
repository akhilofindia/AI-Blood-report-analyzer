# AI Blood Report Analyzer: Local Setup Guide

This project consists of a **React (Vite) Frontend** and a **Node.js (Express) Backend** that interfaces with a **Python Machine Learning Engine**.

Follow these steps to get the project running on your local machine.

## 📋 Prerequisites

Ensure you have the following installed:
- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)
- **npm** or **bun** (Package managers)

## 🚀 Setup Instructions

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install Python dependencies:
   ```bash
   pip install pandas scikit-learn
   ```
4. Start the backend server:
   ```bash
   node server.js
   ```
   *The backend will run at `http://localhost:5000`.*

### 2. Frontend Setup
1. Open a **new** terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will run at `http://localhost:8080`.*

## 📁 Project Structure
- **/frontend**: React + Vite + Tailwind CSS dashboard.
- **/backend**: Express server that orchestrates API calls.
- **/backend/predict.py**: Core ML inference script.
- **/backend/hematology_model.pkl**: Trained Scikit-learn model.

## 💡 Usage
1. Enter the CBC values from a blood report in the web interface.
2. Click **Analyze Report**.
3. View the **AI Interpretation** and **Hematological Profile** on the results page.

---
*For a full technical deep dive, see the generated documentation in `brain/`.*
