import os
import sys
import time
import random
from sqlalchemy.orm import Session

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database.database import SessionLocal, engine, Base
from backend.services.ai_engine import AIEngine
from backend.database.crud import create_traffic_log

# Ensure tables exist
Base.metadata.create_all(bind=engine)

ai = AIEngine()
db = SessionLocal()

print("Menghasilkan data simulasi lalu lintas web...")

payloads = [
    # Benign
    {"method": "GET", "path": "/home", "ip": "192.168.1.100", "payload": ""},
    {"method": "GET", "path": "/assets/style.css", "ip": "10.0.0.5", "payload": ""},
    {"method": "POST", "path": "/api/login", "ip": "172.16.0.4", "payload": "user=admin&pass=1234"},
    
    # SQLi
    {"method": "GET", "path": "/products", "ip": "45.22.11.3", "payload": "?id=1' OR 1=1--"},
    {"method": "POST", "path": "/api/users", "ip": "112.55.33.2", "payload": "username=admin' UNION SELECT * FROM users--"},
    
    # XSS
    {"method": "GET", "path": "/search", "ip": "8.8.4.4", "payload": "?q=<script>alert('XSS')</script>"},
]

for i in range(15):
    entry = random.choice(payloads)
    
    risk, is_anomaly, reason = ai.evaluate_request(entry["path"], entry["payload"], "")
    
    blocked = risk >= 0.7
    status = 403 if blocked else 200

    log_data = {
        "source_ip": entry["ip"] + str(random.randint(1, 100)),
        "method": entry["method"],
        "path": entry["path"],
        "query_params": entry["payload"] if entry["method"] == "GET" else "",
        "headers": "{'user-agent': 'Mozilla/5.0'}",
        "body_payload": entry["payload"] if entry["method"] == "POST" else "",
        "ai_risk_score": risk,
        "is_anomaly": is_anomaly,
        "blocked": blocked,
        "reason": reason,
        "status_code": status,
        "response_time_ms": random.uniform(10.0, 150.0)
    }
    
    create_traffic_log(db, log_data)
    print(f"Log tersimpan: {entry['path']} | Blocked: {blocked} | Score: {risk}")
    
db.close()
print("Simulasi selesai!")
