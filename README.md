📦 Invent-O-Predict
<p align="center">
















</p>
🔮 AI-Powered Inventory Stockout Prediction & Smart Reminder System

Intelligent Inventory Forecasting | Automated Alerts | AI Insights

Invent-O-Predict is a production-ready full-stack Machine Learning web application that predicts:

📉 Product stockout dates

📦 Overstock risks

🔔 Automated reminder alerts

🤖 AI-powered inventory insights

Deployed live on Render 🚀

🚀 Live Demo

🔗 Backend API: https://deployed-inventopredict.onrender.com

🔗 Frontend: (Add your frontend link here)

🧠 Key Features
📊 Stockout Prediction (Machine Learning)

Upload Excel inventory data

Predicts upcoming stockouts using trained ML model

Product-level risk classification

Uses Scikit-Learn + XGBoost

🔔 Automated Reminder System

Email alerts:

2 days before stockout

1 day before stockout

On stockout day

Implemented using APScheduler + SMTP

🤖 AI Chatbot (Google Gemini API)

Context-aware inventory assistant

Explains prediction insights

Helps decision-making

🔐 Authentication System

Secure user registration & login

Password hashing using Werkzeug

Protected API routes

📝 Contact & Feedback System

Stores user queries

Saves customer feedback in database

🏗️ Tech Stack
Layer	Technology
Frontend	React.js, Vite, Tailwind CSS
Backend	Flask, Flask-SQLAlchemy, Gunicorn
ML	Scikit-Learn, XGBoost, Pandas, NumPy
AI	Google Gemini API
Database	SQLite (Dev), PostgreSQL (Prod)
Deployment	Render

⚙️ System Architecture
User Uploads Data
        ↓
Data Preprocessing
        ↓
ML Prediction Engine
        ↓
Risk Classification
        ↓
Database Storage
        ↓
Dashboard + Email Alerts + AI Chatbot