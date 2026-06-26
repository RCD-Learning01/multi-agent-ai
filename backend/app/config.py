import os
from dotenv import load_dotenv # pyrefly: ignore [missing-import]

# Load environment variables from .env file
load_dotenv()

class Config:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

config = Config()
