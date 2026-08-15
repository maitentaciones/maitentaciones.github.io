from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Order, OrderItem
from ..schemas import OrderCreate, OrderOut

router = APIRouter(prefix="/api/orders", tags=["pedidos"])


@router.post("", response_model=OrderOut, status_code=201)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    """Guarda el pedido. El cliente además lo manda por WhatsApp desde el navegador."""
    order = Order(
        customer_name=payload.customer_name.strip(),
        phone=payload.phone.strip(),
        delivery_date=payload.delivery_date.strip(),
        notes=payload.notes.strip(),
    )
    order.items = [
        OrderItem(
            title=item.title,
            detail=item.detail,
            quantity=item.quantity,
            unit_price=item.unit_price,
        )
        for item in payload.items
    ]
    order.total = sum(item.quantity * item.unit_price for item in payload.items)

    db.add(order)
    db.commit()
    db.refresh(order)
    return order
