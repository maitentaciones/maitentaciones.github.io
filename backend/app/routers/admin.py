from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import create_access_token, current_admin, verify_password
from ..database import get_db
from ..models import AdminUser, Category, Option, OptionGroup, Order, Product
from ..schemas import (
    CategoryCreate,
    CategoryOut,
    CategoryUpdate,
    LoginIn,
    OptionCreate,
    OptionGroupCreate,
    OptionGroupOut,
    OptionGroupUpdate,
    OptionOut,
    OptionUpdate,
    OrderOut,
    OrderStatusUpdate,
    ProductCreate,
    ProductOut,
    ProductUpdate,
    TokenOut,
)

auth_router = APIRouter(prefix="/api/auth", tags=["auth"])
router = APIRouter(
    prefix="/api/admin", tags=["admin"], dependencies=[Depends(current_admin)]
)

VALID_STATUSES = {"nuevo", "confirmado", "listo", "entregado", "cancelado"}


@auth_router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(AdminUser.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")
    return TokenOut(access_token=create_access_token(user.email), email=user.email)


@auth_router.get("/me")
def me(user: AdminUser = Depends(current_admin)):
    return {"email": user.email}


def _get_or_404(db: Session, model, obj_id: int, label: str):
    obj = db.get(model, obj_id)
    if not obj:
        raise HTTPException(status_code=404, detail=f"{label} no encontrado")
    return obj


def _apply(obj, payload) -> None:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(obj, field, value)


# --- Categorías -------------------------------------------------------------


@router.get("/categories", response_model=list[CategoryOut])
def admin_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.position, Category.name).all()


@router.post("/categories", response_model=CategoryOut, status_code=201)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    if db.query(Category).filter(Category.slug == payload.slug).first():
        raise HTTPException(status_code=409, detail="Ya existe una categoría con ese slug")
    category = Category(**payload.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.patch("/categories/{category_id}", response_model=CategoryOut)
def update_category(category_id: int, payload: CategoryUpdate, db: Session = Depends(get_db)):
    category = _get_or_404(db, Category, category_id, "Categoría")
    _apply(category, payload)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = _get_or_404(db, Category, category_id, "Categoría")
    db.delete(category)
    db.commit()


# --- Productos --------------------------------------------------------------


@router.get("/products", response_model=list[ProductOut])
def admin_products(db: Session = Depends(get_db)):
    return db.query(Product).order_by(Product.position, Product.name).all()


@router.post("/products", response_model=ProductOut, status_code=201)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    if db.query(Product).filter(Product.slug == payload.slug).first():
        raise HTTPException(status_code=409, detail="Ya existe un producto con ese slug")
    _get_or_404(db, Category, payload.category_id, "Categoría")
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.patch("/products/{product_id}", response_model=ProductOut)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = _get_or_404(db, Product, product_id, "Producto")
    if payload.category_id is not None:
        _get_or_404(db, Category, payload.category_id, "Categoría")
    _apply(product, payload)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = _get_or_404(db, Product, product_id, "Producto")
    db.delete(product)
    db.commit()


# --- Personalizador ---------------------------------------------------------


@router.get("/option-groups", response_model=list[OptionGroupOut])
def admin_groups(db: Session = Depends(get_db)):
    return db.query(OptionGroup).order_by(OptionGroup.position, OptionGroup.name).all()


@router.post("/option-groups", response_model=OptionGroupOut, status_code=201)
def create_group(payload: OptionGroupCreate, db: Session = Depends(get_db)):
    if db.query(OptionGroup).filter(OptionGroup.slug == payload.slug).first():
        raise HTTPException(status_code=409, detail="Ya existe un paso con ese slug")
    group = OptionGroup(**payload.model_dump())
    db.add(group)
    db.commit()
    db.refresh(group)
    return group


@router.patch("/option-groups/{group_id}", response_model=OptionGroupOut)
def update_group(group_id: int, payload: OptionGroupUpdate, db: Session = Depends(get_db)):
    group = _get_or_404(db, OptionGroup, group_id, "Paso")
    _apply(group, payload)
    db.commit()
    db.refresh(group)
    return group


@router.delete("/option-groups/{group_id}", status_code=204)
def delete_group(group_id: int, db: Session = Depends(get_db)):
    group = _get_or_404(db, OptionGroup, group_id, "Paso")
    db.delete(group)
    db.commit()


@router.post("/options", response_model=OptionOut, status_code=201)
def create_option(payload: OptionCreate, db: Session = Depends(get_db)):
    _get_or_404(db, OptionGroup, payload.group_id, "Paso")
    option = Option(**payload.model_dump())
    db.add(option)
    db.commit()
    db.refresh(option)
    return option


@router.patch("/options/{option_id}", response_model=OptionOut)
def update_option(option_id: int, payload: OptionUpdate, db: Session = Depends(get_db)):
    option = _get_or_404(db, Option, option_id, "Opción")
    if payload.group_id is not None:
        _get_or_404(db, OptionGroup, payload.group_id, "Paso")
    _apply(option, payload)
    db.commit()
    db.refresh(option)
    return option


@router.delete("/options/{option_id}", status_code=204)
def delete_option(option_id: int, db: Session = Depends(get_db)):
    option = _get_or_404(db, Option, option_id, "Opción")
    db.delete(option)
    db.commit()


# --- Pedidos ----------------------------------------------------------------


@router.get("/orders", response_model=list[OrderOut])
def admin_orders(db: Session = Depends(get_db)):
    return db.query(Order).order_by(Order.created_at.desc()).all()


@router.patch("/orders/{order_id}", response_model=OrderOut)
def update_order_status(
    order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db)
):
    if payload.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=422, detail=f"Estado inválido. Usá uno de: {', '.join(sorted(VALID_STATUSES))}"
        )
    order = _get_or_404(db, Order, order_id, "Pedido")
    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order


@router.delete("/orders/{order_id}", status_code=204)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = _get_or_404(db, Order, order_id, "Pedido")
    db.delete(order)
    db.commit()
