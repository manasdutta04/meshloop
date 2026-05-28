from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    base_url="https://models.github.ai/inference",
    api_key=os.getenv("GITHUB_TOKEN"),
)

try:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": "Say hello in one sentence."}],
        max_tokens=50,
    )
    print("SUCCESS: GitHub Models connected:", response.choices[0].message.content)
except Exception as e:
    print("ERROR: Connection failed:", str(e))
