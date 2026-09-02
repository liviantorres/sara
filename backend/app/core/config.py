from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

base_dir = Path(__file__).resolve().parents[3]

class Settings(BaseSettings):
    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: str
    DB_PORT: str
    DB_NAME: str

    model_config = SettingsConfigDict(
        env_file= base_dir / ".env",
        env_file_encoding= "utf-8",
    )

    @property
    def database_url(self)-> str:
        return(
            f"postgresql+psycopg2://"
            f"{self.DB_USER}:{self.DB_PASSWORD}@"
            f"{self.DB_HOST}:{self.DB_PORT}/"
            f"{self.DB_NAME}"
        )

settings = Settings()