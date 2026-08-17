import { useEffect, useMemo, useState } from 'react'
import CakePreview from '../components/CakePreview'
import { api, money } from '../lib/api'
import { useStore } from '../store/StoreContext'

/**
 * Armador de tortas: un paso por grupo de opciones.
 * La torta de la izquierda y el precio se recalculan con cada elección.
 */
export default function Personalizar() {
  const { addItem } = useStore()
  const [groups, setGroups] = useState([])
  const [selection, setSelection] = useState({}) // { groupId: [optionId] }
  const [step, setStep] = useState(0)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .customizer()
      .then((data) => {
        setGroups(data)
        // Preseleccionamos la primera opción de cada paso obligatorio para que
        // la torta se vea completa desde el arranque.
        const initial = {}
        data.forEach((g) => {
          if (g.required && g.options.length) initial[g.id] = [g.options[0].id]
        })
        setSelection(initial)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const optionById = useMemo(() => {
    const map = new Map()
    groups.forEach((g) => g.options.forEach((o) => map.set(o.id, { ...o, group: g })))
    return map
  }, [groups])

  const chosen = (groupId) => selection[groupId] ?? []

  /** Cuántas veces está elegida una opción (en los pasos de varias, puede repetirse). */
  const countOf = (groupId, optionId) => chosen(groupId).filter((id) => id === optionId).length

  const toggle = (group, option) => {
    setSelection((prev) => {
      const current = prev[group.id] ?? []
      if (group.kind === 'single') {
        // En un paso obligatorio siempre queda una opción elegida.
        if (current.includes(option.id)) return group.required ? prev : { ...prev, [group.id]: [] }
        return { ...prev, [group.id]: [option.id] }
      }
      if (current.includes(option.id)) {
        // Quitamos una sola de sus repeticiones, no todas.
        const ultima = current.lastIndexOf(option.id)
        return {
          ...prev,
          [group.id]: [...current.slice(0, ultima), ...current.slice(ultima + 1)],
        }
      }
      if (current.length >= group.max_choices) {
        // Al llegar al tope, la nueva elección reemplaza a la más antigua.
        return { ...prev, [group.id]: [...current.slice(1), option.id] }
      }
      return { ...prev, [group.id]: [...current, option.id] }
    })
  }

  /**
   * El ×2 de una opción: la pide dos veces. Si ya no queda cupo, desplaza a la
   * otra elegida, porque pedir "este dos veces" implica dejar solo este.
   * Si ya estaba duplicada, vuelve a una.
   */
  const alternarRepetir = (group, option) => {
    setSelection((prev) => {
      const current = prev[group.id] ?? []
      const veces = current.filter((id) => id === option.id).length

      if (veces > 1) {
        const ultima = current.lastIndexOf(option.id)
        return {
          ...prev,
          [group.id]: [...current.slice(0, ultima), ...current.slice(ultima + 1)],
        }
      }

      if (current.length < group.max_choices) {
        return { ...prev, [group.id]: [...current, option.id] }
      }

      const otro = current.findIndex((id) => id !== option.id)
      if (otro === -1) return prev
      const sinElOtro = [...current.slice(0, otro), ...current.slice(otro + 1)]
      return { ...prev, [group.id]: [...sinElOtro, option.id] }
    })
  }

  const total = useMemo(() => {
    let sum = 0
    groups.forEach((g) => {
      chosen(g.id).forEach((id) => {
        const opt = optionById.get(id)
        if (opt) sum += opt.price_delta
      })
    })
    return sum
  }, [groups, selection, optionById])

  const missing = groups.filter((g) => g.required && chosen(g.id).length === 0)

  // --- Datos para el dibujo ---
  const baseGroup = groups.find((g) => g.is_base_price)
  const sizeIndex = baseGroup
    ? Math.max(0, baseGroup.options.findIndex((o) => chosen(baseGroup.id).includes(o.id)))
    : 0

  const findGroup = (slug) => groups.find((g) => g.slug === slug)
  const swatchesOf = (slug) => {
    const g = findGroup(slug)
    if (!g) return []
    return chosen(g.id)
      .map((id) => optionById.get(id))
      .filter(Boolean)
  }

  const sponge = swatchesOf('bizcochuelo')[0]
  const fillings = swatchesOf('relleno')
  const coat = swatchesOf('cobertura')[0]
  const decorations = [...swatchesOf('decoracion'), ...swatchesOf('extras')]

  /** Nombres de lo elegido en un paso, con las repeticiones como "Dulce de leche ×2". */
  const elegidosDe = (groupId) => {
    const veces = new Map()
    chosen(groupId).forEach((id) => veces.set(id, (veces.get(id) ?? 0) + 1))

    return [...veces.entries()]
      .map(([id, cantidad]) => {
        const nombre = optionById.get(id)?.name
        if (!nombre) return null
        return cantidad > 1 ? `${nombre} ×${cantidad}` : nombre
      })
      .filter(Boolean)
  }

  const summaryParts = groups
    .map((g) => {
      const names = elegidosDe(g.id)
      return names.length ? `${g.name}: ${names.join(' + ')}` : null
    })
    .filter(Boolean)

  const addToCart = () => {
    const detail = [...summaryParts, message ? `Dedicatoria: "${message}"` : null]
      .filter(Boolean)
      .join(' · ')
    addItem({
      title: 'Torta personalizada',
      detail,
      unit_price: total,
      accent: 'rosa',
    })
  }

  if (loading) {
    return <div className="px-5 pt-40 text-cream-dim md:px-10">Preparando el armador…</div>
  }
  if (error) {
    return (
      <div className="px-5 pt-40 text-cereza md:px-10">
        No pudimos cargar las opciones: {error}. ¿Está corriendo el backend?
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1500px] px-5 pb-32 pt-28 md:px-10 md:pt-36">
      <div className="mb-10">
        <p className="eyebrow mb-4">A medida</p>
        <h1 className="display max-w-2xl text-[clamp(2.4rem,7vw,5rem)] font-light leading-[0.95]">
          Armá tu torta <span className="italic text-rosa">capa por capa</span>
        </h1>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-start">
        {/* ---------- Vista previa (queda a la vista mientras se eligen las opciones) ---------- */}
        <div className="sticky top-[72px] z-20 lg:top-28">
          <div className="relative overflow-hidden rounded-[32px] border border-ink-line bg-gradient-to-b from-ink-card to-ink-soft p-4 backdrop-blur-xl">
            <div className="h-[32vh] lg:aspect-square lg:h-auto">
              <CakePreview
                sizeIndex={sizeIndex}
                spongeColor={sponge?.swatch ?? '#f4e4c1'}
                fillingColors={fillings.map((f) => f.swatch)}
                coating={{ name: coat?.name ?? '', color: coat?.swatch ?? '#f3e3d7' }}
                decorations={decorations}
                message={message}
              />
            </div>

            <div className="flex items-end justify-between border-t border-ink-line px-3 pt-4">
              <div>
                <p className="eyebrow">Precio estimado</p>
                <p className="display mt-1 text-3xl text-rosa lg:text-4xl">{money(total)}</p>
              </div>
              <p className="hidden max-w-[45%] text-right text-[11px] leading-tight text-cream-dim sm:block">
                Se confirma por WhatsApp según fecha y disponibilidad
              </p>
            </div>
          </div>

          <div className="mt-4 hidden rounded-2xl border border-ink-line bg-ink-card p-4 lg:block">
            <p className="eyebrow mb-3">Tu combinación</p>
            <ul className="space-y-1.5 text-sm text-cream-dim">
              {summaryParts.length ? (
                summaryParts.map((part) => <li key={part}>· {part}</li>)
              ) : (
                <li>Empezá eligiendo el tamaño.</li>
              )}
            </ul>
          </div>
        </div>

        {/* ---------- Pasos ---------- */}
        <div className="space-y-4">
          {groups.map((group, index) => {
            const isOpen = step === index
            const picked = elegidosDe(group.id)

            return (
              <section
                key={group.id}
                className={`overflow-hidden rounded-[28px] border transition-colors duration-400 ${
                  isOpen ? 'border-rosa/40 bg-ink-card' : 'border-ink-line bg-ink-soft'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setStep(isOpen ? -1 : index)}
                  className="flex w-full items-center gap-4 px-6 py-5 text-left"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs transition-colors ${
                      picked.length ? 'bg-rosa text-ink' : 'border border-ink-line text-cream-dim'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="display block text-xl">
                      {group.name}
                      {!group.required && (
                        <span className="ml-2 align-middle text-xs text-cream-dim">opcional</span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-cream-dim">
                      {picked.length ? picked.join(' + ') : group.helper}
                    </span>
                  </span>

                  <span
                    className={`text-cream-dim transition-transform duration-400 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    ⌄
                  </span>
                </button>

                <div
                  className="grid transition-[grid-template-rows] duration-500"
                  style={{
                    gridTemplateRows: isOpen ? '1fr' : '0fr',
                    transitionTimingFunction: 'cubic-bezier(.22,1,.36,1)',
                  }}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6">
                      {group.kind === 'multi' && (
                        <p className="mb-3 text-xs text-cream-dim">
                          Podés elegir hasta {group.max_choices}. Para pedir dos capas del
                          mismo, tocá el <span className="text-rosa">×2</span> de esa opción.
                        </p>
                      )}

                      <div className="grid gap-2 sm:grid-cols-2">
                        {group.options.map((option) => {
                          const veces = countOf(group.id, option.id)
                          const selected = veces > 0
                          // El ×2 acompaña a la opción elegida, haya o no cupo libre:
                          // pedir "este dos veces" desplaza al otro si hace falta.
                          const puedeRepetir =
                            group.kind === 'multi' && selected && group.max_choices > 1

                          return (
                            <div
                              key={option.id}
                              className={`group flex items-center gap-3 rounded-2xl border p-3 transition-all duration-300 ${
                                selected
                                  ? 'border-rosa bg-rosa/10'
                                  : 'border-ink-line hover:border-cream-dim/40'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => toggle(group, option)}
                                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                              >
                                <span
                                  className="h-9 w-9 shrink-0 rounded-full ring-1 ring-inset ring-white/15 transition-transform duration-300 group-hover:scale-110"
                                  style={{ backgroundColor: option.swatch }}
                                />
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-sm">{option.name}</span>
                                  {option.description && (
                                    <span className="block truncate text-xs text-cream-dim">
                                      {option.description}
                                    </span>
                                  )}
                                </span>
                              </button>

                              <span
                                className={`shrink-0 text-xs tabular-nums ${
                                  selected ? 'text-rosa' : 'text-cream-dim'
                                }`}
                              >
                                {group.is_base_price
                                  ? money(option.price_delta)
                                  : option.price_delta > 0
                                    ? `+${money(option.price_delta * Math.max(veces, 1))}`
                                    : 'incluido'}
                              </span>

                              {puedeRepetir && (
                                <button
                                  type="button"
                                  onClick={() => alternarRepetir(group, option)}
                                  aria-pressed={veces > 1}
                                  title={
                                    veces > 1
                                      ? `Volver a una capa de ${option.name.toLowerCase()}`
                                      : `Pedir ${option.name.toLowerCase()} dos veces`
                                  }
                                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                                    veces > 1
                                      ? 'border-rosa bg-rosa font-medium text-ink'
                                      : 'border-rosa/50 text-rosa hover:bg-rosa/20'
                                  }`}
                                >
                                  ×2
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )
          })}

          {/* Dedicatoria */}
          <section className="rounded-[28px] border border-ink-line bg-ink-soft px-6 py-5">
            <label className="block">
              <span className="display block text-xl">Dedicatoria</span>
              <span className="mt-0.5 block text-sm text-cream-dim">
                Lo que va escrito en el topper. Opcional.
              </span>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 28))}
                placeholder="Feliz cumple, Mai"
                className="mt-4 w-full rounded-xl border border-ink-line bg-ink px-4 py-3 outline-none transition-colors placeholder:text-cream-dim/50 focus:border-rosa"
              />
            </label>
          </section>

          {/* Cierre */}
          <div className="sticky bottom-4 rounded-[28px] border border-ink-line bg-ink-card/95 p-5 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="eyebrow">Total</p>
                <p className="display text-3xl">{money(total)}</p>
              </div>
              <button
                type="button"
                onClick={addToCart}
                disabled={missing.length > 0}
                className="flex-1 rounded-full bg-rosa px-8 py-4 font-medium text-ink transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              >
                {missing.length
                  ? `Falta elegir: ${missing.map((g) => g.name.toLowerCase()).join(', ')}`
                  : 'Sumar al pedido'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
