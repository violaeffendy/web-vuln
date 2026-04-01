import requests
from urllib.parse import urljoin
from backend.core.config import settings
from backend.database.crud import log_vulnerability
from sqlalchemy.orm import Session
import logging

logger = logging.getLogger(__name__)

def run_actual_scan(db: Session, target_url: str = None):
    target = target_url or settings.TARGET_URL
    results = []
    
    try:
        # Check 1: Security Headers
        response = requests.get(target, timeout=5, verify=False)
        headers = {k.lower(): v for k, v in response.headers.items()}
        
        if 'x-frame-options' not in headers:
            results.append({"endpoint": "/", "vuln": "Missing X-Frame-Options Header", "severity": "Low"})
            log_vulnerability(db, "/", "Headers", "Missing X-Frame-Options", "Low", "Passive Scan")
            
        if 'content-security-policy' not in headers:
            results.append({"endpoint": "/", "vuln": "Missing Content-Security-Policy Header", "severity": "Medium"})
            log_vulnerability(db, "/", "Headers", "Missing CSP", "Medium", "Passive Scan")
            
        if 'strict-transport-security' not in headers and target.startswith('https'):
            results.append({"endpoint": "/", "vuln": "Missing HSTS Header", "severity": "Medium"})
            log_vulnerability(db, "/", "Headers", "Missing HSTS", "Medium", "Passive Scan")

        # Check 2: Information Disclosure (Common Paths)
        common_paths = ['/.git/config', '/.env', '/admin', '/server-status', '/phpinfo.php']
        for path in common_paths:
            full_url = urljoin(target, path)
            try:
                res = requests.get(full_url, timeout=3, verify=False, allow_redirects=False)
                if res.status_code == 200:
                    results.append({"endpoint": path, "vuln": f"Exposed Sensitive Path: {path}", "severity": "High"})
                    log_vulnerability(db, path, "Path", "Exposed Sensitive Path", "High", f"GET {path}")
            except requests.RequestException:
                pass
                
        # Check 3: Basic SQLi / Error Disclosure
        sqli_payload = "/?id=' OR '1'='1"
        sqli_url = urljoin(target, sqli_payload)
        try:
            res = requests.get(sqli_url, timeout=3, verify=False)
            body = res.text.lower()
            if res.status_code == 500 or "sql syntax" in body or "mysql" in body or "ora-" in body:
                results.append({"endpoint": sqli_payload, "vuln": "Potential SQL Injection / Error Disclosure", "severity": "High"})
                log_vulnerability(db, sqli_payload, "query", "Potential SQL Injection", "High", sqli_payload)
        except requests.RequestException:
            pass
            
        return {
            "status": "completed",
            "target": target,
            "message": f"Scan completed. Found {len(results)} vulnerabilities.",
            "results": results
        }
        
    except requests.RequestException as e:
        logger.error(f"Scanner request failed: {e}")
        return {
            "status": "failed",
            "target": target,
            "message": f"Scan failed: Could not connect to target ({e})",
            "results": []
        }
