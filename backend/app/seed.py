"""Carga inicial de datos de ejemplo.

Los precios son placeholders: se editan desde el panel de administración.
Ejecutar con:  python -m app.seed   (desde la carpeta backend/)
"""

from sqlalchemy.orm import Session

from .auth import hash_password
from .config import settings
from .database import Base, SessionLocal, engine
from .models import AdminUser, Category, Option, OptionGroup, Product

CATEGORIES = [
    {
        "slug": "tortas-clasicas",
        "name": "Tortas clásicas",
        "tagline": "Las de siempre, con precio a la vista y listas para encargar.",
        "position": 1,
    },
    {
        "slug": "cookies",
        "name": "Cookies",
        "tagline": "Masa madre de manteca, centro tierno y borde crocante.",
        "position": 2,
    },
    {
        "slug": "bizcochuelos",
        "name": "Bizcochuelos",
        "tagline": "Base lista para que armes tu propia torta en casa.",
        "position": 3,
    },
    {
        "slug": "mesa-dulce",
        "name": "Mesa dulce",
        "tagline": "Bocaditos por unidad para cumpleaños y eventos.",
        "position": 4,
    },
]

PRODUCTS = [
    # Tortas clásicas
    {
        "category": "tortas-clasicas",
        "slug": "chocotorta",
        "name": "Chocotorta",
        "description": "Chocolinas, dulce de leche y queso crema. La que nunca falla.",
        "price": 32000,
        "price_unit": "12 porciones",
        "accent": "cacao",
        "badge": "La más pedida",
        "featured": True,
        "position": 1,
    },
    {
        "category": "tortas-clasicas",
        "slug": "selva-negra",
        "name": "Selva negra",
        "description": "Bizcochuelo de chocolate, crema batida y cerezas al marrasquino.",
        "price": 38000,
        "price_unit": "12 porciones",
        "accent": "cereza",
        "featured": True,
        "position": 2,
    },
    {
        "category": "tortas-clasicas",
        "slug": "lemon-pie",
        "name": "Lemon pie",
        "description": "Masa sablée, curd de limón bien ácido y merengue quemado.",
        "price": 29000,
        "price_unit": "10 porciones",
        "accent": "limon",
        "featured": True,
        "position": 3,
    },
    {
        "category": "tortas-clasicas",
        "slug": "torta-rogel",
        "name": "Rogel",
        "description": "Capas finísimas de masa hojaldrada, dulce de leche y merengue italiano.",
        "price": 36000,
        "price_unit": "12 porciones",
        "accent": "dulce",
        "position": 4,
    },
    {
        "category": "tortas-clasicas",
        "slug": "red-velvet",
        "name": "Red velvet",
        "description": "Bizcocho aterciopelado con frosting de queso crema.",
        "price": 41000,
        "price_unit": "12 porciones",
        "accent": "cereza",
        "position": 5,
    },
    {
        "category": "tortas-clasicas",
        "slug": "cheesecake-frutos-rojos",
        "name": "Cheesecake de frutos rojos",
        "description": "Base de galleta, relleno cremoso y salsa de frutos rojos frescos.",
        "price": 39000,
        "price_unit": "10 porciones",
        "accent": "cereza",
        "position": 6,
    },
    {
        "category": "tortas-clasicas",
        "slug": "carrot-cake",
        "name": "Carrot cake",
        "description": "Zanahoria, nuez y canela con frosting de queso crema.",
        "price": 34000,
        "price_unit": "10 porciones",
        "accent": "pistacho",
        "position": 7,
    },
    {
        "category": "tortas-clasicas",
        "slug": "tiramisu",
        "name": "Tiramisú",
        "description": "Vainillas embebidas en café, mascarpone y cacao amargo.",
        "price": 37000,
        "price_unit": "10 porciones",
        "accent": "cacao",
        "position": 8,
    },
    # Cookies
    {
        "category": "cookies",
        "slug": "cookies-chips",
        "name": "Cookies con chips",
        "description": "Chocolate semiamargo en trozos, sal marina arriba.",
        "price": 14000,
        "price_unit": "docena",
        "accent": "cacao",
        "featured": True,
        "position": 1,
    },
    {
        "category": "cookies",
        "slug": "alfajores-maicena",
        "name": "Alfajores de maicena",
        "description": "Dulce de leche repostero y coco rallado.",
        "price": 12000,
        "price_unit": "docena",
        "accent": "dulce",
        "position": 2,
    },
    {
        "category": "cookies",
        "slug": "cookies-red-velvet",
        "name": "Cookies red velvet",
        "description": "Corazón de queso crema, masa color rubí.",
        "price": 16000,
        "price_unit": "docena",
        "accent": "cereza",
        "position": 3,
    },
    {
        "category": "cookies",
        "slug": "cookies-pistacho",
        "name": "Cookies de pistacho",
        "description": "Pistacho tostado y chocolate blanco.",
        "price": 18000,
        "price_unit": "docena",
        "accent": "pistacho",
        "position": 4,
    },
    # Bizcochuelos
    {
        "category": "bizcochuelos",
        "slug": "bizcochuelo-vainilla",
        "name": "Bizcochuelo de vainilla",
        "description": "Molde de 22 cm, tres capas ya cortadas.",
        "price": 11000,
        "price_unit": "22 cm",
        "accent": "vainilla",
        "position": 1,
    },
    {
        "category": "bizcochuelos",
        "slug": "bizcochuelo-chocolate",
        "name": "Bizcochuelo de chocolate",
        "description": "Cacao amargo, húmedo, listo para rellenar.",
        "price": 13000,
        "price_unit": "22 cm",
        "accent": "cacao",
        "position": 2,
    },
    {
        "category": "bizcochuelos",
        "slug": "bizcochuelo-sin-tacc",
        "name": "Bizcochuelo sin TACC",
        "description": "Elaborado en zona libre de gluten.",
        "price": 16000,
        "price_unit": "22 cm",
        "accent": "vainilla",
        "badge": "Sin TACC",
        "position": 3,
    },
    # Mesa dulce
    {
        "category": "mesa-dulce",
        "slug": "cupcakes",
        "name": "Cupcakes decorados",
        "description": "Buttercream a elección y toppers personalizados.",
        "price": 2200,
        "price_unit": "por unidad",
        "accent": "rosa",
        "position": 1,
    },
    {
        "category": "mesa-dulce",
        "slug": "cake-pops",
        "name": "Cake pops",
        "description": "Bañados en chocolate y granas de color.",
        "price": 1900,
        "price_unit": "por unidad",
        "accent": "rosa",
        "position": 2,
    },
    {
        "category": "mesa-dulce",
        "slug": "brownies",
        "name": "Brownies",
        "description": "Bien húmedos, con nuez opcional.",
        "price": 2400,
        "price_unit": "por unidad",
        "accent": "cacao",
        "position": 3,
    },
]

OPTION_GROUPS = [
    {
        "slug": "tamano",
        "name": "Tamaño",
        "helper": "Definí para cuánta gente es. Este paso fija el precio base.",
        "kind": "single",
        "required": True,
        "is_base_price": True,
        "position": 1,
        "options": [
            {"name": "10 porciones", "description": "Molde de 20 cm", "price_delta": 30000, "swatch": "#F2C6C2"},
            {"name": "15 porciones", "description": "Molde de 24 cm", "price_delta": 42000, "swatch": "#E9A8A2"},
            {"name": "25 porciones", "description": "Molde de 28 cm", "price_delta": 58000, "swatch": "#D98C86"},
            {"name": "40 porciones", "description": "Dos pisos", "price_delta": 89000, "swatch": "#C46F69"},
        ],
    },
    {
        "slug": "bizcochuelo",
        "name": "Bizcochuelo",
        "helper": "La base de tu torta.",
        "kind": "single",
        "required": True,
        "position": 2,
        "options": [
            {"name": "Vainilla", "description": "Clásico y esponjoso", "price_delta": 0, "swatch": "#F4E4C1"},
            {"name": "Chocolate", "description": "Cacao amargo, bien húmedo", "price_delta": 2500, "swatch": "#6B4A3A"},
            {"name": "Red velvet", "description": "Aterciopelado, color rubí", "price_delta": 4000, "swatch": "#A93B3B"},
            {"name": "Limón", "description": "Con ralladura fresca", "price_delta": 2500, "swatch": "#E8DC8A"},
            {"name": "Zanahoria y nuez", "description": "Especiado con canela", "price_delta": 4500, "swatch": "#D79A5B"},
            {"name": "Sin TACC", "description": "Zona libre de gluten", "price_delta": 7000, "swatch": "#CBBFA8"},
        ],
    },
    {
        "slug": "relleno",
        "name": "Relleno",
        "helper": "Podés combinar hasta dos capas distintas.",
        "kind": "multi",
        "required": True,
        "max_choices": 2,
        "position": 3,
        "options": [
            {"name": "Dulce de leche repostero", "price_delta": 0, "swatch": "#B07A4E"},
            {"name": "Crema de queso", "price_delta": 2000, "swatch": "#F5EFE3"},
            {"name": "Ganache de chocolate", "price_delta": 3500, "swatch": "#4A2E24"},
            {"name": "Frutos rojos frescos", "price_delta": 5000, "swatch": "#8E2C3F"},
            {"name": "Curd de limón", "price_delta": 3000, "swatch": "#E6D75C"},
            {"name": "Crema de pistacho", "price_delta": 6500, "swatch": "#93A96A"},
            {"name": "Durazno en almíbar", "price_delta": 2500, "swatch": "#E8A55C"},
        ],
    },
    {
        "slug": "cobertura",
        "name": "Cobertura",
        "helper": "Cómo se ve por fuera.",
        "kind": "single",
        "required": True,
        "position": 4,
        "options": [
            {"name": "Buttercream liso", "description": "Terminación prolija y mate", "price_delta": 0, "swatch": "#F3E3D7"},
            {"name": "Naked cake", "description": "Bizcocho a la vista", "price_delta": 0, "swatch": "#E2C9A6"},
            {"name": "Drip de chocolate", "description": "Chorreado sobre los bordes", "price_delta": 4000, "swatch": "#3E2A21"},
            {"name": "Merengue italiano quemado", "price_delta": 5000, "swatch": "#F6EDD9"},
            {"name": "Fondant", "description": "Superficie lisa para diseños", "price_delta": 9000, "swatch": "#DCD3E8"},
        ],
    },
    {
        "slug": "decoracion",
        "name": "Decoración",
        "helper": "Sumá los detalles que quieras.",
        "kind": "multi",
        "required": False,
        "max_choices": 4,
        "position": 5,
        "options": [
            {"name": "Flores naturales", "price_delta": 7000, "swatch": "#E4A0B7"},
            {"name": "Frutas frescas", "price_delta": 5000, "swatch": "#C2453F"},
            {"name": "Topper personalizado", "description": "Con el nombre y la edad", "price_delta": 4500, "swatch": "#D4AF7A"},
            {"name": "Macarons", "price_delta": 8000, "swatch": "#EBC3D3"},
            {"name": "Chocolates y grageas", "price_delta": 3500, "swatch": "#6B4A3A"},
            {"name": "Velas y chispero", "price_delta": 2000, "swatch": "#F0E68C"},
        ],
    },
    {
        "slug": "extras",
        "name": "Detalles finales",
        "helper": "Opcional, pero hacen la diferencia.",
        "kind": "multi",
        "required": False,
        "max_choices": 3,
        "position": 6,
        "options": [
            {"name": "Caja de regalo premium", "price_delta": 3500, "swatch": "#C9B8A8"},
            {"name": "Tarjeta escrita a mano", "price_delta": 1200, "swatch": "#EFE6D8"},
            {"name": "Porciones extra individuales", "description": "Para los que se quedan con ganas", "price_delta": 6000, "swatch": "#E9A8A2"},
        ],
    },
]


def seed(db: Session) -> None:
    if not db.query(AdminUser).first():
        db.add(
            AdminUser(
                email=settings.admin_email.lower(),
                hashed_password=hash_password(settings.admin_password),
            )
        )
        print(f"Admin creado: {settings.admin_email}")

    cat_by_slug: dict[str, Category] = {}
    for data in CATEGORIES:
        category = db.query(Category).filter(Category.slug == data["slug"]).first()
        if not category:
            category = Category(**data)
            db.add(category)
        cat_by_slug[data["slug"]] = category
    db.flush()

    for data in PRODUCTS:
        if db.query(Product).filter(Product.slug == data["slug"]).first():
            continue
        payload = dict(data)
        category = cat_by_slug[payload.pop("category")]
        db.add(Product(category_id=category.id, **payload))

    for group_data in OPTION_GROUPS:
        payload = dict(group_data)
        options = payload.pop("options")
        group = db.query(OptionGroup).filter(OptionGroup.slug == payload["slug"]).first()
        if not group:
            group = OptionGroup(**payload)
            db.add(group)
            db.flush()
        for index, option_data in enumerate(options, start=1):
            exists = (
                db.query(Option)
                .filter(Option.group_id == group.id, Option.name == option_data["name"])
                .first()
            )
            if not exists:
                db.add(Option(group_id=group.id, position=index, **option_data))

    db.commit()
    print(
        f"Listo: {db.query(Category).count()} categorías, "
        f"{db.query(Product).count()} productos, "
        f"{db.query(Option).count()} opciones de personalización."
    )


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
