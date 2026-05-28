import os
from dotenv import load_dotenv
import semantic_kernel as sk
# Note: In newer version of semantic-kernel, things might have moved.
# But I'll follow the plan's code first.
try:
    from semantic_kernel.connectors.ai.open_ai import OpenAIChatCompletion
except ImportError:
    # Older versions or different structure
    from semantic_kernel.connectors.ai.open_ai.services.open_ai_chat_completion import OpenAIChatCompletion

load_dotenv()

_kernel: sk.Kernel = None

def get_kernel() -> sk.Kernel:
    """
    Returns the shared Semantic Kernel instance.
    Creates it on first call (singleton pattern).
    """
    global _kernel
    if _kernel is not None:
        return _kernel
    
    _kernel = sk.Kernel()
    
    # Register GitHub Models (GPT-4o) as the chat service
    chat_service = OpenAIChatCompletion(
        ai_model_id="gpt-4o",
        api_key=os.getenv("GITHUB_TOKEN"),
    )
    # Override the base URL to point to GitHub Models
    chat_service.client.base_url = "https://models.github.ai/inference"
    
    _kernel.add_service(chat_service)
    
    return _kernel

def get_kernel_with_phi4() -> sk.Kernel:
    """
    Returns a kernel configured with Microsoft Phi-4 (faster, for simple tasks).
    """
    kernel = sk.Kernel()
    chat_service = OpenAIChatCompletion(
        ai_model_id="microsoft/phi-4",
        api_key=os.getenv("GITHUB_TOKEN"),
    )
    chat_service.client.base_url = "https://models.github.ai/inference"
    kernel.add_service(chat_service)
    return kernel

if __name__ == "__main__":
    k = get_kernel()
    print("[OK] Semantic Kernel initialized with GitHub Models (GPT-4o)")
    print(f"   Services registered: {list(k.services.keys())}")
