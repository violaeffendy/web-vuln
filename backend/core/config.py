from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Universal AI Web Security Platform"
    TARGET_URL: str = "http://localhost:5000" # Default target to protect
    SECRET_KEY: str = "supersecretkey_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    DATABASE_URL: str = "sqlite:///./waf_security.db"

    class Config:
        case_sensitive = True

settings = Settings()
