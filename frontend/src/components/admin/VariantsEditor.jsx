import { useEffect, useRef, useState } from 'react'
import { api, money } from '../../lib/api'
import { Button } from './ui'

/**
 * Tamaños de un producto (porción, mediana, grande...) con su precio.
 * Cada cambio se guarda al momento, no espera al botón Guardar del producto.
 */
export default function VariantsEditor({ product, onError, onChange }) {
  const [variants, setVariants] = useState(product.variants ?? [])
  const [busy, setBusy] = useState(false)
  const timers = useRef({})

  useEffect(() => {
    const pendientes = timers.current
    return () => Object.values(pendientes).forEach(clearTimeout)
  }, [])

  const refrescar = (lista) => {
    setVariants(lista)
    onChange?.(lista)
  }

  const agregar = async () => {
    setBusy(true)
    try {
      const nuevo = await api.admin.createVariant({
        product_id: product.id,
        name: 'Nuevo tamaño',
        serves: '',
        price: 0,
        active: true,
        position: variants.length + 1,
      })
      refrescar([...variants, nuevo])
    } catch (e) {
      onError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const guardar = async (variant) => {
    clearTimeout(timers.current[variant.id])
    try {
      await api.admin.updateVariant(variant.id, {
        name: variant.name,
        serves: variant.serves,
        price: Number(variant.price) || 0,
        active: variant.active,
        position: Number(variant.position) || 0,
      })
    } catch (e) {
      onError(e.message)
    }
  }

  const editar = (id, campo, valor) => {
    const lista = variants.map((v) => (v.id === id ? { ...v, [campo]: valor } : v))
    refrescar(lista)

    // Guardado automático: si cierra la ventana sin salir del campo, no se pierde.
    clearTimeout(timers.current[id])
    timers.current[id] = setTimeout(() => {
      guardar(lista.find((v) => v.id === id))
    }, 800)
  }

  /** Mueve un tamaño arriba o abajo. El primero es el que ve el cliente al entrar. */
  const mover = async (index, direccion) => {
    const destino = index + direccion
    if (destino < 0 || destino >= variants.length) return

    const lista = [...variants]
    ;[lista[index], lista[destino]] = [lista[destino], lista[index]]
    const renumerada = lista.map((v, i) => ({ ...v, position: i + 1 }))
    refrescar(renumerada)

    try {
      await Promise.all(
        renumerada.map((v) => api.admin.updateVariant(v.id, { position: v.position })),
      )
    } catch (e) {
      onError(e.message)
    }
  }

  const borrar = async (variant) => {
    if (!confirm(`¿Eliminar el tamaño "${variant.name}"?`)) return
    try {
      await api.admin.deleteVariant(variant.id)
      refrescar(variants.filter((v) => v.id !== variant.id))
    } catch (e) {
      onError(e.message)
    }
  }

  if (!product.id) {
    return (
      <p className="text-sm text-cream-dim">
        Guardá el producto primero y después vas a poder cargarle los tamaños.
      </p>
    )
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm">Tamaños y precios</p>
          <p className="text-xs text-cream-dim">
            {variants.length
              ? 'El cliente elige uno en la tarjeta. El primero es el que se muestra al entrar.'
              : 'Sin tamaños, el producto se vende con el precio único de arriba.'}
          </p>
        </div>
        <Button variant="ghost" onClick={agregar} disabled={busy}>
          + Agregar tamaño
        </Button>
      </div>

      {variants.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_1fr_110px_auto] gap-2 px-1 text-[11px] text-cream-dim">
            <span>Nombre</span>
            <span>Aclaración</span>
            <span>Precio</span>
            <span />
          </div>

          {variants.map((variant, index) => (
            <div
              key={variant.id}
              className="grid grid-cols-[1fr_1fr_110px_auto] items-center gap-2"
            >
              <input
                value={variant.name}
                onChange={(e) => editar(variant.id, 'name', e.target.value)}
                onBlur={() => guardar(variant)}
                placeholder="Mediana"
                className="rounded-xl border border-ink-line bg-ink px-3 py-2 text-sm outline-none focus:border-rosa"
              />
              <input
                value={variant.serves}
                onChange={(e) => editar(variant.id, 'serves', e.target.value)}
                onBlur={() => guardar(variant)}
                placeholder="18 porciones"
                className="rounded-xl border border-ink-line bg-ink px-3 py-2 text-sm outline-none focus:border-rosa"
              />
              <input
                type="number"
                value={variant.price}
                onChange={(e) => editar(variant.id, 'price', e.target.value)}
                onBlur={() => guardar(variant)}
                className="rounded-xl border border-ink-line bg-ink px-3 py-2 text-sm tabular-nums outline-none focus:border-rosa"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => mover(index, -1)}
                  disabled={index === 0}
                  title="Subir"
                  className="rounded-lg border border-ink-line px-2 py-1 text-xs text-cream-dim transition-colors hover:text-cream disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => mover(index, 1)}
                  disabled={index === variants.length - 1}
                  title="Bajar"
                  className="rounded-lg border border-ink-line px-2 py-1 text-xs text-cream-dim transition-colors hover:text-cream disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => borrar(variant)}
                  className="px-2 text-xs text-cereza underline-offset-4 hover:underline"
                >
                  borrar
                </button>
              </div>
            </div>
          ))}

          <p className="pt-1 text-xs text-cream-dim">
            Se ve así:{' '}
            {variants
              .map((v) => `${v.name} ${money(Number(v.price) || 0)}`)
              .join('  ·  ')}
          </p>
        </div>
      )}
    </div>
  )
}
