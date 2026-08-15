import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CategoriesPanel from '../components/admin/CategoriesPanel'
import CustomizerPanel from '../components/admin/CustomizerPanel'
import OrdersPanel from '../components/admin/OrdersPanel'
import ProductsPanel from '../components/admin/ProductsPanel'
import { Button, Field } from '../components/admin/ui'
import { api, clearToken, getToken, IS_STATIC, setToken } from '../lib/api'

const TABS = [
  { key: 'orders', label: 'Pedidos' },
  { key: 'products', label: 'Productos' },
  { key: 'categories', label: 'Categorías' },
  { key: 'customizer', label: 'Personalizador' },
]

export default function Admin() {
  const [session, setSession] = useState(null)
  const [checking, setChecking] = useState(true)
  const [tab, setTab] = useState('orders')
  const [error, setError] = useState('')

  useEffect(() => {
    if (IS_STATIC || !getToken()) {
      setChecking(false)
      return
    }
    api
      .me()
      .then(setSession)
      .catch(() => clearToken())
      .finally(() => setChecking(false))
  }, [])

  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(''), 6000)
    return () => clearTimeout(t)
  }, [error])

  const logout = () => {
    clearToken()
    setSession(null)
  }

  if (checking) {
    return <div className="px-5 pt-40 text-cream-dim md:px-10">Verificando sesión…</div>
  }

  // En la versión publicada sin backend no hay a quién pedirle los datos.
  if (IS_STATIC) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-5 py-32">
        <div className="w-full max-w-md rounded-[28px] border border-ink-line bg-ink-card p-8 text-center">
          <p className="eyebrow mb-3">Panel</p>
          <h1 className="display text-3xl">El panel corre en casa</h1>
          <p className="mt-4 text-sm leading-relaxed text-cream-dim">
            Esta es la versión publicada de la web, que muestra el catálogo tal como estaba
            al momento de subirla. Para cargar productos, precios y fotos hay que abrir el
            panel en la computadora donde está el proyecto y volver a publicar.
          </p>
          <Link
            to="/"
            className="mt-7 inline-flex rounded-full bg-rosa px-7 py-3 font-medium text-ink transition-colors hover:bg-cream"
          >
            Volver a la vitrina
          </Link>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Login onLogin={setSession} />
  }

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-32 pt-32 md:px-10 md:pt-36">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">Panel</p>
          <h1 className="display text-[clamp(2rem,5vw,3.4rem)] font-light">
            Hola de nuevo
          </h1>
          <p className="mt-2 text-sm text-cream-dim">{session.email}</p>
        </div>
        <Button variant="ghost" onClick={logout}>
          Cerrar sesión
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-1 rounded-full border border-ink-line bg-ink-card p-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-full px-5 py-2 text-sm transition-colors ${
              tab === t.key ? 'bg-rosa text-ink' : 'text-cream-dim hover:text-cream'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-cereza/40 bg-cereza/10 px-5 py-3 text-sm text-cereza">
          {error}
        </div>
      )}

      {tab === 'orders' && <OrdersPanel onError={setError} />}
      {tab === 'products' && <ProductsPanel onError={setError} />}
      {tab === 'categories' && <CategoriesPanel onError={setError} />}
      {tab === 'customizer' && <CustomizerPanel onError={setError} />}
    </div>
  )
}

function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await api.login(form.email.trim().toLowerCase(), form.password)
      setToken(data.access_token)
      onLogin({ email: data.email })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-32">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-[28px] border border-ink-line bg-ink-card p-8"
      >
        <p className="eyebrow mb-3">Acceso privado</p>
        <h1 className="display text-3xl">Panel de pedidos</h1>
        <p className="mt-2 text-sm text-cream-dim">
          Desde acá se cargan productos, precios y se ven los encargos.
        </p>

        <div className="mt-7 space-y-4">
          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            autoComplete="username"
          />
          <Field
            label="Contraseña"
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            autoComplete="current-password"
          />
        </div>

        {error && <p className="mt-4 text-sm text-cereza">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-rosa py-3.5 font-medium text-ink transition-colors hover:bg-cream disabled:opacity-60"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
