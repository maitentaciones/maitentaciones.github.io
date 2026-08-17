"""Exporta el catálogo a archivos JSON para publicar la web sin backend.

GitHub Pages solo sirve archivos estáticos, así que congelamos acá lo que
normalmente entrega la API. Los pedidos siguen funcionando porque salen por
WhatsApp, que no necesita servidor.

Ejecutar con:  python -m app.export_static   (desde la carpeta backend/)
"""

import json
from pathlib import Path

from .config import BASE_DIR, settings
from .database import SessionLocal
from .models import Category, OptionGroup, Product

OUTPUT_DIR = BASE_DIR.parent / "frontend" / "public" / "data"


def build_payload(db) -> dict:
    categories = (
        db.query(Category)
        .filter(Category.active.is_(True))
        .order_by(Category.position, Category.name)
        .all()
    )

    catalog = []
    for category in categories:
        products = sorted(
            (p for p in category.products if p.active), key=lambda p: (p.position, p.name)
        )
        catalog.append(
            {
                "id": category.id,
                "slug": category.slug,
                "name": category.name,
                "tagline": category.tagline,
                "position": category.position,
                "active": category.active,
                "products": [
                    {
                        "id": p.id,
                        "slug": p.slug,
                        "name": p.name,
                        "description": p.description,
                        "price": p.price,
                        "price_unit": p.price_unit,
                        "image_url": p.image_url,
                        "accent": p.accent,
                        "badge": p.badge,
                        "featured": p.featured,
                        "active": p.active,
                        "position": p.position,
                        "category_id": p.category_id,
                        "category_slug": category.slug,
                        "variants": [
                            {
                                "id": v.id,
                                "name": v.name,
                                "serves": v.serves,
                                "price": v.price,
                                "active": v.active,
                                "position": v.position,
                                "product_id": v.product_id,
                            }
                            for v in sorted(p.variants, key=lambda v: (v.position, v.name))
                            if v.active
                        ],
                    }
                    for p in products
                ],
            }
        )

    groups = (
        db.query(OptionGroup)
        .filter(OptionGroup.active.is_(True))
        .order_by(OptionGroup.position, OptionGroup.name)
        .all()
    )
    customizer = [
        {
            "id": g.id,
            "slug": g.slug,
            "name": g.name,
            "helper": g.helper,
            "kind": g.kind,
            "required": g.required,
            "max_choices": g.max_choices,
            "is_base_price": g.is_base_price,
            "position": g.position,
            "active": g.active,
            "options": [
                {
                    "id": o.id,
                    "name": o.name,
                    "description": o.description,
                    "price_delta": o.price_delta,
                    "swatch": o.swatch,
                    "image_url": o.image_url,
                    "active": o.active,
                    "position": o.position,
                    "group_id": o.group_id,
                }
                for o in sorted(g.options, key=lambda o: (o.position, o.name))
                if o.active
            ],
        }
        for g in groups
    ]

    return {
        "shop": {
            "shop_name": settings.shop_name,
            "whatsapp_number": settings.whatsapp_number,
            "instagram_user": settings.instagram_user,
            "contact_email": settings.contact_email,
            "currency": settings.currency,
        },
        "catalog": catalog,
        "customizer": customizer,
    }


def main() -> None:
    db = SessionLocal()
    try:
        payload = build_payload(db)
    finally:
        db.close()

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for name, data in payload.items():
        path: Path = OUTPUT_DIR / f"{name}.json"
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    productos = sum(len(c["products"]) for c in payload["catalog"])
    opciones = sum(len(g["options"]) for g in payload["customizer"])
    print(f"Exportado a {OUTPUT_DIR}")
    print(f"  {len(payload['catalog'])} categorías · {productos} productos · {opciones} opciones")

    if payload["shop"]["whatsapp_number"] in ("", "5491100000000"):
        print("\n⚠️  El número de WhatsApp sigue siendo el de ejemplo.")
        print("   Ponelo en backend/.env antes de publicar o los pedidos no llegan.")


if __name__ == "__main__":
    main()
