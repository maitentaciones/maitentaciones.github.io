import { useId } from 'react'

/**
 * Dibuja la torta que el cliente está armando.
 * Todo sale de las opciones elegidas: el color de las capas es el bizcochuelo,
 * las franjas internas son los rellenos y la superficie exterior la cobertura.
 * Un corte lateral deja ver el interior aunque la torta esté cubierta.
 */

const TIERS = [
  { w: 150, h: 96, tiers: 1 },
  { w: 172, h: 112, tiers: 1 },
  { w: 196, h: 128, tiers: 1 },
  { w: 210, h: 150, tiers: 2 },
]

const darken = (hex, amount = 0.18) => {
  const n = hex.replace('#', '')
  const full = n.length === 3 ? n.split('').map((c) => c + c).join('') : n
  const num = parseInt(full, 16)
  const r = Math.max(0, ((num >> 16) & 255) * (1 - amount))
  const g = Math.max(0, ((num >> 8) & 255) * (1 - amount))
  const b = Math.max(0, (num & 255) * (1 - amount))
  return `rgb(${r | 0}, ${g | 0}, ${b | 0})`
}

/** Reparte el alto de un piso en capas de bizcocho separadas por relleno. */
function armarCapas(top, alto, spongeColor, fillingColors) {
  const fills = fillingColors.length ? fillingColors : ['#b07a4e']
  const layerCount = fills.length + 1
  const fillH = Math.min(9, alto / (layerCount * 3))
  const spongeH = (alto - fills.length * fillH) / layerCount

  const capas = []
  let y = top
  for (let i = 0; i < layerCount; i += 1) {
    capas.push({ type: 'sponge', y, h: spongeH, color: spongeColor })
    y += spongeH
    if (i < fills.length) {
      capas.push({ type: 'fill', y, h: fillH, color: fills[i] })
      y += fillH
    }
  }
  return capas
}

export default function CakePreview({
  sizeIndex = 0,
  spongeColor = '#f4e4c1',
  fillingColors = ['#b07a4e'],
  coating = { name: '', color: '#f3e3d7' },
  decorations = [],
  message = '',
  // Ingredientes propios del piso de arriba. Si no vienen, repite los de abajo.
  topTier = null,
  // Cantidad de pisos; si no se indica, sale del tamaño elegido.
  tiers: tiersProp = null,
}) {
  const uid = useId().replace(/:/g, '')
  const size = TIERS[Math.min(sizeIndex, TIERS.length - 1)] ?? TIERS[0]
  const { w, h } = size
  const tiers = tiersProp ?? size.tiers

  const cx = 160
  const baseY = 300
  const x = cx - w / 2
  const topY = baseY - h
  const ry = Math.max(12, w * 0.09)

  const coatName = (coating?.name ?? '').toLowerCase()
  const isNaked = coatName.includes('naked')
  const isDrip = coatName.includes('drip')
  const isMerengue = coatName.includes('merengue')
  const coatColor = coating?.color ?? '#f3e3d7'

  const layers = armarCapas(topY, h, spongeColor, fillingColors)

  // --- Piso de arriba: usa sus propios ingredientes o repite los de abajo ---
  const arribaAlto = 66
  const arribaTop = topY - arribaAlto
  const arribaAncho = w * 0.64
  const arribaX = cx - arribaAncho / 2
  const arribaSponge = topTier?.spongeColor ?? spongeColor
  const arribaFills = topTier?.fillingColors?.length ? topTier.fillingColors : fillingColors
  const arribaCoatName = (topTier?.coating?.name ?? coating?.name ?? '').toLowerCase()
  const arribaCoatColor = topTier?.coating?.color ?? coatColor
  const arribaNaked = arribaCoatName.includes('naked')
  const arribaCapas = armarCapas(arribaTop, arribaAlto, arribaSponge, arribaFills)

  // Cuña extraída del frente derecho: por ahí se ve el interior.
  const sliceLeft = cx
  const slicePath = `M ${sliceLeft} ${topY - 4} L ${x + w + 2} ${topY - 4} L ${x + w + 2} ${baseY + 4} L ${sliceLeft} ${baseY + 4} Z`

  // Sector de la tapa que corresponde a la porción servida.
  const wedgeOnTop = () => {
    const rx = w / 2
    const point = (deg) => {
      const rad = (deg * Math.PI) / 180
      return [cx + rx * Math.cos(rad), topY + ry * Math.sin(rad)]
    }
    const [x1, y1] = point(6)
    const [x2, y2] = point(84)
    return `M ${cx} ${topY} L ${x1} ${y1} A ${rx} ${ry} 0 0 1 ${x2} ${y2} Z`
  }

  const dripPath = () => {
    const drops = 7
    const step = w / drops
    let d = `M ${x} ${topY + 6}`
    for (let i = 0; i < drops; i += 1) {
      const sx = x + i * step
      const depth = 18 + ((i * 37) % 22)
      d += ` q ${step * 0.25} ${depth} ${step * 0.5} ${depth * 0.35} q ${step * 0.25} ${-depth * 0.35} ${step * 0.5} 0`
    }
    d += ` L ${x + w} ${topY + 6} Z`
    return d
  }

  const decorSet = new Set(decorations.map((d) => (d.name ?? '').toLowerCase()))
  const has = (needle) => [...decorSet].some((d) => d.includes(needle))

  const topSurfaceY = topY

  return (
    <svg
      viewBox="0 0 320 360"
      className="h-full w-full"
      role="img"
      aria-label="Vista previa de la torta personalizada"
    >
      <defs>
        <clipPath id={`slice-${uid}`}>
          <path d={slicePath} />
        </clipPath>
        <clipPath id={`cut-top-${uid}`}>
          <rect x={cx} y={arribaTop - 2} width={arribaAncho} height={arribaAlto + 4} />
        </clipPath>
        <linearGradient id={`shine-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity="0.22" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.28" />
        </linearGradient>
        <radialGradient id={`glow-${uid}`} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor={coatColor} stopOpacity="0.24" />
          <stop offset="100%" stopColor={coatColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx={cx} cy={230} r={140} fill={`url(#glow-${uid})`} />

      {/* Plato */}
      <ellipse cx={cx} cy={baseY + 22} rx={w * 0.8} ry={16} fill="#000" opacity="0.35" />
      <ellipse cx={cx} cy={baseY + 8} rx={w * 0.72} ry={14} fill="#2b2124" />
      <ellipse cx={cx} cy={baseY + 4} rx={w * 0.72} ry={14} fill="#3d2f33" />
      <ellipse cx={cx} cy={baseY + 4} rx={w * 0.6} ry={10} fill="#2b2124" opacity="0.7" />

      <g style={{ transition: 'transform 500ms cubic-bezier(.22,1,.36,1)' }}>
        {/* Piso superior, con su propio corte a la vista */}
        {tiers === 2 && (
          <g>
            <rect
              x={arribaX}
              y={arribaTop}
              width={arribaAncho}
              height={arribaAlto}
              rx={4}
              fill={arribaNaked ? arribaSponge : arribaCoatColor}
              style={{ transition: 'fill 400ms ease' }}
            />

            <g clipPath={`url(#cut-top-${uid})`}>
              {arribaCapas.map((capa, i) => (
                <rect
                  key={`at-${i}`}
                  x={arribaX}
                  y={capa.y}
                  width={arribaAncho}
                  height={capa.h + 0.4}
                  fill={capa.color}
                  style={{ transition: 'fill 400ms ease' }}
                />
              ))}
              <rect x={cx} y={arribaTop} width={3} height={arribaAlto} fill="#000" opacity="0.2" />
            </g>

            {arribaNaked &&
              arribaCapas
                .filter((c) => c.type === 'fill')
                .map((capa, i) => (
                  <rect
                    key={`atn-${i}`}
                    x={arribaX}
                    y={capa.y}
                    width={arribaAncho}
                    height={capa.h}
                    fill={capa.color}
                    opacity="0.95"
                  />
                ))}

            <rect
              x={arribaX}
              y={arribaTop}
              width={arribaAncho}
              height={arribaAlto}
              rx={4}
              fill={`url(#shine-${uid})`}
            />
            <ellipse
              cx={cx}
              cy={arribaTop}
              rx={arribaAncho / 2}
              ry={ry * 0.6}
              fill={arribaNaked ? arribaSponge : arribaCoatColor}
              style={{ transition: 'fill 400ms ease' }}
            />
            <ellipse
              cx={cx}
              cy={arribaTop}
              rx={arribaAncho / 2}
              ry={ry * 0.6}
              fill="#fff"
              opacity="0.12"
            />
          </g>
        )}

        {/* Cuerpo cubierto */}
        <rect
          x={x}
          y={topY}
          width={w}
          height={h}
          rx={5}
          fill={isNaked ? spongeColor : coatColor}
          style={{ transition: 'fill 400ms ease' }}
        />

        {/* Interior visible por el corte */}
        <g clipPath={`url(#slice-${uid})`}>
          {layers.map((layer, i) => (
            <rect
              key={i}
              x={x}
              y={layer.y}
              width={w}
              height={layer.h}
              fill={layer.color}
              style={{ transition: 'fill 400ms ease' }}
            />
          ))}
          <rect x={sliceLeft} y={topY} width={4} height={h} fill="#000" opacity="0.22" />
        </g>

        {/* En naked cake las capas se ven en todo el frente */}
        {isNaked &&
          layers
            .filter((l) => l.type === 'fill')
            .map((layer, i) => (
              <rect
                key={`nk-${i}`}
                x={x}
                y={layer.y}
                width={w}
                height={layer.h}
                fill={layer.color}
                opacity="0.95"
                style={{ transition: 'fill 400ms ease' }}
              />
            ))}

        {isMerengue && (
          <g>
            {Array.from({ length: 9 }).map((_, i) => (
              <ellipse
                key={i}
                cx={x + 10 + (i * (w - 20)) / 8}
                cy={topY + h / 2}
                rx={(w - 20) / 16}
                ry={h / 2}
                fill={coatColor}
                opacity={i % 2 ? 0.75 : 0.95}
              />
            ))}
          </g>
        )}

        {isDrip && <path d={dripPath()} fill={darken(coatColor, 0.05)} opacity="0.95" />}

        <rect x={x} y={topY} width={w} height={h} rx={5} fill={`url(#shine-${uid})`} />

        {/* Tapa */}
        <ellipse
          cx={cx}
          cy={topSurfaceY}
          rx={w / 2}
          ry={ry}
          fill={isNaked ? spongeColor : coatColor}
          style={{ transition: 'fill 400ms ease' }}
        />
        <ellipse cx={cx} cy={topSurfaceY} rx={w / 2} ry={ry} fill="#fff" opacity="0.1" />

        {/* Hueco de la porción que falta, sobre la tapa */}
        <path
          d={wedgeOnTop()}
          fill={darken(spongeColor, 0.42)}
          style={{ transition: 'fill 400ms ease' }}
        />
      </g>

      {/* --- Decoración ------------------------------------------------------
          Se apoya sobre el piso de arriba cuando la torta tiene dos pisos. */}
      {(() => {
        const decorY = tiers === 2 ? topY - 66 : topY
        const decorW = tiers === 2 ? w * 0.64 : w
        const at = (fraction) => cx + fraction * (decorW / 2)

        return (
          <g>
            {has('fruta') && (
              <g>
                {[-0.72, -0.34, 0.36, 0.7].map((f, i) => (
                  <circle
                    key={i}
                    cx={at(f)}
                    cy={decorY + (i % 2 ? 3 : -3)}
                    r={7}
                    fill={i % 2 ? '#c2453f' : '#8e2c3f'}
                  />
                ))}
              </g>
            )}

            {has('macaron') && (
              <g>
                {[-0.5, 0, 0.5].map((f, i) => (
                  <g key={i} transform={`translate(${at(f)} ${decorY - 8})`}>
                    <circle r={8} fill={['#ebc3d3', '#b8c9a0', '#e8dc8a'][i]} />
                    <rect x={-8} y={-2} width={16} height={3.5} fill="#fff" opacity="0.75" />
                  </g>
                ))}
              </g>
            )}

            {has('chocolate') && (
              <g>
                {Array.from({ length: 12 }).map((_, i) => (
                  <circle
                    key={i}
                    cx={at(-0.82 + (i * 0.15) % 1.64)}
                    cy={decorY - 3 + ((i * 17) % 8)}
                    r={2.4}
                    fill={['#6b4a3a', '#d7a86e', '#f2c6c2'][i % 3]}
                  />
                ))}
              </g>
            )}

            {has('flores') && (
              <g className="animate-float-slow" style={{ transformOrigin: `${cx}px ${decorY}px` }}>
                {[-0.62, 0.1, 0.62].map((f, i) => (
                  <g key={i} transform={`translate(${at(f)} ${decorY - 10})`}>
                    {[0, 72, 144, 216, 288].map((deg) => (
                      <ellipse
                        key={deg}
                        cx={0}
                        cy={-6}
                        rx={4}
                        ry={6}
                        fill={i === 1 ? '#f2c6c2' : '#e4a0b7'}
                        transform={`rotate(${deg})`}
                      />
                    ))}
                    <circle r={3} fill="#e8dc8a" />
                  </g>
                ))}
              </g>
            )}

            {has('vela') && (
              <g>
                {[-0.28, 0, 0.28].map((f, i) => (
                  <g key={i} transform={`translate(${at(f)} ${decorY - 30})`}>
                    <rect x={-2.5} y={0} width={5} height={30} rx={2} fill="#f5ede4" />
                    <rect x={-2.5} y={0} width={5} height={30} rx={2} fill="#d98088" opacity="0.45" />
                    <ellipse cx={0} cy={-5} rx={3} ry={5.5} fill="#e8dc8a">
                      <animate attributeName="ry" values="5.5;7;5.5" dur="1.4s" repeatCount="indefinite" />
                    </ellipse>
                  </g>
                ))}
              </g>
            )}

            {has('topper') && (
              <g transform={`translate(${cx} ${decorY - 62})`}>
                <rect x={-1} y={8} width={2} height={34} fill="#d4af7a" />
                <rect x={-46} y={-11} width={92} height={21} rx={10.5} fill="#d4af7a" />
                <text
                  x={0}
                  y={3.5}
                  textAnchor="middle"
                  fontFamily="Fraunces, serif"
                  fontSize={11}
                  fontStyle="italic"
                  fill="#241b1d"
                >
                  {(message || 'Feliz cumple').slice(0, 20)}
                </text>
              </g>
            )}
          </g>
        )
      })()}

    </svg>
  )
}
