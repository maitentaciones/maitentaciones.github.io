import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import Reveal from '../components/Reveal'
import CakePreview from '../components/CakePreview'
import { api } from '../lib/api'
import { useStore } from '../store/StoreContext'

const MARQUEE = [
  'tortas clásicas',
  'a medida',
  'cookies',
  'bizcochuelos',
  'sin TACC',
  'mesa dulce',
  'hecho a mano',
]

export default function Home() {
  const { shop } = useStore()
  const [featured, setFeatured] = useState([])
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.3 })

  useEffect(() => {
    api.products('?featured=true').then(setFeatured).catch(() => {})
  }, [])

  useEffect(() => {
    const onMove = (e) =>
      setPointer({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="relative flex min-h-dvh flex-col justify-center overflow-hidden px-5 pt-28 pb-16 md:px-10">
        {/* Luz que sigue al cursor */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 transition-transform duration-700 ease-out"
          style={{
            background: `radial-gradient(38rem 32rem at ${pointer.x * 100}% ${
              pointer.y * 100
            }%, rgba(242,198,194,0.13), transparent 65%)`,
          }}
        />
        <div className="pointer-events-none absolute -left-40 top-20 -z-10 h-96 w-96 rounded-full bg-cacao/10 blur-[120px]" />
        <div className="pointer-events-none absolute -right-32 bottom-10 -z-10 h-96 w-96 rounded-full bg-cereza/10 blur-[120px]" />

        <div className="mx-auto w-full max-w-[1400px]">
          <Reveal>
            <p className="eyebrow mb-6">Pastelería artesanal · a pedido</p>
          </Reveal>

          <h1 className="display text-[clamp(3.2rem,13vw,11rem)] font-light">
            <Reveal delay={60}>
              <span className="block">Recién</span>
            </Reveal>
            <Reveal delay={160}>
              <span className="block pl-[8vw] italic text-rosa">horneado,</span>
            </Reveal>
            <Reveal delay={260}>
              <span className="block text-right md:text-left md:pl-[26vw]">recién tuyo.</span>
            </Reveal>
          </h1>

          <div className="mt-14 grid gap-10 md:grid-cols-[1.1fr_auto] md:items-end">
            <Reveal delay={340}>
              <p className="max-w-md text-lg leading-relaxed text-cream-dim">
                Nada se hornea antes de tiempo. Elegí una clásica con el precio a la
                vista, o armá la tuya desde el bizcochuelo hasta la última flor.
              </p>
            </Reveal>

            <Reveal delay={420} className="flex flex-wrap gap-3">
              <Link
                to="/personalizar"
                className="group relative overflow-hidden rounded-full bg-rosa px-8 py-4 font-medium text-ink"
              >
                <span className="relative z-10">Armá tu torta</span>
                <span className="absolute inset-0 origin-left scale-x-0 bg-cream transition-transform duration-500 group-hover:scale-x-100" />
              </Link>
              <Link
                to="/catalogo"
                className="rounded-full border border-ink-line px-8 py-4 font-medium transition-colors hover:border-rosa hover:text-rosa"
              >
                Ver la vitrina
              </Link>
            </Reveal>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
          <span className="text-[10px] uppercase tracking-[0.3em] text-cream-dim">scroll</span>
          <span className="h-12 w-px bg-gradient-to-b from-cream-dim to-transparent" />
        </div>
      </section>

      {/* ---------------- Marquee ---------------- */}
      <section className="overflow-hidden border-y border-ink-line py-5">
        <div className="flex w-max animate-marquee">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center">
              {MARQUEE.map((word) => (
                <span key={word} className="flex items-center">
                  <span className="display px-7 text-3xl font-light md:text-4xl">{word}</span>
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-rosa align-middle" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Destacados ---------------- */}
      <section className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <p className="eyebrow mb-4">01 — La vitrina</p>
            <h2 className="display max-w-xl text-[clamp(2.2rem,5.5vw,4.4rem)] font-light">
              Las clásicas, con <span className="italic text-rosa">precio a la vista</span>
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <Link
              to="/catalogo"
              className="group flex items-center gap-2 text-sm text-cream-dim transition-colors hover:text-cream"
            >
              Ver todo el catálogo
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </Reveal>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product, i) => (
            <Reveal key={product.id} delay={i * 90} className="h-full">
              <ProductCard product={product} index={i} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- Personalizador ---------------- */}
      <section className="relative overflow-hidden border-y border-ink-line bg-ink-soft">
        <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-5 py-24 md:grid-cols-2 md:px-10 md:py-32">
          <Reveal>
            <p className="eyebrow mb-4">02 — A medida</p>
            <h2 className="display text-[clamp(2.2rem,5.5vw,4.4rem)] font-light leading-[0.95]">
              Elegí cada capa.
              <br />
              <span className="italic text-rosa">Mirá cómo queda.</span>
            </h2>
            <p className="mt-6 max-w-md leading-relaxed text-cream-dim">
              Tamaño, bizcochuelo, hasta dos rellenos, cobertura y decoración. El dibujo se
              actualiza con cada elección y el precio también, así no hay sorpresas.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                'Precio en vivo, sin esperar presupuesto',
                'Hasta dos rellenos combinados',
                'El resumen te llega por WhatsApp tal cual lo armaste',
              ].map((line, i) => (
                <li key={line} className="flex items-start gap-3 text-sm text-cream-dim">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rosa" />
                  {line}
                </li>
              ))}
            </ul>

            <Link
              to="/personalizar"
              className="mt-9 inline-flex rounded-full bg-cream px-8 py-4 font-medium text-ink transition-colors hover:bg-rosa"
            >
              Empezar a armarla
            </Link>
          </Reveal>

          <Reveal delay={160} className="relative">
            <div className="absolute inset-0 rounded-[40px] bg-gradient-to-b from-rosa/10 to-transparent blur-2xl" />
            <div className="relative mx-auto aspect-square w-full max-w-md">
              <CakePreview
                sizeIndex={2}
                spongeColor="#6b4a3a"
                fillingColors={['#b07a4e', '#f5efe3']}
                coating={{ name: 'Drip de chocolate', color: '#f3e3d7' }}
                decorations={[{ name: 'Flores naturales' }, { name: 'Frutas frescas' }]}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Cómo funciona ---------------- */}
      <section className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <Reveal>
          <p className="eyebrow mb-4">03 — Cómo es el paso a paso</p>
        </Reveal>
        <div className="grid gap-px overflow-hidden rounded-[28px] border border-ink-line bg-ink-line md:grid-cols-3">
          {[
            {
              n: '01',
              t: 'Elegís',
              d: 'De la vitrina o armando tu torta desde cero, con el precio siempre a la vista.',
            },
            {
              n: '02',
              t: 'Nos escribís',
              d: 'El pedido llega por WhatsApp con todo el detalle. Confirmamos fecha y seña.',
            },
            {
              n: '03',
              t: 'La buscás',
              d: 'Retiro coordinado o envío a domicilio dentro de la zona.',
            },
          ].map((step, i) => (
            <Reveal key={step.n} delay={i * 110} className="bg-ink-card p-8 md:p-10">
              <span className="display text-5xl text-rosa/40">{step.n}</span>
              <h3 className="display mt-6 text-2xl">{step.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-cream-dim">{step.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- CTA final ---------------- */}
      <section className="border-t border-ink-line px-5 py-24 md:px-10 md:py-32">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="eyebrow mb-6">¿Tenés una fecha en mente?</p>
          <h2 className="display text-[clamp(2.4rem,8vw,6rem)] font-light leading-[0.95]">
            Contanos qué <span className="italic text-rosa">estás festejando</span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-cream-dim">
            Escribinos y lo pensamos juntos. Los encargos se toman con 72 horas de
            anticipación.
          </p>
          <a
            href={`https://wa.me/${shop.whatsapp_number}`}
            target="_blank"
            rel="noreferrer"
            className="mt-10 inline-flex rounded-full bg-rosa px-10 py-5 text-lg font-medium text-ink transition-colors hover:bg-cream"
          >
            Escribir por WhatsApp
          </a>
        </Reveal>
      </section>
    </>
  )
}
