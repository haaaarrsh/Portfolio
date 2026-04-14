"""
Portfolio Backend Server
========================
- Serves the static portfolio site
- Stores contact messages in SQLite database
- Sends email notifications to harshrathaur0762@gmail.com
- Dashboard at http://localhost:3000/messages
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from datetime import datetime

app = Flask(__name__, static_folder='.')
CORS(app)

# ─── Config ────────────────────────────────────────────────
DB_FILE          = 'messages.db'
GMAIL_USER       = 'harshrathaur0762@gmail.com'
# Generate App Password at:
# Google Account → Security → 2-Step Verification → App passwords
GMAIL_APP_PASSWORD = 'ulwp htfe iwhm sooj'
# ────────────────────────────────────────────────────────────


def init_db():
    """Create the messages table if it doesn't exist."""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT    NOT NULL,
            email      TEXT    NOT NULL,
            message    TEXT    NOT NULL,
            timestamp  TEXT    NOT NULL,
            sent_email INTEGER DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()


def save_message(name, email, message):
    """Save a contact message to the database."""
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


def send_email(name, sender_email, message):
    """Send an HTML email notification via Gmail SMTP."""
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'📬 New Portfolio Message from {name}'
        msg['From']    = GMAIL_USER
        msg['To']      = GMAIL_USER

        plain = f"New message from {name} ({sender_email}):\n\n{message}"

        html = f"""
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#0d1022;font-family:'Segoe UI',Arial,sans-serif;">
          <div style="max-width:600px;margin:40px auto;background:#13172a;border-radius:16px;
                      border:1px solid rgba(139,92,246,0.3);overflow:hidden;
                      box-shadow:0 8px 32px rgba(0,0,0,0.4);">
            <div style="background:linear-gradient(135deg,#8b5cf6,#06b6d4);padding:28px 32px;">
              <h2 style="margin:0;color:#fff;font-size:22px;">📬 New Portfolio Message</h2>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">
                Someone reached out through your portfolio contact form
              </p>
            </div>
            <div style="padding:28px 32px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:10px 0;color:#94a3b8;font-size:13px;width:80px;">From</td>
                  <td style="padding:10px 0;color:#f1f5f9;font-weight:600;">{name}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;color:#94a3b8;font-size:13px;">Email</td>
                  <td style="padding:10px 0;">
                    <a href="mailto:{sender_email}" style="color:#a78bfa;text-decoration:none;">
                      {sender_email}
                    </a>
                  </td>
                </tr>
              </table>
              <div style="margin-top:20px;">
                <p style="color:#94a3b8;font-size:13px;margin-bottom:10px;">Message</p>
                <div style="background:#0d1022;border-left:3px solid #8b5cf6;
                            padding:16px 20px;border-radius:8px;color:#f1f5f9;
                            line-height:1.7;font-size:15px;">
                  {message}
                </div>
              </div>
            </div>
            <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.07);
                        color:#475569;font-size:12px;text-align:center;">
              Sent from Harsh Raj's Portfolio • {datetime.now().strftime('%d %b %Y, %I:%M %p')}
            </div>
          </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(plain, 'plain'))
        msg.attach(MIMEText(html, 'html'))

        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.send_message(msg)

        print(f"  [*] Email sent for message from {name}")
        return True

    except Exception as e:
        print(f"  [!]  Email error: {e}")
        return False


# ─── API Routes ─────────────────────────────────────────────

@app.route('/api/contact', methods=['POST'])
def contact():
    """Receive contact form submission, save to DB, send email."""
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'Invalid JSON'}), 400

    name    = data.get('name', '').strip()
    email   = data.get('email', '').strip()
    message = data.get('message', '').strip()

    if not name or not email or not message:
        return jsonify({'success': False, 'error': 'All fields are required'}), 400

    # 1. Save to database
    msg_id = save_message(name, email, message)
    print(f"  [*] Saved message #{msg_id} from {name} ({email})")

    # 2. Send email notification
    email_sent = send_email(name, email, message)

    # 3. Update email sent flag
    conn = sqlite3.connect(DB_FILE)
    conn.execute('UPDATE messages SET sent_email = ? WHERE id = ?',
                 (1 if email_sent else 0, msg_id))
    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'message': 'Message received!',
        'id': msg_id,
        'email_sent': email_sent
    })


@app.route('/messages')
def view_messages():
    """Admin dashboard to view all messages."""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    rows = conn.execute('SELECT * FROM messages ORDER BY timestamp DESC').fetchall()
    conn.close()
    msgs = [dict(r) for r in rows]

    rows_html = ''
    for m in msgs:
        badge = (
            '<span style="background:#14532d;color:#4ade80;padding:3px 10px;'
            'border-radius:20px;font-size:12px;">✓ Sent</span>'
            if m['sent_email'] else
            '<span style="background:#450a0a;color:#f87171;padding:3px 10px;'
            'border-radius:20px;font-size:12px;">✗ Failed</span>'
        )
        rows_html += f"""
        <tr>
          <td>#{m['id']}</td>
          <td>{m['name']}</td>
          <td><a href="mailto:{m['email']}" style="color:#a78bfa;">{m['email']}</a></td>
          <td>{m['message']}</td>
          <td style="color:#64748b;font-size:12px;white-space:nowrap;">{m['timestamp']}</td>
          <td>{badge}</td>
        </tr>"""

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Portfolio Messages</title>
  <style>
    *{{box-sizing:border-box;margin:0;padding:0}}
    body{{font-family:'Segoe UI',Arial,sans-serif;background:#060811;color:#f1f5f9;padding:2rem}}
    h1{{color:#a78bfa;margin-bottom:.5rem}}
    p.sub{{color:#64748b;margin-bottom:2rem;font-size:14px}}
    table{{width:100%;border-collapse:collapse;background:#0d1022;border-radius:12px;overflow:hidden}}
    th{{background:#1e1b4b;color:#a78bfa;padding:14px 16px;text-align:left;font-size:13px;
        letter-spacing:.05em;text-transform:uppercase}}
    td{{padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.05);
        font-size:14px;vertical-align:top;max-width:280px}}
    tr:last-child td{{border-bottom:none}}
    tr:hover td{{background:rgba(139,92,246,0.05)}}
  </style>
</head>
<body>
  <h1>📬 Portfolio Messages</h1>
  <p class="sub">Total: {len(msgs)} message(s) received</p>
  <table>
    <tr>
      <th>ID</th><th>Name</th><th>Email</th>
      <th>Message</th><th>Time</th><th>Email</th>
    </tr>
    {rows_html if rows_html else '<tr><td colspan="6" style="text-align:center;color:#475569;padding:40px">No messages yet</td></tr>'}
  </table>
</body>
</html>"""


# ─── Static File Serving ────────────────────────────────────

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    """Serve the static portfolio files."""
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')


# ─── Start ──────────────────────────────────────────────────

if __name__ == '__main__':
    init_db()
    print("\n[*] Portfolio server running at  http://localhost:3000")
    print("[*] Messages dashboard at       http://localhost:3000/messages\n")
    app.run(host='0.0.0.0', port=3000, debug=False)
