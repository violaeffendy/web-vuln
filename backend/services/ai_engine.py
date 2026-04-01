import re
import random
import pandas as pd
from sklearn.ensemble import IsolationForest

class AIEngine:
    def __init__(self):
        # We start with a rudimentary Isolation Forest.
        # In a real environment, this gets trained dynamically via train_model() on startup or periodically.
        self.model = IsolationForest(contamination=0.05, random_state=42)
        # Dummy train just to fit the model so it can predict before first real training
        dummy_data = pd.DataFrame({'length': [10, 20, 15, 12, 100, 110, 105], 'special_chars': [1, 2, 1, 0, 15, 20, 18]})
        self.model.fit(dummy_data)

    def train_model(self, db_session):
        from backend.database.crud import get_all_traffic_logs_for_training
        logs = get_all_traffic_logs_for_training(db_session, limit=5000)
        
        data = []
        for log in logs:
            features = self.extract_features(
                log.path or "", 
                log.query_params or "", 
                log.body_payload or "", 
                {} # headers are not used in current extract_features
            )
            data.append(features)
            
        if len(data) < 10:
            # Fallback if DB is empty to prevent poor model or crashes during early phase
            data = [
                {'length': 10, 'special_chars': 1},
                {'length': 20, 'special_chars': 2},
                {'length': 15, 'special_chars': 1},
                {'length': 12, 'special_chars': 0},
                {'length': 100, 'special_chars': 15},
                {'length': 110, 'special_chars': 20},
                {'length': 105, 'special_chars': 18}
            ]
            
        df = pd.DataFrame(data)
        # Refit model with actual data
        self.model.fit(df)
        print(f"AI Engine successfully trained on {len(data)} items.")

    def extract_features(self, path: str, query: str, body: str, headers: dict):
        payload = f"{path} {query} {body}"
        return {
            "length": len(payload),
            "special_chars": len(re.findall(r'[^a-zA-Z0-9\s]', payload))
        }

    def detect_heuristics(self, path: str, query: str, body: str, headers: dict):
        payload = f"{path} {query} {body}".lower()
        
        sqli_patterns = [r'(%27)|(\')|(--)|(%23)|(#)', r'union.*select', r'drop.*table']
        xss_patterns = [r'(%3C)|<', r'(%3E)|>', r'script', r'javascript:']
        cmd_patterns = [r'(%3B)|;', r'\|\|', r'&&', r'cat\s+/etc', r'eval\(']
        
        user_agent = headers.get('user-agent', '').lower()
        is_bot = 'curl' in user_agent or 'python' in user_agent or 'bot' in user_agent or user_agent == ''
        
        risk_score = 0.0
        reason = []

        for p in sqli_patterns:
            if re.search(p, payload):
                risk_score += 0.5
                reason.append("SQLi heuristic match")
                break
                
        for p in xss_patterns:
            if re.search(p, payload):
                risk_score += 0.5
                reason.append("XSS heuristic match")
                break

        for p in cmd_patterns:
            if re.search(p, payload):
                risk_score += 0.6
                reason.append("Command Injection match")
                break
                
        if is_bot:
            risk_score += 0.3
            reason.append("Bot / Automated Script detected")
        
        return risk_score, reason

    def evaluate_request(self, path: str, query: str, body: str, headers: dict) -> tuple[float, bool, str]:
        # 1. Heuristics check
        h_score, reasons = self.detect_heuristics(path, query, body, headers)
        
        # 2. AI Anomaly check
        features = self.extract_features(path, query, body, headers)
        df = pd.DataFrame([features])
        prediction = self.model.predict(df)[0] # 1 for inlier, -1 for outlier
        
        ai_risk = 0.8 if prediction == -1 else 0.1
        
        # Combine scores
        total_risk = min(h_score + ai_risk, 1.0)
        is_anomaly = total_risk >= 0.7
        
        final_reason = ", ".join(reasons) if reasons else ("AI Anomaly" if prediction == -1 else "Benign")
        
        return total_risk, is_anomaly, final_reason

ai_classifier = AIEngine()
