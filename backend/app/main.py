from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, engine
from .routers import admin, catalog, orders
from .schemas import ShopInfo


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=f"{settings.shop_name} API",
    description="Catálogo, personalizador de tortas y pedidos.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(catalog.router)
app.include_router(orders.router)
app.include_router(admin.auth_router)
app.include_router(admin.router)


@app.get("/api/shop", response_model=ShopInfo, tags=["catálogo"])
def shop_info():
    """Datos de marca y contacto que consume el frontend."""
    return ShopInfo(
        shop_name=settings.shop_name,
        whatsapp_number=settings.whatsapp_number,
        instagram_user=settings.instagram_user,
        contact_email=settings.contact_email,
        currency=settings.currency,
    )


@app.get("/api/health", tags=["infra"])
def health():
    return {"status": "ok"}
