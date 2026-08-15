import { useEffect, useState } from 'react'
import { api, money } from '../lib/api'
import { accentHex } from '../lib/accents'
import { buildOrderMessage, whatsappUrl } from '../lib/whatsapp'
import { useStore } from '../store/StoreContext'

const EMPTY_FORM = { name: '', phone: '', date: '', notes: '' }

export default function CartDrawer() {
  const { items, total, cartOpen, setCartOpen, removeItem, setQuantity, clearCart, shop } =
    useStore()
  const [form, setForm] = useState(EMPTY_FORM)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [cartOpen])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setCartOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setCartOpen])

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!items.length) return
    if (!form.name.trim()) {
      setError('Necesitamos tu nombre para tomar el pedido')
      return
    }

    setSending(true)
    setError('')

    const message = buildOrderMessage({
      shopName: shop.shop_name,
      items,
      total,
      customer: form,
    })

    // La ventana se abre antes del await: si se abre después, el navegador
    // la trata como popup no solicitado y la bloquea.
    const waWindow = window.open(whatsappUrl(shop.whatsapp_number, message), '_blank')

    try {
      await api.createOrder({
        customer_name: form.name,
        phone: form.phone,
        delivery_date: form.date,
        notes: form.notes,
        items: items.map(({ title, detail, quantity, unit_price }) => ({
          title,
          detail,
          quantity,
          unit_price,
        })),
      })
      setSent(true)
      clearCart()
      setForm(EMPTY_FORM)
    } catch (err) {
      // El pedido igual viajó por WhatsApp, así que no lo tratamos como fracaso total.
      setError(
        waWindow
          ? 'Abrimos WhatsApp con tu pedido, pero no pudimos guardarlo en la web. Mandá el mensaje igual.'
          : `No pudimos registrar el pedido: ${err.message}`,
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <div
        onClick={() => setCartOpen(false)}
        className={`fixed inset-0 z-[70] bg-ink/70 backdrop-blur-sm transition-opacity duration-400 ${
          cartOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-[80] flex h-dvh w-full max-w-[460px] flex-col border-l border-ink-line bg-ink-soft transition-transform duration-500 ${
          cartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(.22,1,.36,1)' }}
        aria-hidden={!cartOpen}
      >
        <div className="flex items-center justify-between border-b border-ink-line px-6 py-5">
          <div>
            <p className="eyebrow">Tu pedido</p>
            <h2 className="display mt-1 text-2xl">
              {items.length ? `${items.length} ${items.length === 1 ? 'ítem' : 'ítems'}` : 'Vacío'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-line text-cream-dim transition-colors hover:border-rosa hover:text-cream"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {sent && (
            <div className="mb-5 rounded-2xl border border-pistacho/40 bg-pistacho/10 p-4 text-sm">
              <p className="font-medium text-pistacho">¡Listo! Tu pedido salió por WhatsApp.</p>
              <p className="mt-1 text-cream-dim">
                Si no se abrió la app, revisá que el navegador no haya bloqueado la ventana.
              </p>
            </div>
          )}

          {!items.length && !sent && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 text-5xl">🧁</div>
              <p className="text-cream-dim">
                Todavía no elegiste nada.
                <br />
                Pasá por la vitrina o armá tu torta a medida.
              </p>
            </div>
          )}

          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.uid}
                className="surface rounded-2xl p-4"
                style={{ borderLeft: `3px solid ${accentHex(item.accent)}` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{item.title}</p>
                    {item.detail && (
                      <p className="mt-1 text-xs leading-relaxed text-cream-dim">{item.detail}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.uid)}
                    className="shrink-0 text-xs text-cream-dim underline-offset-4 hover:text-cereza hover:underline"
                  >
                    quitar
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 rounded-full border border-ink-line px-3 py-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(item.uid, item.quantity - 1)}
                      className="text-cream-dim transition-colors hover:text-cream"
                      aria-label="Restar"
                    >
                      −
                    </button>
                    <span className="w-4 text-center text-sm tabular-nums">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.uid, item.quantity + 1)}
                      className="text-cream-dim transition-colors hover:text-cream"
                      aria-label="Sumar"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-display text-lg">
                    {money(item.unit_price * item.quantity)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {items.length > 0 && (
          <form onSubmit={submit} className="border-t border-ink-line px-6 py-5">
            <div className="mb-4 flex items-baseline justify-between">
              <span className="eyebrow">Total estimado</span>
              <span className="display text-3xl">{money(total)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Tu nombre" value={form.name} onChange={update('name')} required />
              <Field label="Teléfono" value={form.phone} onChange={update('phone')} />
              <Field
                label="Fecha de entrega"
                type="date"
                value={form.date}
                onChange={update('date')}
                className="col-span-2"
              />
              <Field
                label="Aclaraciones"
                value={form.notes}
                onChange={update('notes')}
                placeholder="Alergias, horario, dirección…"
                className="col-span-2"
              />
            </div>

            {error && <p className="mt-3 text-sm text-cereza">{error}</p>}

            <button
              type="submit"
              disabled={sending}
              className="mt-4 w-full rounded-full bg-rosa py-4 font-medium text-ink transition-all hover:bg-cream disabled:opacity-60"
            >
              {sending ? 'Enviando…' : 'Enviar pedido por WhatsApp'}
            </button>
            <p className="mt-3 text-center text-xs text-cream-dim">
              Se abre WhatsApp con el detalle listo. El precio final se confirma por chat.
            </p>
          </form>
        )}
      </aside>
    </>
  )
}

function Field({ label, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs text-cream-dim">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-ink-line bg-ink px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-cream-dim/50 focus:border-rosa"
      />
    </label>
  )
}
