import os
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

models_to_test = [
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-2.5-pro",
    "gemini-pro-latest",
    "gemma-4-26b-a4b-it"
]

for m in models_to_test:
    print(f"Testing {m}...")
    try:
        model = genai.GenerativeModel(m)
        response = model.generate_content("Say hello.")
        print(f"  Success! Response: {response.text.strip()}")
    except Exception as e:
        error_msg = str(e)
        if "Quota exceeded" in error_msg:
            print(f"  Quota Exceeded!")
        elif "limit: 0" in error_msg:
            print(f"  Limit 0 (Not allowed)")
        else:
            print(f"  Error: {error_msg}")
