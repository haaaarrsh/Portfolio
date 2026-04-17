"""
Portfolio Backend Server (FINAL FIXED)
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import sqlite3
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from datetime import datetime

load_dotenv()

app = Flask(__name__, static_folder='.', static_url_path='')

CORS(app)

# ─── Config ─────────────────────────────────
GMAIL_USER         = os.getenv('GMAIL_USER')
GMAIL_APP_PASSWORD = os.getenv('GMAIL_APP_PASSWORD')
DB_FILE            = os.getenv('DB_FILE', 'messages.db')
PORT               = int(os.getenv('PORT', 3000))


# ─── Database ───────────────────────────────
def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            message TEXT,
            timestamp TEXT,
            sent_email INTEGER DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()


def save_message(name, email, message):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    c.execute(
        'INSERT INTO messages (name, email, message, timestamp) VALUES (?, ?, ?, ?)',
        (name, email, message, timestamp)
    )
    msg_id = c.lastrowid
    conn.commit()
    conn.close()
    return msg_id


# ─── Email ──────────────────────────────────
def send_email(name, sender_email, message):
    try:
        msg = MIMEMultipart()
        msg['Subject'] = f'New Message from {name}'
        msg['From'] = GMAIL_USER
        msg['To'] = GMAIL_USER

        body = f"{name} ({sender_email})\n\n{message}"
        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.send_message(msg)

        print(f"[✓] Email sent for {name}")
        return True

    except Exception as e:
        print("[!] Email error:", e)
        return False


# ─── API ROUTES (TOP PRIORITY) ──────────────
@app.route('/api/contact', methods=['POST', 'OPTIONS'])
def contact():

    # ✅ Handle preflight
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json(silent=True)

    if not data:
        return jsonify({'success': False, 'error': 'Invalid JSON'}), 400

    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    message = data.get('message', '').strip()

    if not name or not email or not message:
        return jsonify({'success': False, 'error': 'All fields required'}), 400

    msg_id = save_message(name, email, message)
    email_sent = send_email(name, email, message)

    return jsonify({
        'success': True,
        'id': msg_id,
        'email_sent': email_sent
    })

# ─── MESSAGES DASHBOARD ─────────────────────
@app.route('/messages')
def view_messages():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    rows = conn.execute('SELECT * FROM messages ORDER BY id DESC').fetchall()
    conn.close()

    msgs = [dict(r) for r in rows]

    html = "<h1>📬 Messages</h1><hr>"
    for m in msgs:
        html += f"""
        <p>
        <b>{m['name']}</b> ({m['email']})<br>
        {m['message']}<br>
        <small>{m['timestamp']}</small>
        </p><hr>
        """

    return html


# ─── STATIC FILES (SAFE) ────────────────────
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):

    # 🚫 NEVER override API or messages
    if path.startswith('api/') or path == 'messages':
        return jsonify({'error': 'Not found'}), 404

    # Serve file if exists
    if path != "" and os.path.exists(path):
        return send_from_directory('.', path)

    # Default → index.html
    return send_from_directory('.', 'index.html')


# ─── RUN ────────────────────────────────────
if __name__ == '__main__':
    init_db()
    print(f"\nRunning at http://localhost:{PORT}")
    print(f"Messages at http://localhost:{PORT}/messages\n")
    app.run(host='0.0.0.0', port=PORT)