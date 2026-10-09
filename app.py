
import os
import requests
from flask import Flask, request, jsonify, render_template_string
from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1)

WEBHOOK_URL = os.environ.get("DISCORD_WEBHOOK_URL", "")

HTML = """
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>RD | Red Dev</title>
<style>
body {
  background:#101014;color:white;font-family:Arial;
  display:grid;place-items:center;min-height:100vh;margin:0
}
.card {
  background:#20202a;border-radius:18px;padding:28px;
  text-align:center;width:85%;max-width:400px
}
h1 {color:#ff4242}
p {line-height:1.8}
button {
  border:0;border-radius:8px;padding:13px 28px;
  margin:8px;background:#ff4242;color:white;
  font-weight:bold;font-size:16px;cursor:pointer
}
#consent,#site {display:none}
</style>
</head>
<body>
<div class="card">
  <h1>RD | RED DEV</h1>
  <div id="start">
    <p>أهلًا بيك في موقع RD</p>
    <button onclick="showConsent()">SIGN</button>
  </div>
  <div id="consent">
    <p>قم بالموافقة إذا تريد الدخول.</p>
    <p>بالضغط على ACCEPT، توافق على إرسال عنوان IP
    الخاص بك لمسؤول الموقع عبر Discord لأغراض الأمان.</p>
    <button id="accept" onclick="acceptConsent()">ACCEPT</button>
    <p id="status"></p>
  </div>
  <div id="site">
    <h2>أهلًا بيك!</h2>
    <p>أنت الآن داخل موقع RD.</p>
  </div>
</div>
<script>
function showConsent() {
  document.getElementById("start").style.display="none";
  document.getElementById("consent").style.display="block";
}
async function acceptConsent() {
  const b=document.getElementById("accept");
  const s=document.getElementById("status");
  b.disabled=true;
  s.textContent="جاري الدخول...";
  try {
    const r=await fetch("/consent",{method:"POST"});
    if(!r.ok) throw new Error();
    document.getElementById("consent").style.display="none";
    document.getElementById("site").style.display="block";
  } catch(e) {
    s.textContent="حصل خطأ. راجع إعدادات Render وحاول مرة أخرى.";
    b.disabled=false;
  }
}
</script>
</body>
</html>
"""

@app.get("/")
def home():
    return render_template_string(HTML)

@app.post("/consent")
def consent():
    if not WEBHOOK_URL:
        return jsonify({"error": "Webhook not configured"}), 500

    ip = request.remote_addr or "غير متاح"

    try:
        r = requests.post(
            WEBHOOK_URL,
            json={"content": f"موافقة جديدة في موقع RD\nIP: `{ip}`"},
            timeout=10
        )
        r.raise_for_status()
    except requests.RequestException:
        app.logger.exception("Webhook failed")
        return jsonify({"error": "Webhook failed"}), 502

    return jsonify({"success": True})

if __name__ == "__main__":
    app.run(host="0.0.0.0",
            port=int(os.environ.get("PORT", 10000)))
