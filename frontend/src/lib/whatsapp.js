import { money } from './api'

/** Arma el texto del pedido tal como le llega a ella por WhatsApp. */
export function buildOrderMessage({ shopName, items, total, customer }) {
  const lines = [`*Nuevo pedido — ${shopName}*`, '']

  items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.quantity} × ${item.title}`)
    if (item.detail) {
      item.detail.split(' · ').forEach((part) => lines.push(`   • ${part}`))
    }
    lines.push(`   ${money(item.unit_price * item.quantity)}`)
    lines.push('')
  })

  lines.push(`*Total estimado: ${money(total)}*`, '')
  lines.push(`Nombre: ${customer.name || '—'}`)
  if (customer.phone) lines.push(`Teléfono: ${customer.phone}`)
  if (customer.date) lines.push(`Fecha de entrega: ${customer.date}`)
  if (customer.notes) lines.push(`Aclaraciones: ${customer.notes}`)

  return lines.join('\n')
}

export function whatsappUrl(number, message) {
  const clean = (number || '').replace(/\D/g, '')
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
}
