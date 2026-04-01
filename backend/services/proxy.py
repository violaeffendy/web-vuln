import httpx
from fastapi import Request, Response, HTTPException
from sqlalchemy.orm import Session
from backend.services.ai_engine import AIEngine
from backend.database.crud import create_traffic_log, get_failed_logins_count, log_login_attempt, block_ip, get_protected_routes
from backend.core.config import settings
import json

proxy_client = httpx.AsyncClient(base_url=settings.TARGET_URL, verify=False)
ai_classifier = AIEngine()

async def forward_request(request: Request, db: Session, target_path: str):
    method = request.method
    headers = dict(request.headers)
    body = await request.body()
    query_params = str(request.query_params)

    # 1. Strip host header so it gets rebuilt for target
    headers.pop("host", None)
    # Ignore content length so httpx can recalculate it
    headers.pop("content-length", None)

    body_str = body.decode(errors='ignore') if body else ""

    client_ip = request.client.host if request.client else "unknown"

    # 1.5 Setup Protection Mechanisms
    # A. URL Bypass Protection
    protected_routes = get_protected_routes(db)
    for route in protected_routes:
        if target_path.startswith(route.strip('/')):
            auth_header = request.headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                log_data = {
                    "source_ip": client_ip, "method": method, "path": target_path,
                    "query_params": query_params, "headers": str(headers), "body_payload": body_str,
                    "ai_risk_score": 1.0, "is_anomaly": True, "blocked": True, "reason": "URL Bypass Attempt (Unathenticated access to protected route)"
                }
                create_traffic_log(db, log_data)
                return Response(content="WAF Blocked: Unauthorized access to protected endpoint", status_code=403)

    # B. Login Protection (Brute Force Detection)
    if "login" in target_path.lower() and method == "POST":
        failed_count = get_failed_logins_count(db, client_ip, minutes=5)
        if failed_count >= 5:
            block_ip(db, client_ip, "Brute force login detected")
            log_data = {
                 "source_ip": client_ip, "method": method, "path": target_path,
                 "blocked": True, "reason": "Brute Force IP Block", "ai_risk_score": 1.0, "is_anomaly": True
            }
            create_traffic_log(db, log_data)
            return Response(content="WAF Blocked: Too many failed login attempts", status_code=403)

    # 2. AI & Heuristic Analysis
    total_risk, is_anomaly, reason = ai_classifier.evaluate_request(target_path, query_params, body_str, headers)
    
    blocked = False
    
    # Simple decision engine block threshold
    if total_risk >= 0.8:
        blocked = True
        
    # 3. Log the traffic
    log_data = {
        "source_ip": client_ip,
        "method": method,
        "path": target_path,
        "query_params": query_params,
        "headers": str(headers),
        "body_payload": body_str,
        "ai_risk_score": total_risk,
        "is_anomaly": is_anomaly,
        "blocked": blocked,
        "reason": reason
    }
    
    if blocked:
        # Save log
        create_traffic_log(db, log_data)
        return Response(content="WAF Blocked: Malicious payload detected", status_code=403)

    # 4. Forward if safe
    response_time = 0.0
    import time
    start_time = time.time()
    
    try:
        req = proxy_client.build_request(
            method=method,
            url=f"{settings.TARGET_URL}/{target_path}?{query_params}" if query_params else f"{settings.TARGET_URL}/{target_path}",
            headers=headers,
            content=body
        )
        proxy_response = await proxy_client.send(req)
        
        # We need to manually remove some headers from proxy response
        # hop-by-hop headers or transfer-encoding
        res_headers = dict(proxy_response.headers)
        res_headers.pop("content-encoding", None)
        res_headers.pop("transfer-encoding", None)
        res_headers.pop("content-length", None)
        
        response_time = (time.time() - start_time) * 1000.0
        
        log_data["status_code"] = proxy_response.status_code
        log_data["response_time_ms"] = response_time
        create_traffic_log(db, log_data)

        # Record Login Attempt result
        if "login" in target_path.lower() and method == "POST":
            # Assuming 200 means success, 4xx means fail.
            success = proxy_response.status_code == 200
            
            # Simple assumption of username field in JSON payload
            username = "unknown"
            if body_str:
                try:
                    payload_json = json.loads(body_str)
                    username = payload_json.get("username", payload_json.get("email", "unknown"))
                except:
                    pass
            log_login_attempt(db, client_ip, success, username)
        
        return Response(
            content=proxy_response.content,
            status_code=proxy_response.status_code,
            headers=res_headers
        )
        
    except httpx.RequestError as exc:
        log_data["status_code"] = 502
        log_data["reason"] = "Proxy Forward Error"
        create_traffic_log(db, log_data)
        return Response(content="WAF Error: Underlying target server is unreachable", status_code=502)
