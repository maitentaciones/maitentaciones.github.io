import { useId } from 'react'

/**
 * Ilustración vectorial de cada producto, para la vitrina mientras no haya foto.
 * Cuando se carga una foto desde el panel, la foto manda y esto deja de mostrarse.
 *
 * Cada producto elige una forma base y su paleta. Si aparece un producto nuevo sin
 * receta propia, cae en la forma que le corresponde a su categoría.
 */

const SHAPE_BY_CATEGORY = {
  'tortas-clasicas': 'torta',
  cookies: 'cookie',
  bizcochuelos: 'bizcochuelo',
  'mesa-dulce': 'cupcake',
}

// masa   = bizcocho o base
// crema  = relleno entre capas
// baño   = superficie exterior
const RECIPES = {
  chocotorta: {
    shape: 'torta',
    masa: '#3a2823',
    crema: '#c08a52',
    baño: '#4a332b',
    capas: 5,
    toppings: ['cacao', 'chocolate'],
  },
  'selva-negra': {
    shape: 'torta',
    masa: '#4a2f26',
    crema: '#f7f1e6',
    baño: '#f7f1e6',
    capas: 3,
    toppings: ['cerezas', 'chocolate'],
  },
  'lemon-pie': {
    shape: 'tarta',
    masa: '#d9ab6a',
    crema: '#ecd75f',
    baño: '#f6edd9',
    toppings: ['merengue'],
  },
  'torta-rogel': {
    shape: 'torta',
    masa: '#e7c99a',
    crema: '#b87a42',
    baño: '#f6edd9',
    capas: 7,
    toppings: ['merengue'],
  },
  'red-velvet': {
    shape: 'torta',
    masa: '#a5303a',
    crema: '#f7f1e6',
    baño: '#f5ece0',
    capas: 3,
    toppings: ['migas'],
  },
  'cheesecake-frutos-rojos': {
    shape: 'tarta',
    masa: '#4a3328',
    crema: '#f3e9d8',
    baño: '#f3e9d8',
    toppings: ['salsa', 'berries'],
  },
  'carrot-cake': {
    shape: 'torta',
    masa: '#c8853f',
    crema: '#f5efe3',
    baño: '#f5efe3',
    capas: 3,
    toppings: ['nueces'],
  },
  tiramisu: {
    shape: 'torta',
    masa: '#e0c79c',
    crema: '#f3e6cd',
    baño: '#f3e6cd',
    capas: 5,
    toppings: ['cacao'],
  },

  'cookies-chips': { shape: 'cookie', masa: '#cf9d5f', chips: '#3f2a20' },
  'alfajores-maicena': { shape: 'alfajor', masa: '#f0dfb8', crema: '#b87a42' },
  'cookies-red-velvet': { shape: 'cookie', masa: '#a5303a', chips: '#f7f1e6' },
  'cookies-pistacho': { shape: 'cookie', masa: '#c2c489', chips: '#7e9152' },

  'bizcochuelo-vainilla': { shape: 'bizcochuelo', masa: '#f0dcae' },
  'bizcochuelo-chocolate': { shape: 'bizcochuelo', masa: '#5c3d31' },
  'bizcochuelo-sin-tacc': { shape: 'bizcochuelo', masa: '#e6d6bd' },

  cupcakes: { shape: 'cupcake', masa: '#c98f5e', crema: '#f2c6c2', toppings: ['granas'] },
  'cake-pops': { shape: 'pop', masa: '#4a332b', toppings: ['granas'] },
  brownies: { shape: 'cuadrado', masa: '#4a332b', toppings: ['nueces'] },
}

const DEFAULTS = {
  masa: '#e0c79c',
  crema: '#c08a52',
  baño: '#f3e3d7',
  chips: '#3f2a20',
  capas: 3,
  toppings: [],
}

export default function ProductArt({ product, accent = '#f2c6c2' }) {
  const uid = useId().replace(/:/g, '')
  const recipe = {
    ...DEFAULTS,
    shape: SHAPE_BY_CATEGORY[product.category_slug] ?? 'torta',
    ...(RECIPES[product.slug] ?? {}),
  }

  return (
    <svg
      viewBox="0 0 200 150"
      className="h-full w-full"
      role="img"
      aria-label={`Ilustración de ${product.name}`}
    >
      <defs>
        <radialGradient id={`halo-${uid}`} cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.3" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`vol-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000" stopOpacity="0.2" />
          <stop offset="40%" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.26" />
        </linearGradient>
      </defs>

      <rect width="200" height="150" fill={`url(#halo-${uid})`} />
      <ellipse cx="100" cy="126" rx="46" ry="7" fill="#000" opacity="0.22" />

      {recipe.shape === 'torta' && <Torta r={recipe} uid={uid} />}
      {recipe.shape === 'tarta' && <Tarta r={recipe} uid={uid} />}
      {recipe.shape === 'cookie' && <Cookie r={recipe} />}
      {recipe.shape === 'alfajor' && <Alfajor r={recipe} />}
      {recipe.shape === 'bizcochuelo' && <Bizcochuelo r={recipe} uid={uid} />}
      {recipe.shape === 'cupcake' && <Cupcake r={recipe} uid={uid} />}
      {recipe.shape === 'pop' && <Pop r={recipe} />}
      {recipe.shape === 'cuadrado' && <Cuadrado r={recipe} uid={uid} />}
    </svg>
  )
}

/* --- Formas ---------------------------------------------------------------- */

function Torta({ r, uid }) {
  const x = 58
  const w = 84
  const top = 52
  const h = 68
  // Alternamos bizcocho y relleno; con más capas, cada una es más fina.
  const bands = []
  const unit = h / (r.capas * 2 - 1)
  for (let i = 0; i < r.capas * 2 - 1; i += 1) {
    bands.push({
      y: top + i * unit,
      h: unit + 0.4,
      fill: i % 2 === 0 ? r.masa : r.crema,
    })
  }

  return (
    <g>
      {/* Lado izquierdo cubierto, lado derecho con el corte a la vista */}
      <rect x={x} y={top} width={w} height={h} rx={3} fill={r.baño} />
      <g clipPath={`url(#cut-${uid})`}>
        {bands.map((b, i) => (
          <rect key={i} x={x} y={b.y} width={w} height={b.h} fill={b.fill} />
        ))}
      </g>
      <defs>
        <clipPath id={`cut-${uid}`}>
          <rect x={100} y={top - 2} width={w} height={h + 4} />
        </clipPath>
      </defs>
      <rect x={99} y={top} width={2} height={h} fill="#000" opacity="0.18" />
      <rect x={x} y={top} width={w} height={h} rx={3} fill={`url(#vol-${uid})`} />

      <ellipse cx={100} cy={top} rx={w / 2} ry={9} fill={r.baño} />
      <ellipse cx={100} cy={top} rx={w / 2} ry={9} fill="#fff" opacity="0.12" />
      <path
        d={`M 100 ${top} L ${x + w} ${top - 3.5} A ${w / 2} 9 0 0 1 ${100 + w * 0.05} ${top + 8.9} Z`}
        fill={r.masa}
        opacity="0.85"
      />

      <Toppings list={r.toppings} cx={100} cy={top - 3} rx={w / 2} ry={9} />
    </g>
  )
}

function Tarta({ r, uid }) {
  const x = 54
  const w = 92
  const top = 74
  const h = 40

  return (
    <g>
      {/* Molde de masa: se ensancha hacia arriba */}
      <path
        d={`M ${x} ${top} L ${x + w} ${top} L ${x + w - 8} ${top + h} L ${x + 8} ${top + h} Z`}
        fill={r.masa}
      />
      <path
        d={`M ${x} ${top} L ${x + w} ${top} L ${x + w - 8} ${top + h} L ${x + 8} ${top + h} Z`}
        fill={`url(#vol-${uid})`}
      />
      {/* Relleno */}
      <rect x={x + 3} y={top - 9} width={w - 6} height={11} rx={2} fill={r.crema} />
      <ellipse cx={100} cy={top - 9} rx={(w - 6) / 2} ry={5} fill={r.crema} />
      <ellipse cx={100} cy={top - 9} rx={(w - 6) / 2} ry={5} fill="#fff" opacity="0.1" />
      {/* Borde de masa */}
      <ellipse cx={100} cy={top} rx={w / 2} ry={6} fill="none" stroke={r.masa} strokeWidth="6" />

      <Toppings list={r.toppings} cx={100} cy={top - 12} rx={(w - 14) / 2} ry={5} baño={r.baño} />
    </g>
  )
}

function Cookie({ r }) {
  // Borde apenas irregular para que no parezca un círculo perfecto.
  const chips = [
    [-18, -10], [4, -16], [18, -4], [-8, 4], [10, 10], [-20, 12], [24, 14], [-2, -3],
  ]
  return (
    <g transform="translate(100 84)">
      <circle r="40" fill={r.masa} />
      <circle r="40" fill="#000" opacity="0.06" transform="translate(3 3)" />
      <circle r="40" fill={r.masa} />
      <circle r="34" fill="#fff" opacity="0.07" />
      {chips.map(([cx, cy], i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx={4.6 - (i % 3) * 0.6}
          ry={3.8 - (i % 3) * 0.5}
          fill={r.chips}
          transform={`rotate(${i * 37} ${cx} ${cy})`}
        />
      ))}
      <circle r="40" fill="none" stroke="#000" strokeOpacity="0.18" strokeWidth="2" />
    </g>
  )
}

function Alfajor({ r }) {
  return (
    <g transform="translate(100 84)">
      {/* Tapa de abajo, relleno y tapa de arriba */}
      <ellipse cy={20} rx={36} ry={11} fill={r.masa} />
      <rect x={-36} y={2} width={72} height={18} fill={r.crema} />
      <ellipse cy={2} rx={36} ry={11} fill={r.masa} />
      <ellipse cy={-16} rx={36} ry={11} fill={r.masa} />
      <rect x={-36} y={-16} width={72} height={18} fill={r.masa} />
      <ellipse cy={-16} rx={36} ry={11} fill="#fff" opacity="0.12" />
      {/* Coco en el borde del relleno */}
      {Array.from({ length: 16 }).map((_, i) => (
        <circle
          key={i}
          cx={-34 + i * 4.5}
          cy={11 + ((i * 7) % 5)}
          r={1.6}
          fill="#f7f1e6"
          opacity="0.9"
        />
      ))}
    </g>
  )
}

function Bizcochuelo({ r, uid }) {
  const x = 56
  const w = 88
  const top = 58
  const h = 58

  return (
    <g>
      <rect x={x} y={top} width={w} height={h} rx={3} fill={r.masa} />
      {/* Las dos marcas de corte: viene listo para rellenar */}
      <rect x={x} y={top + h / 3} width={w} height={1.6} fill="#000" opacity="0.16" />
      <rect x={x} y={top + (h / 3) * 2} width={w} height={1.6} fill="#000" opacity="0.16" />
      <rect x={x} y={top} width={w} height={h} rx={3} fill={`url(#vol-${uid})`} />
      <ellipse cx={100} cy={top} rx={w / 2} ry={10} fill={r.masa} />
      <ellipse cx={100} cy={top} rx={w / 2} ry={10} fill="#fff" opacity="0.14" />
      <ellipse cx={100} cy={top} rx={w / 2 - 10} ry={6} fill="#000" opacity="0.07" />
    </g>
  )
}

function Cupcake({ r, uid }) {
  return (
    <g transform="translate(100 0)">
      {/* Pirotín */}
      <path d="M -30 78 L 30 78 L 22 120 L -22 120 Z" fill={r.masa} />
      <path d="M -30 78 L 30 78 L 22 120 L -22 120 Z" fill={`url(#vol-${uid})`} />
      {Array.from({ length: 5 }).map((_, i) => (
        <rect key={i} x={-24 + i * 11} y={80} width={3} height={38} fill="#000" opacity="0.12" />
      ))}
      {/* Copete en tres vueltas */}
      <ellipse cy={74} rx={32} ry={12} fill={r.crema} />
      <ellipse cy={62} rx={26} ry={12} fill={r.crema} />
      <ellipse cy={62} rx={26} ry={12} fill="#fff" opacity="0.08" />
      <ellipse cy={50} rx={19} ry={11} fill={r.crema} />
      <ellipse cy={40} rx={11} ry={9} fill={r.crema} />
      <ellipse cy={40} rx={11} ry={9} fill="#fff" opacity="0.12" />
      <Toppings list={r.toppings} cx={0} cy={46} rx={22} ry={8} />
    </g>
  )
}

function Pop({ r }) {
  return (
    <g transform="translate(100 0)">
      <rect x={-2} y={72} width={4} height={48} rx={2} fill="#e6d6bd" />
      <circle cy={64} r={32} fill={r.masa} />
      <circle cy={64} r={32} fill="#fff" opacity="0.08" />
      <ellipse cx={-11} cy={52} rx={8} ry={5} fill="#fff" opacity="0.16" />
      <Toppings list={r.toppings} cx={0} cy={48} rx={23} ry={8} />
    </g>
  )
}

function Cuadrado({ r }) {
  // Porción cortada, vista en perspectiva: tapa, frente y costado.
  const top = 'M 100 48 L 148 66 L 100 84 L 52 66 Z'
  const front = 'M 52 66 L 100 84 L 100 114 L 52 96 Z'
  const side = 'M 100 84 L 148 66 L 148 96 L 100 114 Z'

  return (
    <g>
      <path d={front} fill={r.masa} />
      <path d={front} fill="#000" opacity="0.12" />
      <path d={side} fill={r.masa} />
      <path d={side} fill="#000" opacity="0.3" />
      <path d={top} fill={r.masa} />
      <path d={top} fill="#fff" opacity="0.14" />
      {/* Migas de la superficie */}
      {Array.from({ length: 9 }).map((_, i) => {
        const angle = i * 2.399
        const radius = Math.sqrt((i + 0.5) / 9)
        return (
          <ellipse
            key={i}
            cx={100 + Math.cos(angle) * radius * 34}
            cy={66 + Math.sin(angle) * radius * 12}
            rx={2.4}
            ry={1.6}
            fill="#000"
            opacity="0.18"
          />
        )
      })}
      <Toppings list={r.toppings} cx={100} cy={66} rx={30} ry={9} />
    </g>
  )
}

/* --- Terminaciones de arriba ------------------------------------------------ */

function Toppings({ list = [], cx, cy, rx, ry = 8, baño = '#f6edd9' }) {
  // Reparte a lo largo del frente de la superficie, siguiendo su curva.
  const onSurface = (i, total, depth = 0.5) => {
    const t = total === 1 ? 0 : (i / (total - 1)) * 2 - 1
    const spread = t * 0.8
    return [cx + spread * rx, cy + Math.sqrt(Math.max(0, 1 - spread * spread)) * ry * depth]
  }
  // Polvo y migas: puntos repartidos dentro de la superficie, sin alinearse.
  const dust = (i, total) => {
    const angle = i * 2.399
    const radius = Math.sqrt((i + 0.5) / total)
    return [cx + Math.cos(angle) * radius * rx * 0.86, cy + Math.sin(angle) * radius * ry * 0.9]
  }

  return (
    <g>
      {list.includes('merengue') && (
        <g>
          {/* Capa de merengue con sus picos quemados */}
          <ellipse cx={cx} cy={cy + 2} rx={rx + 3} ry={ry + 3} fill={baño} />
          {Array.from({ length: 6 }).map((_, i) => {
            const [px, py] = onSurface(i, 6, 0.55)
            const ancho = rx / 7
            return (
              <g key={`m${i}`}>
                <path
                  d={`M ${px - ancho} ${py + 2} Q ${px - ancho * 0.4} ${py - 15} ${px + ancho * 0.5} ${py - 11} Q ${px + ancho * 0.6} ${py - 2} ${px + ancho} ${py + 2} Z`}
                  fill={baño}
                />
                <path
                  d={`M ${px - ancho * 0.5} ${py - 8} Q ${px - ancho * 0.2} ${py - 14} ${px + ancho * 0.5} ${py - 11}`}
                  stroke="#c9924f"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.55"
                />
              </g>
            )
          })}
        </g>
      )}

      {list.includes('salsa') && (
        <path
          d={`M ${cx - rx} ${cy + 2} q ${rx / 3} 7 ${(rx * 2) / 3} 0 q ${rx / 3} -7 ${(rx * 2) / 3} 0 L ${cx + rx} ${cy - 4} L ${cx - rx} ${cy - 4} Z`}
          fill="#8e2c3f"
        />
      )}

      {list.includes('cerezas') &&
        [0, 1, 2, 3].map((i) => {
          const [px, py] = onSurface(i, 4)
          return (
            <g key={`c${i}`}>
              <path
                d={`M ${px} ${py - 4} q 4 -8 9 -9`}
                stroke="#6b8f4e"
                strokeWidth="1.4"
                fill="none"
              />
              <circle cx={px} cy={py} r={5.5} fill="#a5202f" />
              <circle cx={px - 1.8} cy={py - 1.8} r={1.6} fill="#fff" opacity="0.4" />
            </g>
          )
        })}

      {list.includes('berries') &&
        [0, 1, 2, 3, 4].map((i) => {
          const [px, py] = onSurface(i, 5)
          return (
            <circle
              key={`b${i}`}
              cx={px}
              cy={py - 2 + (i % 2) * 3}
              r={4.4}
              fill={i % 2 ? '#8e2c3f' : '#c2453f'}
            />
          )
        })}

      {list.includes('nueces') &&
        [0, 1, 2, 3, 4].map((i) => {
          const [px, py] = onSurface(i, 5)
          return (
            <g key={`n${i}`} transform={`translate(${px} ${py}) rotate(${i * 40})`}>
              <ellipse rx={5} ry={4} fill="#b4834f" />
              <path d="M -4 0 q 4 -3 8 0" stroke="#7d5732" strokeWidth="1" fill="none" />
            </g>
          )
        })}

      {list.includes('chocolate') &&
        [0, 1, 2, 3, 4, 5].map((i) => {
          const [px, py] = onSurface(i, 6, 0.6)
          return (
            <rect
              key={`ch${i}`}
              x={px - 2}
              y={py - 8}
              width={4}
              height={11}
              rx={1}
              fill="#2f1f19"
              transform={`rotate(${i * 22 - 55} ${px} ${py})`}
            />
          )
        })}

      {list.includes('cacao') &&
        Array.from({ length: 26 }).map((_, i) => {
          const [px, py] = dust(i, 26)
          return <circle key={`d${i}`} cx={px} cy={py} r={1.1} fill="#3a2823" opacity="0.5" />
        })}

      {list.includes('migas') &&
        Array.from({ length: 16 }).map((_, i) => {
          const [px, py] = dust(i, 16)
          return <circle key={`g${i}`} cx={px} cy={py} r={1.7} fill="#a5303a" opacity="0.7" />
        })}

      {list.includes('granas') &&
        Array.from({ length: 14 }).map((_, i) => {
          const [px, py] = dust(i, 14)
          return (
            <rect
              key={`s${i}`}
              x={px - 2}
              y={py - 1}
              width={4}
              height={1.8}
              rx={0.9}
              fill={['#f2c6c2', '#e8dc8a', '#b8c9a0', '#cdbfe4'][i % 4]}
              transform={`rotate(${i * 31} ${px} ${py})`}
            />
          )
        })}
    </g>
  )
}
