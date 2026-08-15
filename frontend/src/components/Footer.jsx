import { Link } from 'react-router-dom'
import { IS_STATIC } from '../lib/api'
import { useStore } from '../store/StoreContext'

export default function Footer() {
  const { shop } = useStore()

  return (
    <footer className="border-t border-ink-line px-5 py-14 md:px-10">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <p className="display text-3xl">{shop.shop_name}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream-dim">
              Pastelería artesanal a pedido. Tortas, cookies y mesas dulces hechas a mano.
            </p>
          </div>

          <nav className="flex flex-col gap-2 text-sm">
            <p className="eyebrow mb-2">Navegar</p>
            <Link to="/catalogo" className="text-cream-dim hover:text-cream">Vitrina</Link>
            <Link to="/personalizar" className="text-cream-dim hover:text-cream">Armá tu torta</Link>
            <Link to="/nosotros" className="text-cream-dim hover:text-cream">Nosotros</Link>
            {!IS_STATIC && (
              <Link to="/admin" className="text-cream-dim hover:text-cream">Panel</Link>
            )}
          </nav>

          <div className="flex flex-col gap-2 text-sm">
            <p className="eyebrow mb-2">Contacto</p>
            <a
              href={`https://wa.me/${shop.whatsapp_number}`}
              target="_blank"
              rel="noreferrer"
              className="text-cream-dim hover:text-cream"
            >
              WhatsApp
            </a>
            {shop.instagram_user && (
              <a
                href={`https://instagram.com/${shop.instagram_user}`}
                target="_blank"
                rel="noreferrer"
                className="text-cream-dim hover:text-cream"
              >
                @{shop.instagram_user}
              </a>
            )}
            {shop.contact_email && (
              <a href={`mailto:${shop.contact_email}`} className="text-cream-dim hover:text-cream">
                {shop.contact_email}
              </a>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-ink-line pt-6 text-xs text-cream-dim">
          <p>
            © {new Date().getFullYear()} {shop.shop_name}
          </p>
          <p>Los precios publicados son orientativos y se confirman al encargar.</p>
        </div>
      </div>
    </footer>
  )
}
