from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    llm_api_key: str = ""
    llm_base_url: str = "https://integrate.api.nvidia.com/v1"
    supabase_url: str = ""
    supabase_key: str = ""
    maps_api_key: str = ""
    google_client_id: str = ""
    google_client_secret: str = ""

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
