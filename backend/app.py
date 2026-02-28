from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import os
import tempfile
import google.generativeai as genai
from model.predict import predict_stockout
import smtplib
from email.mime.text import MIMEText
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import date

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    print("⚠️ GEMINI_API_KEY not found")
else:
    genai.configure(api_key=API_KEY)


app = Flask(__name__)
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'instance/site.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    company_name = db.Column(db.String(150), nullable=False)
    company_code = db.Column(db.String(50), unique=True, nullable=False)

    warehouse_name = db.Column(db.String(150), nullable=False)
    warehouse_location = db.Column(db.String(200), nullable=False)
    warehouse_code = db.Column(db.String(50), unique=True, nullable=False)

    password = db.Column(db.String(200), nullable=False)


class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    message = db.Column(db.Text, nullable=False)

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    experience = db.Column(db.Text, nullable=False)


class StockoutReminder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False)
    product_name = db.Column(db.String(150), nullable=False)
    stockout_date = db.Column(db.Date, nullable=False)
    reminder_stage = db.Column(db.Integer, default=0)


with app.app_context():
    db.create_all()


# ---------------- Auth Routes ----------------
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    required_fields = [
        'company_name',
        'company_code',
        'warehouse_name',
        'warehouse_location',
        'warehouse_code',
        'password'
    ]

    for field in required_fields:
        if not data.get(field):
            return jsonify({"message": f"{field} is required"}), 400

    # Check if company code already exists
    if User.query.filter_by(company_code=data['company_code']).first():
        return jsonify({"message": "Company code already exists"}), 409

    hashed_password = generate_password_hash(data['password'])

    new_user = User(
        company_name=data['company_name'],
        company_code=data['company_code'],
        warehouse_name=data['warehouse_name'],
        warehouse_location=data['warehouse_location'],
        warehouse_code=data['warehouse_code'],
        password=hashed_password
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Registration successful"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    user = User.query.filter_by(warehouse_code=data.get('warehouse_code')).first()

    if not user or not check_password_hash(user.password, data.get('password')):
        return jsonify({"message": "Invalid company code or password"}), 401

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user.id,
            "company_name": user.company_name,
            "company_code": user.company_code,
            "warehouse_name": user.warehouse_name,
            "warehouse_location": user.warehouse_location
        }
    }), 200

from datetime import datetime

if __name__ == '__main__':
    app.run(debug=True)