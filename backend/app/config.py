# backend/app/config.py
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str = "super-secret-key-change-in-production"
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:3000"]
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, str) and v.startswith("["):
            import json
            return json.loads(v)
        return v

    GEMINI_API_KEY: str = ""
    
    # Updated paths to point inside the deployed backend structure
    ML_MODEL_PATH: str = "app/assets/lightgbm_student_model.pkl"
    ML_ENCODER_PATH: str = "app/assets/baseline_encoder.joblib"
    ML_COMPARISON_PATH: str = "app/assets/model_comparison.json"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()