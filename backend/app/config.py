from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env", env_file_encoding="utf-8", extra="ignore"
    )

    # Marca
    shop_name: str = "MaiTentaciones"
    whatsapp_number: str = "5491100000000"  # solo dígitos, con código de país
    instagram_user: str = "maitentaciones"
    contact_email: str = "hola@maitentaciones.com"
    currency: str = "ARS"

    # Seguridad
    secret_key: str = "cambiar-esta-clave-en-produccion"
    access_token_expire_minutes: int = 60 * 12
    admin_email: str = "admin@maitentaciones.com"
    admin_password: str = "cambiala1234"

    # Infra
    database_url: str = f"sqlite:///{BASE_DIR / 'pasteleria.db'}"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
