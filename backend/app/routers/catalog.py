from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Category, OptionGroup, Product
from ..schemas import (
    CategoryOut,
    CategoryWithProducts,
    OptionGroupOut,
    OptionOut,
    ProductOut,
    VariantOut,
)

router = APIRouter(prefix="/api", tags=["catálogo"])


@router.get("/categories", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return (
        db.query(Category)
        .filter(Category.active.is_(True))
        .order_by(Category.position, Category.name)
        .all()
    )


def _product_out(product: Product) -> ProductOut:
    """Al público solo le mostramos los tamaños disponibles."""
    data = ProductOut.model_validate(product)
    data.variants = [
        VariantOut.model_validate(v)
        for v in sorted(product.variants, key=lambda v: (v.position, v.name))
        if v.active
    ]
    return data


@router.get("/products", response_model=list[ProductOut])
def list_products(
    category: str | None = Query(default=None, description="slug de la categoría"),
    featured: bool | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Product).join(Category).filter(Product.active.is_(True))
    if category:
        query = query.filter(Category.slug == category)
    if featured is not None:
        query = query.filter(Product.featured.is_(featured))
    products = query.order_by(Product.position, Product.name).all()
    return [_product_out(p) for p in products]


@router.get("/products/{slug}", response_model=ProductOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = (
        db.query(Product).filter(Product.slug == slug, Product.active.is_(True)).first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return _product_out(product)


@router.get("/catalog", response_model=list[CategoryWithProducts])
def full_catalog(db: Session = Depends(get_db)):
    """Catálogo completo agrupado: una sola llamada para pintar toda la vitrina."""
    categories = (
        db.query(Category)
        .filter(Category.active.is_(True))
        .order_by(Category.position, Category.name)
        .all()
    )
    result = []
    for cat in categories:
        products = sorted(
            (p for p in cat.products if p.active),
            key=lambda p: (p.position, p.name),
        )
        data = CategoryWithProducts.model_validate(cat)
        data.products = [_product_out(p) for p in products]
        result.append(data)
    return result


@router.get("/customizer", response_model=list[OptionGroupOut])
def customizer(db: Session = Depends(get_db)):
    """Pasos y opciones para armar una torta a medida."""
    groups = (
        db.query(OptionGroup)
        .filter(OptionGroup.active.is_(True))
        .order_by(OptionGroup.position, OptionGroup.name)
        .all()
    )
    payload = []
    for group in groups:
        data = OptionGroupOut.model_validate(group)
        data.options = [
            OptionOut.model_validate(o)
            for o in sorted(group.options, key=lambda o: (o.position, o.name))
            if o.active
        ]
        payload.append(data)
    return payload
