from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    llm_api_key: str = ""
    llm_base_url: str = "https://api.groq.com/openai/v1"
    supabase_url: str = ""
    supabase_key: str = ""
    maps_api_key: str = ""
    google_client_id: str = ""
    google_client_secret: str = ""
    google_api_key: str = ""
    llm_vision_model: str = "llama-3.2-90b-vision-preview"
    llm_chat_model: str = "llama-3.3-70b-versatile"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
