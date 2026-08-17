from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# --- Catálogo ---------------------------------------------------------------


class VariantBase(BaseModel):
    name: str
    serves: str = ""
    price: float = 0
    active: bool = True
    position: int = 0
    product_id: int


class VariantCreate(VariantBase):
    pass


class VariantUpdate(BaseModel):
    name: str | None = None
    serves: str | None = None
    price: float | None = None
    active: bool | None = None
    position: int | None = None
    product_id: int | None = None


class VariantOut(ORMModel, VariantBase):
    id: int


class ProductBase(BaseModel):
    slug: str
    name: str
    description: str = ""
    price: float = 0
    price_unit: str = ""
    image_url: str = ""
    accent: str = "rosa"
    badge: str = ""
    featured: bool = False
    active: bool = True
    position: int = 0
    category_id: int


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    slug: str | None = None
    name: str | None = None
    description: str | None = None
    price: float | None = None
    price_unit: str | None = None
    image_url: str | None = None
    accent: str | None = None
    badge: str | None = None
    featured: bool | None = None
    active: bool | None = None
    position: int | None = None
    category_id: int | None = None


class ProductOut(ORMModel, ProductBase):
    id: int
    category_slug: str = ""
    variants: list[VariantOut] = []


class CategoryBase(BaseModel):
    slug: str
    name: str
    tagline: str = ""
    position: int = 0
    active: bool = True


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    slug: str | None = None
    name: str | None = None
    tagline: str | None = None
    position: int | None = None
    active: bool | None = None


class CategoryOut(ORMModel, CategoryBase):
    id: int


class CategoryWithProducts(CategoryOut):
    products: list[ProductOut] = []


# --- Personalizador ---------------------------------------------------------


class OptionBase(BaseModel):
    name: str
    description: str = ""
    price_delta: float = 0
    swatch: str = "#E8B4B8"
    image_url: str = ""
    active: bool = True
    position: int = 0
    group_id: int


class OptionCreate(OptionBase):
    pass


class OptionUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price_delta: float | None = None
    swatch: str | None = None
    image_url: str | None = None
    active: bool | None = None
    position: int | None = None
    group_id: int | None = None


class OptionOut(ORMModel, OptionBase):
    id: int


class OptionGroupBase(BaseModel):
    slug: str
    name: str
    helper: str = ""
    kind: str = "single"
    required: bool = True
    max_choices: int = 1
    is_base_price: bool = False
    position: int = 0
    active: bool = True


class OptionGroupCreate(OptionGroupBase):
    pass


class OptionGroupUpdate(BaseModel):
    slug: str | None = None
    name: str | None = None
    helper: str | None = None
    kind: str | None = None
    required: bool | None = None
    max_choices: int | None = None
    is_base_price: bool | None = None
    position: int | None = None
    active: bool | None = None


class OptionGroupOut(ORMModel, OptionGroupBase):
    id: int
    options: list[OptionOut] = []


# --- Pedidos ----------------------------------------------------------------


class OrderItemIn(BaseModel):
    title: str
    detail: str = ""
    quantity: int = Field(default=1, ge=1, le=99)
    unit_price: float = Field(default=0, ge=0)


class OrderItemOut(ORMModel, OrderItemIn):
    id: int


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=1, max_length=120)
    phone: str = ""
    delivery_date: str = ""
    notes: str = ""
    items: list[OrderItemIn] = Field(min_length=1)


class OrderOut(ORMModel):
    id: int
    created_at: datetime
    customer_name: str
    phone: str
    delivery_date: str
    notes: str
    total: float
    status: str
    items: list[OrderItemOut] = []


class OrderStatusUpdate(BaseModel):
    status: str


# --- Auth / meta ------------------------------------------------------------


class LoginIn(BaseModel):
    email: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: str


class ShopInfo(BaseModel):
    shop_name: str
    whatsapp_number: str
    instagram_user: str
    contact_email: str
    currency: str
