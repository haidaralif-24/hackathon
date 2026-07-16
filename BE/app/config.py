from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    nvidia_nim_api_key: str = ""
    nvidia_nim_base_url: str = "https://integrate.api.nvidia.com/v1"
    db_path: str = "./data/health.db"
    maps_api_key: str = ""

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
