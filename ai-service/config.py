import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    SERVICE_PORT: int = int(os.getenv("PORT", "8000"))
    SERVICE_HOST: str = os.getenv("HOST", "0.0.0.0")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    INTERNAL_API_KEY: str = os.getenv("INTERNAL_API_KEY", "brandsutra-internal-ai-key-2026")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

settings = Settings()
