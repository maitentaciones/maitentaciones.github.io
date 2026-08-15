import { useRef, useState } from 'react'
import ProductArt from './ProductArt'
import { money } from '../lib/api'
import { accentHex } from '../lib/accents'
import { useStore } from '../store/StoreContext'

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useStore()
  const ref = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const accent = accentHex(product.accent)

  const onMove = (e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: py * -6, y: px * 8 })
  }

  return (
    <article
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-ink-line bg-ink-card transition-colors duration-500 hover:border-transparent"
      style={{
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 400ms cubic-bezier(.22,1,.36,1), border-color 400ms',
      }}
    >
      {/* Halo del sabor */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[28px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(120% 90% at 50% 0%, ${accent}33, transparent 70%)` }}
      />

      <div className="relative aspect-[4/3] overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div
            className="h-full w-full transition-transform duration-700 group-hover:scale-105"
            style={{
              background: `linear-gradient(150deg, ${accent}22, ${accent}08 60%, transparent)`,
            }}
          >
            <ProductArt product={product} accent={accent} />
          </div>
        )}

        {product.badge && (
          <span
            className="absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-medium tracking-wide text-ink"
            style={{ backgroundColor: accent }}
          >
            {product.badge}
          </span>
        )}

        <span className="absolute right-4 top-4 font-mono text-[11px] text-cream-dim">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col p-5">
        <div className="mb-5">
          <h3 className="display text-2xl leading-tight">{product.name}</h3>
          {product.description && (
            <p className="mt-2 text-sm leading-relaxed text-cream-dim">{product.description}</p>
          )}
        </div>

        {/* mt-auto deja el precio pegado abajo: todas las tarjetas cortan a la misma altura */}
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-ink-line pt-4">
          <div>
            <p className="display text-2xl" style={{ color: accent }}>
              {money(product.price)}
            </p>
            {product.price_unit && (
              <p className="text-xs text-cream-dim">{product.price_unit}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              addItem({
                title: product.name,
                detail: product.price_unit,
                unit_price: product.price,
                accent: product.accent,
              })
            }
            className="rounded-full border border-ink-line px-4 py-2 text-sm transition-colors"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = accent
              e.currentTarget.style.borderColor = accent
              e.currentTarget.style.color = '#0d0a0b'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = ''
              e.currentTarget.style.borderColor = ''
              e.currentTarget.style.color = ''
            }}
          >
            Agregar
          </button>
        </div>
      </div>
    </article>
  )
}
