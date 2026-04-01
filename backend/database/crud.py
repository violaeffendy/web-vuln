from sqlalchemy.orm import Session
from datetime import datetime

from backend.database.models import TrafficLog, BlockedIP, InterceptedRequest, Vulnerability, LoginAttempt, ProtectedRoute

def create_traffic_log(db: Session, log_data: dict):
    db_log = TrafficLog(**log_data)
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_traffic_logs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(TrafficLog).order_by(TrafficLog.id.desc()).offset(skip).limit(limit).all()

def get_all_traffic_logs_for_training(db: Session, limit: int = 5000):
    return db.query(TrafficLog).order_by(TrafficLog.id.desc()).limit(limit).all()

def block_ip(db: Session, ip_address: str, reason: str):
    existing = db.query(BlockedIP).filter(BlockedIP.ip_address == ip_address).first()
    if not existing:
        blocked = BlockedIP(ip_address=ip_address, reason=reason)
        db.add(blocked)
        db.commit()
        db.refresh(blocked)
        return blocked
    return existing

def is_ip_blocked(db: Session, ip_address: str) -> bool:
    return db.query(BlockedIP).filter(BlockedIP.ip_address == ip_address).first() is not None

def get_blocked_ips(db: Session, skip: int = 0, limit: int = 100):
    return db.query(BlockedIP).offset(skip).limit(limit).all()

def create_intercept_request(db: Session, method: str, url: str, headers: str, body: str):
    db_req = InterceptedRequest(method=method, url=url, headers=headers, body=body, status="pending")
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    return db_req

def get_pending_intercepts(db: Session):
    return db.query(InterceptedRequest).filter(InterceptedRequest.status == "pending").all()

def resolve_intercept(db: Session, req_id: int, decision: str):
    """
    decision should be 'forwarded' or 'dropped'
    """
    req = db.query(InterceptedRequest).filter(InterceptedRequest.id == req_id).first()
    if req:
        req.status = decision
        db.commit()
        db.refresh(req)
    return req

def log_vulnerability(db: Session, endpoint: str, param: str, vuln_type: str, severity: str, payload_used: str):
    vuln = Vulnerability(endpoint=endpoint, parameter=param, vuln_type=vuln_type, severity=severity, payload_used=payload_used)
    db.add(vuln)
    db.commit()
    db.refresh(vuln)
    return vuln

def get_vulnerabilities(db: Session):
    return db.query(Vulnerability).all()

def log_login_attempt(db: Session, ip_address: str, success: bool, username: str = None):
    attempt = LoginAttempt(ip_address=ip_address, success=success, username_attempted=username)
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt

def get_failed_logins_count(db: Session, ip_address: str, minutes: int = 5):
    from datetime import timedelta
    time_threshold = datetime.utcnow() - timedelta(minutes=minutes)
    return db.query(LoginAttempt).filter(
        LoginAttempt.ip_address == ip_address,
        LoginAttempt.success == False,
        LoginAttempt.timestamp >= time_threshold
    ).count()

def get_protected_routes(db: Session):
    return [route.path for route in db.query(ProtectedRoute).filter(ProtectedRoute.is_active == True).all()]

