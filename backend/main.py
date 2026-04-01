from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from backend.core.config import settings
from backend.database.database import engine, Base, get_db, SessionLocal
from backend.database.models import TrafficLog, LoginAttempt, ProtectedRoute
from backend.database import crud
from backend.services.proxy import forward_request
from backend.services.ai_engine import ai_classifier
from backend.services.scanner import run_actual_scan

# Create DB Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        print("Training AI model on available traffic logs...")
        ai_classifier.train_model(db)
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- DASHBOARD API ENDPOINTS ----

@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    total_req = db.query(TrafficLog).count()
    total_blocked = db.query(TrafficLog).filter(TrafficLog.blocked == True).count()
    total_anomalies = db.query(TrafficLog).filter(TrafficLog.is_anomaly == True).count()
    
    return {
        "total_requests": total_req,
        "total_blocked": total_blocked,
        "total_anomalies": total_anomalies,
        "block_rate": f"{(total_blocked / max(total_req, 1)) * 100:.2f}%"
    }

@app.get("/api/logs")
def get_logs(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return crud.get_traffic_logs(db, skip=skip, limit=limit)

@app.get("/api/blocked_ips")
def get_blocked_ips(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return crud.get_blocked_ips(db, skip=skip, limit=limit)

@app.post("/api/scan")
def run_vulnerability_scan(db: Session = Depends(get_db)):
    # Run the functional vulnerability scanner
    return run_actual_scan(db)

@app.get("/api/login_attempts")
def get_login_attempts(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(LoginAttempt).order_by(LoginAttempt.id.desc()).offset(skip).limit(limit).all()

@app.get("/api/protected_routes")
def list_protected_routes(db: Session = Depends(get_db)):
    return db.query(ProtectedRoute).all()

@app.post("/api/protected_routes")
def add_protected_route(path: str, db: Session = Depends(get_db)):
    route = ProtectedRoute(path=path)
    db.add(route)
    db.commit()
    db.refresh(route)
    return route

# ---- REVERSE PROXY CATCH-ALL ----
# Matches any path not matched above

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
async def reverse_proxy(request: Request, path: str, db: Session = Depends(get_db)):
    # Verify if IP is blocked at global level
    client_ip = request.client.host if request.client else "unknown"
    if client_ip != "unknown" and crud.is_ip_blocked(db, client_ip):
        from fastapi import Response
        return Response(content="WAF: IP is permanently banned.", status_code=403)
        
    return await forward_request(request, db, path)
