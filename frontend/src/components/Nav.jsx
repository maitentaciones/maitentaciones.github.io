import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useStore } from '../store/StoreContext'

const LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/catalogo', label: 'Vitrina' },
  { to: '/personalizar', label: 'Armá tu torta' },
  { to: '/nosotros', label: 'Nosotros' },
]

export default function Nav() {
  const { count, setCartOpen, shop } = useStore()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [location.pathname])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? 'backdrop-blur-xl' : ''
      }`}
      style={{
        backgroundColor: scrolled ? 'rgba(13,10,11,0.82)' : 'transparent',
        borderBottom: `1px solid ${scrolled ? 'var(--color-ink-line)' : 'transparent'}`,
      }}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 md:px-10">
        <Link to="/" className="group flex items-center gap-3">
          <span className="relative flex h-9 w-9 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-rosa transition-transform duration-500 group-hover:scale-110" />
            <span className="relative font-display text-lg font-semibold text-ink">
              {shop.shop_name?.charAt(0) ?? 'M'}
            </span>
          </span>
          <span className="display text-xl tracking-tight">
            {shop.shop_name}
            <span className="text-cream-dim">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative rounded-full px-4 py-2 text-sm transition-colors ${
                  isActive ? 'text-cream' : 'text-cream-dim hover:text-cream'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute inset-0 rounded-full border border-ink-line bg-ink-card" />
                  )}
                  <span className="relative">{link.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="group relative flex items-center gap-2 rounded-full border border-ink-line bg-ink-card px-4 py-2 text-sm transition-colors hover:border-rosa"
          >
            <span>Pedido</span>
            <span
              className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold transition-colors ${
                count > 0 ? 'bg-rosa text-ink' : 'bg-ink-line text-cream-dim'
              }`}
            >
              {count}
            </span>
          </button>

          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-line md:hidden"
          >
            <span className="relative block h-3 w-4">
              <span
                className={`absolute left-0 block h-px w-4 bg-cream transition-transform duration-300 ${
                  open ? 'top-1.5 rotate-45' : 'top-0'
                }`}
              />
              <span
                className={`absolute left-0 block h-px w-4 bg-cream transition-transform duration-300 ${
                  open ? 'top-1.5 -rotate-45' : 'top-3'
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Menú mobile */}
      <div
        className={`overflow-hidden border-t border-ink-line bg-ink/95 backdrop-blur-xl transition-[max-height] duration-500 md:hidden ${
          open ? 'max-h-80' : 'max-h-0 border-t-0'
        }`}
      >
        <nav className="flex flex-col px-5 py-3">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="border-b border-ink-line py-3 text-lg last:border-0"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
