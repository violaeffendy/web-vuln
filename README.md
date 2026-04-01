# 🔐 Universal AI Web Security Platform

**Framework-Agnostic AI-Powered Web Protection System**

---

## 🚀 Overview

Universal AI Web Security Platform adalah sistem keamanan berbasis AI yang dirancang untuk:

* 🔍 Mendeteksi kerentanan website (SQL Injection, XSS, dll)
* 🛡️ Melindungi aplikasi web secara real-time
* 🚫 Mencegah brute force login & URL bypass
* 📊 Monitoring aktivitas attacker secara live

Sistem ini bekerja sebagai **Reverse Proxy + AI Security Layer**, sehingga dapat melindungi berbagai jenis website tanpa bergantung pada framework tertentu.

---

## 🎯 Key Features

### 🔐 Real-Time Protection

* Reverse Proxy Security Layer
* Request filtering (headers, body, query)
* AI-based attack detection
* Automatic blocking (high-risk traffic)

---

### 🧠 AI Detection Engine

* SQL Injection detection
* XSS detection
* Behavior-based anomaly detection
* Risk scoring system (0–100)

---

### 🚫 Login Protection

* Anti brute force
* IP auto-blocking
* Request rate limiting

---

### 🔒 URL Access Protection

* Anti URL bypass (e.g. `/admin`, `/dashboard`)
* Token validation (Authorization header)
* Role-based access control (extendable)

---

### 📡 Logging & Monitoring

* Request logs stored in PostgreSQL
* Attack classification
* Risk score tracking
* IP tracking

---

### 🌐 Framework-Agnostic

Compatible with:

* PHP Native / CodeIgniter / Laravel
* Django / Flask
* Node.js / Express
* Spring Boot

---

## 🏗️ Architecture

```
Client / Attacker
        ↓
AI Security Layer (FastAPI)
        ↓
Target Website (Any Framework)
```

---

## ⚙️ Tech Stack

* **Backend:** FastAPI (Python)
* **Database:** PostgreSQL
* **HTTP Client:** httpx
* **ORM:** SQLAlchemy

---

## 📁 Project Structure

```
ai-security-platform/
│
├── main.py               # Core security middleware & proxy
├── database.py           # Database connection
├── models.py             # Database models
├── security.py           # Attack detection logic
├── auth_security.py      # Brute force protection
├── access_control.py     # URL protection
│
└── README.md
```

---

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/ai-security-platform.git
cd ai-security-platform
```

---

### 2. Install Dependencies

```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary httpx
```

---

### 3. Setup PostgreSQL

Buat database:

```sql
CREATE DATABASE ai_security;
```

Edit koneksi di `database.py`:

```python
DATABASE_URL = "postgresql://postgres:password@localhost:5432/ai_security"
```

---

### 4. Create Tables

Tambahkan ini sekali saja:

```python
from database import Base, engine
from models import *

Base.metadata.create_all(bind=engine)
```

---

### 5. Run Server

```bash
uvicorn main:app --reload --port 8000
```

---

## 🔧 Configuration

Edit target website di `main.py`:

```python
TARGET_URL = "http://localhost:8080"
```

---

## 🧪 Testing

### 🔴 Test SQL Injection

```
POST /login
payload: ' OR 1=1 --
```

Expected:

* Request diblokir
* IP masuk blacklist

---

### 🔴 Test URL Bypass

```
GET /admin
```

Expected:

* 403 Unauthorized

---

### 🔴 Test Brute Force

* Login lebih dari 5x dalam 1 menit

Expected:

* IP otomatis diblokir

---

## 📊 Example Log

```json
{
  "ip": "192.168.1.10",
  "endpoint": "/login",
  "payload": "' OR 1=1 --",
  "risk_score": 95,
  "status": "blocked"
}
```

---

## ⚠️ Security Notice

Project ini dibuat untuk:

* ✅ Pengamanan website sendiri
* ✅ Testing internal perusahaan
* ❌ Bukan untuk aktivitas ilegal

---

## 🚀 Future Improvements

* AI model (Machine Learning real)
* Web dashboard (React + Tailwind)
* WebSocket real-time monitoring
* Advanced vulnerability scanner (crawler + payload engine)
* Integration with firewall/CDN

---

## 🎯 Final Goal

Membangun sistem seperti:

* OWASP ZAP (scanner)
* Burp Suite (interceptor)

Dengan tambahan:

> 🧠 AI-based intelligent security layer

---

## 👨‍💻 Author

Developed for real-world web security implementation.

---

## ⭐ License

MIT License
