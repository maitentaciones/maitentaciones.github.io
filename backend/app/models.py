from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


# Hora local del negocio: SQLite no guarda el offset, así que evitamos UTC
# para que el panel muestre la misma hora que el reloj de la cocina.
def now() -> datetime:
    return datetime.now()


class Category(Base):
    """Sección del catálogo: tortas clásicas, cookies, bizcochuelos, etc."""

    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(60), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(80))
    tagline: Mapped[str] = mapped_column(String(160), default="")
    position: Mapped[int] = mapped_column(Integer, default=0)
    active: Mapped[bool] = mapped_column(Boolean, default=True)

    products: Mapped[list["Product"]] = relationship(
        back_populates="category", cascade="all, delete-orphan"
    )


class Product(Base):
    """Producto de vitrina con precio a la vista."""

    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text, default="")
    price: Mapped[float] = mapped_column(Float, default=0)
    # Texto libre para aclarar a qué corresponde el precio: "8 porciones", "docena", "1 kg".
    price_unit: Mapped[str] = mapped_column(String(60), default="")
    image_url: Mapped[str] = mapped_column(String(500), default="")
    # Paleta de acento para la tarjeta cuando todavía no hay foto cargada.
    accent: Mapped[str] = mapped_column(String(20), default="rosa")
    badge: Mapped[str] = mapped_column(String(40), default="")
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    position: Mapped[int] = mapped_column(Integer, default=0)

    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id", ondelete="CASCADE"))
    category: Mapped[Category] = relationship(back_populates="products")

    # Tamaños con precio propio (porción, mediana, grande). Si no hay ninguno,
    # el producto se vende con el precio único de arriba.
    variants: Mapped[list["ProductVariant"]] = relationship(
        back_populates="product",
        cascade="all, delete-orphan",
        order_by="ProductVariant.position",
    )

    @property
    def category_slug(self) -> str:
        return self.category.slug if self.category else ""


class ProductVariant(Base):
    """Un tamaño concreto de un producto, con su propio precio."""

    __tablename__ = "product_variants"

    id: Mapped[int] = mapped_column(primary_key=True)
    # Etiqueta corta, la que se ve en el botón: "Porción", "Mediana", "Grande".
    name: Mapped[str] = mapped_column(String(60))
    # Aclaración debajo del precio: "18 porciones", "24 porciones".
    serves: Mapped[str] = mapped_column(String(60), default="")
    price: Mapped[float] = mapped_column(Float, default=0)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    position: Mapped[int] = mapped_column(Integer, default=0)

    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    product: Mapped[Product] = relationship(back_populates="variants")


class OptionGroup(Base):
    """Paso del personalizador de tortas (tamaño, bizcochuelo, relleno...)."""

    __tablename__ = "option_groups"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(60), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(80))
    helper: Mapped[str] = mapped_column(String(200), default="")
    # "single" = elegís una; "multi" = podés sumar varias.
    kind: Mapped[str] = mapped_column(String(10), default="single")
    required: Mapped[bool] = mapped_column(Boolean, default=True)
    max_choices: Mapped[int] = mapped_column(Integer, default=1)
    # El precio del grupo "base" define el punto de partida en vez de sumar un extra.
    is_base_price: Mapped[bool] = mapped_column(Boolean, default=False)
    position: Mapped[int] = mapped_column(Integer, default=0)
    active: Mapped[bool] = mapped_column(Boolean, default=True)

    options: Mapped[list["Option"]] = relationship(
        back_populates="group", cascade="all, delete-orphan", order_by="Option.position"
    )


class Option(Base):
    """Opción concreta dentro de un paso del personalizador."""

    __tablename__ = "options"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(String(240), default="")
    # En el grupo base es el precio de arranque; en el resto, cuánto suma.
    price_delta: Mapped[float] = mapped_column(Float, default=0)
    swatch: Mapped[str] = mapped_column(String(20), default="#E8B4B8")
    image_url: Mapped[str] = mapped_column(String(500), default="")
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    position: Mapped[int] = mapped_column(Integer, default=0)

    group_id: Mapped[int] = mapped_column(ForeignKey("option_groups.id", ondelete="CASCADE"))
    group: Mapped[OptionGroup] = relationship(back_populates="options")


class Order(Base):
    """Pedido enviado desde la web. El cliente además lo dispara por WhatsApp."""

    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    customer_name: Mapped[str] = mapped_column(String(120))
    phone: Mapped[str] = mapped_column(String(40), default="")
    delivery_date: Mapped[str] = mapped_column(String(40), default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    total: Mapped[float] = mapped_column(Float, default=0)
    # "nuevo" | "confirmado" | "listo" | "entregado" | "cancelado"
    status: Mapped[str] = mapped_column(String(20), default="nuevo")

    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(160))
    # Resumen legible de la personalización: "Bizcochuelo de chocolate · Relleno dulce de leche".
    detail: Mapped[str] = mapped_column(Text, default="")
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    unit_price: Mapped[float] = mapped_column(Float, default=0)

    order: Mapped[Order] = relationship(back_populates="items")


class AdminUser(Base):
    __tablename__ = "admin_users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
