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
  // Elección propia del piso de arriba, solo en tortas de dos pisos.
  const [selectionArriba, setSelectionArriba] = useState({})
  const [step, setStep] = useState(null)
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

  const aplicarToggle = (prev, group, option) => {
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
  }

  /**
   * El ×2 de una opción: la pide dos veces. Si ya no queda cupo, desplaza a la
   * otra elegida, porque pedir "este dos veces" implica dejar solo este.
   * Si ya estaba duplicada, vuelve a una.
   */
  const aplicarRepetir = (prev, group, option) => {
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
  }

  // Un mismo juego de acciones sirve para el piso de abajo y para el de arriba.
  const accionesDe = (setter) => ({
    toggle: (group, option) => setter((prev) => aplicarToggle(prev, group, option)),
    alternarRepetir: (group, option) => setter((prev) => aplicarRepetir(prev, group, option)),
  })

  const accionesAbajo = accionesDe(setSelection)
  const accionesArriba = accionesDe(setSelectionArriba)

  // Lo que se elige por piso en las tortas de dos pisos. El tamaño, la cobertura
  // y la decoración son de la torta entera.
  const SLUGS_PISO_ARRIBA = ['bizcochuelo', 'relleno']
  const gruposDelPisoDeArriba = useMemo(
    () => groups.filter((g) => SLUGS_PISO_ARRIBA.includes(g.slug)),
    [groups],
  )

  // --- Datos para el dibujo ---
  const baseGroup = groups.find((g) => g.is_base_price)
  const sizeIndex = baseGroup
    ? Math.max(0, baseGroup.options.findIndex((o) => chosen(baseGroup.id).includes(o.id)))
    : 0

  // Un tamaño es de dos pisos si así lo dice su nombre o su descripción, para que
  // ella pueda crear otros tamaños de dos pisos desde el panel.
  const tamanoElegido = baseGroup
    ? baseGroup.options.find((o) => chosen(baseGroup.id).includes(o.id))
    : null
  const esDosPisos = /piso/i.test(
    `${tamanoElegido?.name ?? ''} ${tamanoElegido?.description ?? ''}`,
  )

  const findGroup = (slug) => groups.find((g) => g.slug === slug)
  const swatchesOf = (slug, desde = selection) => {
    const g = findGroup(slug)
    if (!g) return []
    return (desde[g.id] ?? []).map((id) => optionById.get(id)).filter(Boolean)
  }

  const sponge = swatchesOf('bizcochuelo')[0]
  const fillings = swatchesOf('relleno')
  const coat = swatchesOf('cobertura')[0]
  const decorations = [...swatchesOf('decoracion'), ...swatchesOf('extras')]

  // En cuanto la torta es de dos pisos, cada piso se elige por separado.
  const pisoArribaActivo = esDosPisos
  const spongeArriba = swatchesOf('bizcochuelo', selectionArriba)[0]
  const fillingsArriba = swatchesOf('relleno', selectionArriba)

  const total = useMemo(() => {
    const sumar = (sel, gruposValidos) =>
      gruposValidos.reduce(
        (acc, g) =>
          acc +
          (sel[g.id] ?? []).reduce((s, id) => s + (optionById.get(id)?.price_delta ?? 0), 0),
        0,
      )

    const totalAbajo = sumar(selection, groups)
    const totalArriba = pisoArribaActivo ? sumar(selectionArriba, gruposDelPisoDeArriba) : 0
    return totalAbajo + totalArriba
  }, [groups, selection, selectionArriba, pisoArribaActivo, gruposDelPisoDeArriba, optionById])

  const missing = groups.filter((g) => g.required && chosen(g.id).length === 0)

  /**
   * Los pasos tal como se muestran. Con dos pisos, bizcochuelo y relleno se
   * desdoblan en uno para el piso de abajo y otro para el de arriba.
   */
  const pasos = useMemo(() => {
    const lista = []
    groups.forEach((g) => {
      const porPiso = esDosPisos && SLUGS_PISO_ARRIBA.includes(g.slug)
      if (porPiso) {
        lista.push({ key: `${g.id}-abajo`, group: g, piso: 'abajo' })
        lista.push({ key: `${g.id}-arriba`, group: g, piso: 'arriba' })
      } else {
        lista.push({ key: `${g.id}`, group: g, piso: null })
      }
    })
    return lista
  }, [groups, esDosPisos])

  // Al pasar a dos pisos, el de arriba arranca igual que el de abajo y desde ahí se retoca.
  useEffect(() => {
    if (!esDosPisos) return
    setSelectionArriba((prev) => {
      const copia = { ...prev }
      let cambio = false
      gruposDelPisoDeArriba.forEach((g) => {
        if (!copia[g.id]?.length) {
          copia[g.id] = [...(selection[g.id] ?? [])]
          cambio = true
        }
      })
      return cambio ? copia : prev
    })
  }, [esDosPisos, gruposDelPisoDeArriba, selection])

  /** Nombres elegidos de un paso, con las repeticiones como "Dulce de leche ×2". */
  const elegidosDe = (groupId, desde = selection) => {
    const veces = new Map()
    ;(desde[groupId] ?? []).forEach((id) => veces.set(id, (veces.get(id) ?? 0) + 1))

    return [...veces.entries()]
      .map(([id, cantidad]) => {
        const nombre = optionById.get(id)?.name
        if (!nombre) return null
        return cantidad > 1 ? `${nombre} ×${cantidad}` : nombre
      })
      .filter(Boolean)
  }

  const summaryParts = [
    ...groups
      .map((g) => {
        const names = elegidosDe(g.id)
        if (!names.length) return null
        // Solo aclaramos el piso en lo que puede diferir; el tamaño y la
        // decoración son de la torta entera.
        const seDuplica = gruposDelPisoDeArriba.some((x) => x.id === g.id)
        const etiqueta = pisoArribaActivo && seDuplica ? `${g.name} (abajo)` : g.name
        return `${etiqueta}: ${names.join(' + ')}`
      })
      .filter(Boolean),
    ...(pisoArribaActivo
      ? gruposDelPisoDeArriba
          .map((g) => {
            const names = elegidosDe(g.id, selectionArriba)
            return names.length ? `${g.name} (arriba): ${names.join(' + ')}` : null
          })
          .filter(Boolean)
      : []),
  ]

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
                tiers={esDosPisos ? 2 : 1}
                spongeColor={sponge?.swatch ?? '#f4e4c1'}
                fillingColors={fillings.map((f) => f.swatch)}
                coating={{ name: coat?.name ?? '', color: coat?.swatch ?? '#f3e3d7' }}
                topTier={
                  pisoArribaActivo
                    ? {
                        spongeColor: spongeArriba?.swatch ?? '#f4e4c1',
                        fillingColors: fillingsArriba.map((f) => f.swatch),
                      }
                    : null
                }
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
          {pasos.map((paso, index) => (
            <PasoDeOpciones
              key={paso.key}
              group={paso.group}
              numero={index + 1}
              etiquetaExtra={paso.piso ? `piso de ${paso.piso}` : ''}
              abierto={step === paso.key}
              onToggleAbierto={() => setStep(step === paso.key ? null : paso.key)}
              elegidos={(paso.piso === 'arriba' ? selectionArriba : selection)[paso.group.id] ?? []}
              acciones={paso.piso === 'arriba' ? accionesArriba : accionesAbajo}
              elegidosDe={elegidosDe}
              seleccion={paso.piso === 'arriba' ? selectionArriba : selection}
            />
          ))}

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

/**
 * Un paso del armador: la cabecera plegable y sus opciones.
 * Se usa igual para el piso de abajo y para el de arriba; lo único que cambia
 * es de qué selección lee y a qué acciones responde.
 */
function PasoDeOpciones({
  group,
  numero,
  abierto,
  onToggleAbierto,
  elegidos,
  acciones,
  elegidosDe,
  seleccion,
  etiquetaExtra = '',
}) {
  const picked = elegidosDe(group.id, seleccion)
  const vecesDe = (optionId) => elegidos.filter((id) => id === optionId).length

  return (
    <section
      className={`overflow-hidden rounded-[28px] border transition-colors duration-400 ${
        abierto ? 'border-rosa/40 bg-ink-card' : 'border-ink-line bg-ink-soft'
      }`}
    >
      <button
        type="button"
        onClick={onToggleAbierto}
        className="flex w-full items-center gap-4 px-6 py-5 text-left"
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs transition-colors ${
            picked.length ? 'bg-rosa text-ink' : 'border border-ink-line text-cream-dim'
          }`}
        >
          {String(numero).padStart(2, '0')}
        </span>

        <span className="min-w-0 flex-1">
          <span className="display block text-xl">
            {group.name}
            {etiquetaExtra && (
              <span className="ml-2 align-middle text-xs text-rosa">{etiquetaExtra}</span>
            )}
            {!group.required && !etiquetaExtra && (
              <span className="ml-2 align-middle text-xs text-cream-dim">opcional</span>
            )}
          </span>
          <span className="mt-0.5 block truncate text-sm text-cream-dim">
            {picked.length ? picked.join(' + ') : group.helper}
          </span>
        </span>

        <span
          className={`text-cream-dim transition-transform duration-400 ${
            abierto ? 'rotate-180' : ''
          }`}
        >
          ⌄
        </span>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-500"
        style={{
          gridTemplateRows: abierto ? '1fr' : '0fr',
          transitionTimingFunction: 'cubic-bezier(.22,1,.36,1)',
        }}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6">
            {group.kind === 'multi' && (
              <p className="mb-3 text-xs text-cream-dim">
                Podés elegir hasta {group.max_choices}. Para pedir dos capas del mismo, tocá
                el <span className="text-rosa">×2</span> de esa opción.
              </p>
            )}

            <div className="grid gap-2 sm:grid-cols-2">
              {group.options.map((option) => {
                const veces = vecesDe(option.id)
                const selected = veces > 0
                const puedeRepetir = group.kind === 'multi' && selected && group.max_choices > 1

                return (
                  <div
                    key={option.id}
                    className={`group flex items-center gap-3 rounded-2xl border p-3 transition-all duration-300 ${
                      selected ? 'border-rosa bg-rosa/10' : 'border-ink-line hover:border-cream-dim/40'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => acciones.toggle(group, option)}
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
                        onClick={() => acciones.alternarRepetir(group, option)}
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
}
