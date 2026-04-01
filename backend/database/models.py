from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from datetime import datetime

from backend.database.database import Base

class LoginAttempt(Base):
    __tablename__ = "login_attempts"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String, index=True)
    username_attempted = Column(String, nullable=True)
    success = Column(Boolean, default=False)

class ProtectedRoute(Base):
    __tablename__ = "protected_routes"

    id = Column(Integer, primary_key=True, index=True)
    path = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=True)


class TrafficLog(Base):
    __tablename__ = "traffic_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    source_ip = Column(String, index=True)
    method = Column(String)
    path = Column(String, index=True)
    query_params = Column(Text, nullable=True)
    headers = Column(Text, nullable=True)
    body_payload = Column(Text, nullable=True)
    status_code = Column(Integer, nullable=True)
    response_time_ms = Column(Float, nullable=True)
    
    # AI Engine Data
    ai_risk_score = Column(Float, default=0.0)
    is_anomaly = Column(Boolean, default=False)
    blocked = Column(Boolean, default=False)
    reason = Column(String, nullable=True)

class BlockedIP(Base):
    __tablename__ = "blocked_ips"

    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String, unique=True, index=True)
    reason = Column(String)
    blocked_at = Column(DateTime, default=datetime.utcnow)

class InterceptedRequest(Base):
    __tablename__ = "intercepted_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    method = Column(String)
    url = Column(String)
    headers = Column(Text)
    body = Column(Text)
    status = Column(String, default="pending") # pending, forwarded, dropped

class Vulnerability(Base):
    __tablename__ = "vulnerabilities"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    endpoint = Column(String)
    parameter = Column(String)
    vuln_type = Column(String) # SQLi, XSS, etc.
    severity = Column(String)
    payload_used = Column(Text)
