import { useEffect, useMemo, useState } from 'react'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'
import { api } from '../lib/api'

export default function Catalogo() {
  const [catalog, setCatalog] = useState([])
  const [active, setActive] = useState('todo')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .catalog()
      .then(setCatalog)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    return catalog
      .filter((cat) => active === 'todo' || cat.slug === active)
      .map((cat) => ({
        ...cat,
        products: cat.products.filter(
          (p) =>
            !term ||
            p.name.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term),
        ),
      }))
      .filter((cat) => cat.products.length > 0)
  }, [catalog, active, query])

  const totalShown = visible.reduce((n, c) => n + c.products.length, 0)

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-28 pt-32 md:px-10 md:pt-40">
      <Reveal>
        <p className="eyebrow mb-4">La vitrina</p>
        <h1 className="display max-w-3xl text-[clamp(2.6rem,8vw,6rem)] font-light leading-[0.95]">
          Todo lo que sale <span className="italic text-rosa">del horno</span>
        </h1>
      </Reveal>

      <div className="sticky top-[68px] z-30 -mx-5 mt-12 border-b border-ink-line bg-ink/95 px-5 py-3 backdrop-blur-xl md:-mx-10 md:px-10">
        <div className="flex items-center gap-3">
          {/* En pantallas chicas los rubros se desplazan de costado en una sola fila. */}
          <div className="-mx-1 flex flex-1 gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] md:flex-wrap md:overflow-visible md:pb-0">
            <Tab label="Todo" active={active === 'todo'} onClick={() => setActive('todo')} />
            {catalog.map((cat) => (
              <Tab
                key={cat.slug}
                label={cat.name}
                active={active === cat.slug}
                onClick={() => setActive(cat.slug)}
              />
            ))}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar…"
            className="w-28 shrink-0 rounded-full border border-ink-line bg-ink-card px-4 py-2 text-sm outline-none transition-colors placeholder:text-cream-dim/60 focus:border-rosa sm:w-44"
          />
        </div>
      </div>

      {loading && <p className="mt-16 text-cream-dim">Cargando la vitrina…</p>}
      {error && (
        <p className="mt-16 text-cereza">
          No pudimos cargar el catálogo: {error}. ¿Está corriendo el backend?
        </p>
      )}
      {!loading && !error && totalShown === 0 && (
        <p className="mt-16 text-cream-dim">No encontramos nada con ese nombre.</p>
      )}

      <div className="mt-14 space-y-24">
        {visible.map((cat) => (
          <section key={cat.id} id={cat.slug}>
            <div className="mb-8 flex items-baseline gap-5 border-b border-ink-line pb-4">
              <h2 className="display text-3xl md:text-4xl">{cat.name}</h2>
              <p className="hidden text-sm text-cream-dim sm:block">{cat.tagline}</p>
              <span className="ml-auto font-mono text-xs text-cream-dim">
                {String(cat.products.length).padStart(2, '0')}
              </span>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cat.products.map((product, i) => (
                <Reveal key={product.id} delay={(i % 4) * 80} className="h-full">
                  <ProductCard product={product} index={i} />
                </Reveal>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function Tab({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors ${
        active ? 'bg-rosa text-ink' : 'text-cream-dim hover:bg-ink-card hover:text-cream'
      }`}
    >
      {label}
    </button>
  )
}
