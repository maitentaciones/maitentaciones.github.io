import Reveal from '../components/Reveal'
import { useStore } from '../store/StoreContext'

const FAQ = [
  {
    q: '¿Con cuánta anticipación tengo que encargar?',
    a: 'Idealmente 72 horas. Para tortas de dos pisos o pedidos grandes, una semana.',
  },
  {
    q: '¿Hacen opciones sin TACC o sin lactosa?',
    a: 'Sí. El bizcochuelo sin TACC está en el armador. Para otras adaptaciones, escribinos y lo vemos.',
  },
  {
    q: '¿Cómo se paga?',
    a: 'Se toma una seña del 50% por transferencia para reservar la fecha, y el resto al retirar.',
  },
  {
    q: '¿Hacen envíos?',
    a: 'Sí, dentro de la zona, con un costo que depende de la distancia. También podés retirar.',
  },
]

export default function Nosotros() {
  const { shop } = useStore()

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-32 pt-32 md:px-10 md:pt-40">
      <Reveal>
        <p className="eyebrow mb-4">Sobre nosotros</p>
        <h1 className="display max-w-4xl text-[clamp(2.6rem,8vw,6rem)] font-light leading-[0.95]">
          Una cocina chica, <span className="italic text-rosa">todo a mano</span>
        </h1>
      </Reveal>

      <div className="mt-16 grid gap-14 md:grid-cols-2">
        <Reveal delay={100}>
          <p className="text-xl leading-relaxed text-cream-dim">
            {shop.shop_name} nació de hacer tortas para los cumpleaños de la familia hasta
            que dejaron de alcanzar. Hoy seguimos igual: producción chica, ingredientes de
            verdad y cada pedido armado a mano.
          </p>
          <p className="mt-6 leading-relaxed text-cream-dim">
            No trabajamos con premezclas ni con stock congelado. Cada torta se hornea para
            la fecha en la que la vas a comer, y por eso tomamos una cantidad limitada de
            encargos por semana.
          </p>
        </Reveal>

        <Reveal delay={200} className="grid grid-cols-2 gap-px overflow-hidden rounded-[28px] border border-ink-line bg-ink-line">
          {[
            { n: 'Manteca', d: 'de verdad, nunca margarina' },
            { n: '72 h', d: 'de anticipación mínima' },
            { n: '100%', d: 'horneado el día anterior' },
            { n: 'Sin TACC', d: 'en zona separada' },
          ].map((stat) => (
            <div key={stat.n} className="bg-ink-card p-6">
              <p className="display text-2xl text-rosa">{stat.n}</p>
              <p className="mt-2 text-sm text-cream-dim">{stat.d}</p>
            </div>
          ))}
        </Reveal>
      </div>

      <section className="mt-28">
        <Reveal>
          <h2 className="display text-[clamp(2rem,5vw,3.6rem)] font-light">Preguntas frecuentes</h2>
        </Reveal>
        <div className="mt-10 divide-y divide-ink-line border-y border-ink-line">
          {FAQ.map((item, i) => (
            <Reveal key={item.q} delay={i * 90}>
              <details className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
                  <span className="display text-xl md:text-2xl">{item.q}</span>
                  <span className="shrink-0 text-cream-dim transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-2xl leading-relaxed text-cream-dim">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal className="mt-24 rounded-[32px] border border-ink-line bg-ink-card p-10 text-center md:p-16">
        <h2 className="display text-[clamp(2rem,5vw,3.4rem)] font-light">
          ¿Hablamos de tu <span className="italic text-rosa">próxima torta</span>?
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={`https://wa.me/${shop.whatsapp_number}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-rosa px-8 py-4 font-medium text-ink transition-colors hover:bg-cream"
          >
            WhatsApp
          </a>
          {shop.instagram_user && (
            <a
              href={`https://instagram.com/${shop.instagram_user}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-ink-line px-8 py-4 font-medium transition-colors hover:border-rosa"
            >
              @{shop.instagram_user}
            </a>
          )}
        </div>
      </Reveal>
    </div>
  )
}
