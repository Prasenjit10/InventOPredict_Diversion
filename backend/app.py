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
# ---------------- API KEY ----------------
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    print("⚠️ GEMINI_API_KEY not found")
else:
    genai.configure(api_key=API_KEY)

# ---------------- App Config ----------------
app = Flask(__name__)
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'instance/site.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ---------------- Models ----------------
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


# ---------------- Create Tables ----------------
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

@app.route("/create-stockout-reminders", methods=["POST"])
def create_stockout_reminders():
    data = request.get_json()
    email = data.get("email")
    results = data.get("results", [])

    if not email or not results:
        return jsonify({"message": "Invalid data"}), 400
    saved_products = []
    for item in results:
        try:
            stockout_date = datetime.strptime(
                item["stockout_date"], "%Y-%m-%d"
            ).date()

            reminder = StockoutReminder(
                email=email,
                product_name=item["product_name"],
                stockout_date=stockout_date
            )
            db.session.add(reminder)
            saved_products.append(
                f"• {item['product_name']} (Stockout: {item['stockout_date']})"
            )
        except Exception:
            continue

    db.session.commit()
    # check_and_send_reminders()
    # 🔔 IMMEDIATE CONFIRMATION EMAIL
    product_list = "\n".join(saved_products)

    send_email(
        email,
        "Stockout Reminders Activated ✅",
        f"""
Hello,

Your stockout reminders have been successfully activated.

You will receive reminder emails:
• 2 days before stockout
• 1 day before stockout
• On the stockout day (9:00 AM)

Tracked products:
{product_list}

– InventOPredict Team
"""
    )
    return jsonify({"message": "Reminders created"}), 201



# ---------------- Contact Routes ----------------
@app.route('/Contact', methods=['POST'])
def add_contact():
    data = request.get_json()

    new_contact = Contact(
        name=data['name'],
        email=data['email'],
        message=data['message']
    )

    db.session.add(new_contact)
    db.session.commit()

    return jsonify({"message": "Contact saved!"}), 201


@app.route('/Contact', methods=['GET'])
def get_contacts():
    contacts = Contact.query.all()

    return jsonify([
        {
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "message": c.message
        }
        for c in contacts
    ])


# ---------------- Feedback Routes ----------------
@app.route('/Feedback', methods=['POST'])
def add_feedback():
    data = request.get_json()

    new_feedback = Feedback(
        name=data['name'],
        email=data['email'],
        phone=data['phone'],
        experience=data['experience']
    )

    db.session.add(new_feedback)
    db.session.commit()

    return jsonify({"message": "Feedback submitted!"}), 201


@app.route('/Feedback', methods=['GET'])
def get_feedback():
    feedbacks = Feedback.query.all()

    return jsonify([
        {
            "id": f.id,
            "name": f.name,
            "email": f.email,
            "phone": f.phone,
            "experience": f.experience
        }
        for f in feedbacks
    ])


# ---------------- Prediction Route ----------------
@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']

    with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp:
        file.save(tmp.name)
        tmp_path = tmp.name

    try:
        pred_df = predict_stockout(tmp_path)
        os.remove(tmp_path)

        return jsonify({
            "summary": "Stock prediction analysis completed.",
            "fields": pred_df.to_dict(orient="records")
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/test-email")
def test_email():
    send_email(
        "inventopredict@gmail.com",
        "Test Email",
        "If you received this, SMTP is working."
    )
    return "Email sent"

# ---------------- Chatbot Route ----------------
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message', '')
    context = data.get('context', '')

    try:
        model = genai.GenerativeModel("gemini-3-flash-preview")
        prompt = f"{context}\n\nUser: {message}\nAI:"
        response = model.generate_content(prompt)
        reply = response.text
    except Exception as e:
        print("Gemini error:", str(e))
        reply = "⚠️ Chat service temporarily unavailable. Please try again later."

    return jsonify({"reply": reply})

# @app.route('/chat', methods=['POST'])
# def chat():
#     data = request.get_json()
#     message = data.get('message', '')
#     context = data.get('context', '')

#     try:
#         model = genai.GenerativeModel("gemini-3-flash-preview")
#         prompt = f"{context}\n\nUser: {message}\nAI:"
#         response = model.generate_content(prompt)

#         reply = response.text if response and hasattr(response, "text") else (
#             "I couldn't generate a response right now."
#         )

#     except Exception as e:
#         # 🔒 SAFE fallback when quota / network / API error happens
#         print("Gemini error:", str(e))  # logs error in terminal
#         reply = (
#             "⚠️ Chat service is temporarily unavailable "
#             "due to usage limits. Please try again later."
#         )

#     return jsonify({"reply": reply})


def send_email(to_email, subject, body):
    print("📨 Attempting to send email...")
    print("To:", to_email)
    print("From:", os.getenv("EMAIL_USER"))

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = os.getenv("EMAIL_USER")
    msg["To"] = to_email

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(
                os.getenv("EMAIL_USER"),
                os.getenv("EMAIL_PASS")
            )
            server.send_message(msg)

        print("✅ Email sent successfully")

    except Exception as e:
        print("❌ Email failed:", str(e))

from datetime import date, timedelta
from collections import defaultdict

from collections import defaultdict
from datetime import date

def check_and_send_reminders():
    today = date.today()
    print("📅 Running reminder check for:", today)

    reminders = StockoutReminder.query.all()
    # print("🔔 Total reminders:", len(reminders))

    # 🔹 Group emails
    stage_stockout = defaultdict(list)
    stage_2_days = defaultdict(list)
    stage_1_day = defaultdict(list)
    stage_today = defaultdict(list)

    for r in reminders:
        days_left = (r.stockout_date - today).days

        if days_left == 2:
            stage_2_days[r.email].append(r)

        elif days_left == 1:
            stage_1_day[r.email].append(r)

        elif days_left == 0:
            stage_today[r.email].append(r)

        elif days_left < 0:
            stage_stockout[r.email].append(r)

    # 🔔 SEND 2-DAY MAILS
    for email, items in stage_2_days.items():
        product_list = "\n".join(f"• {r.product_name}" for r in items)

        send_email(
            email,
            "Upcoming Stockout Alert (2 Days Left)",
            f"""
Hello,

The following product(s) are expected to run out of stock in 2 days:

{product_list}

Please plan inventory accordingly.

– InventOPredict Team
"""
        )

        for r in items:
            r.reminder_stage = 1

    # 🔔 SEND 1-DAY MAILS
    for email, items in stage_1_day.items():
        product_list = "\n".join(f"• {r.product_name}" for r in items)

        send_email(
            email,
            "Stockout Alert (1 Day Left)",
            f"""
Hello,

The following product(s) are expected to run out of stock tomorrow:

{product_list}

Immediate action is recommended.

– InventOPredict Team
"""
        )

        for r in items:
            r.reminder_stage = 2

    # 🔔 SEND TODAY MAILS + DELETE
    for email, items in stage_today.items():
        product_list = "\n".join(f"• {r.product_name}" for r in items)

        send_email(
            email,
            "Stockout Alert (Today)",
            f"""
Hello,

The following product(s) are expected to run out of stock today:

{product_list}

Please take urgent action.

– InventOPredict Team
"""
        )

        for r in items:
            db.session.delete(r)

        # 🔔 SEND ALREADY STOCKOUT MAIL + DELETE
    for email, items in stage_stockout.items():
        product_list = "\n".join(f"• {r.product_name}" for r in items)

        send_email(
            email,
            "Already Stockout Alert",
            f"""
Hello,

The following product(s) are already out of stock :

{product_list}

Please take urgent action.

– InventOPredict Team
"""
        )

        for r in items:
            db.session.delete(r)
            
    db.session.commit()
    print("✅ Reminder cycle completed")


from apscheduler.schedulers.background import BackgroundScheduler

# scheduler = BackgroundScheduler(timezone="Asia/Kolkata")

# scheduler.add_job(
#     check_and_send_reminders,
#     trigger="cron",
#     hour=9,
#     minute=0
# )

# scheduler.start()




def clear_stockout_reminders():
    deleted = StockoutReminder.query.delete()
    db.session.commit()
    print(f"🧹 Cleared {deleted} stockout reminder(s)")



@app.route("/clear-reminders", methods=["GET"])
def clear_reminders_route():
    clear_stockout_reminders()
    return "Reminders cleared"
# http://127.0.0.1:5000/clear-reminders(clear the table)
# ---------------- Run App ----------------
if __name__ == '__main__':
    app.run(debug=True)