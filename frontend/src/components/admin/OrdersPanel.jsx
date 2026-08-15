import { useEffect, useState } from 'react'
import { api, money } from '../../lib/api'
import { Button, Panel } from './ui'

const STATUSES = [
  { value: 'nuevo', label: 'Nuevo', color: '#f2c6c2' },
  { value: 'confirmado', label: 'Confirmado', color: '#e8dc8a' },
  { value: 'listo', label: 'Listo', color: '#b8c9a0' },
  { value: 'entregado', label: 'Entregado', color: '#a9785f' },
  { value: 'cancelado', label: 'Cancelado', color: '#d98088' },
]

const colorOf = (status) => STATUSES.find((s) => s.value === status)?.color ?? '#b9a99e'

export default function OrdersPanel({ onError }) {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('todos')

  const load = () => api.admin.orders().then(setOrders).catch((e) => onError(e.message))

  useEffect(() => {
    load()
  }, [])

  const changeStatus = async (order, status) => {
    try {
      await api.admin.updateOrderStatus(order.id, status)
      await load()
    } catch (e) {
      onError(e.message)
    }
  }

  const remove = async (order) => {
    if (!confirm(`¿Borrar el pedido #${order.id} de ${order.customer_name}?`)) return
    try {
      await api.admin.deleteOrder(order.id)
      await load()
    } catch (e) {
      onError(e.message)
    }
  }

  const visible = orders.filter((o) => filter === 'todos' || o.status === filter)

  return (
    <Panel
      title={`Pedidos (${orders.length})`}
      action={
        <div className="flex flex-wrap gap-1">
          <FilterChip label="Todos" active={filter === 'todos'} onClick={() => setFilter('todos')} />
          {STATUSES.map((s) => (
            <FilterChip
              key={s.value}
              label={s.label}
              active={filter === s.value}
              onClick={() => setFilter(s.value)}
            />
          ))}
        </div>
      }
    >
      {!visible.length && (
        <p className="text-sm text-cream-dim">
          {orders.length ? 'No hay pedidos con ese estado.' : 'Todavía no entró ningún pedido.'}
        </p>
      )}

      <div className="space-y-3">
        {visible.map((order) => (
          <article key={order.id} className="rounded-2xl border border-ink-line p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: colorOf(order.status) }}
                  />
                  <p className="display text-xl">{order.customer_name}</p>
                  <span className="font-mono text-xs text-cream-dim">#{order.id}</span>
                </div>
                <p className="mt-1 text-xs text-cream-dim">
                  {new Date(order.created_at).toLocaleString('es-AR', { hour12: false })}
                  {order.phone && ` · ${order.phone}`}
                  {order.delivery_date && ` · entrega ${order.delivery_date}`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <p className="display text-2xl">{money(order.total)}</p>
                <select
                  value={order.status}
                  onChange={(e) => changeStatus(order, e.target.value)}
                  className="rounded-full border border-ink-line bg-ink px-3 py-1.5 text-xs outline-none focus:border-rosa"
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value} className="bg-ink">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <ul className="mt-4 space-y-2 border-t border-ink-line pt-4 text-sm">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4">
                  <span className="min-w-0">
                    <span className="text-cream-dim">{item.quantity} ×</span> {item.title}
                    {item.detail && (
                      <span className="mt-0.5 block text-xs text-cream-dim">{item.detail}</span>
                    )}
                  </span>
                  <span className="shrink-0 tabular-nums text-cream-dim">
                    {money(item.unit_price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            {order.notes && (
              <p className="mt-3 rounded-xl bg-ink px-4 py-3 text-sm text-cream-dim">
                {order.notes}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {order.phone && (
                <a
                  href={`https://wa.me/${order.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-ink-line px-4 py-2 text-sm transition-colors hover:border-rosa"
                >
                  Escribirle
                </a>
              )}
              <Button variant="danger" onClick={() => remove(order)}>
                Borrar
              </Button>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  )
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
        active ? 'bg-rosa text-ink' : 'text-cream-dim hover:text-cream'
      }`}
    >
      {label}
    </button>
  )
}
