// En dev, Vite proxea /api al backend (ver vite.config.js).
// En producción se puede apuntar a otro host con VITE_API_URL.
const BASE = import.meta.env.VITE_API_URL ?? ''

// Modo estático (GitHub Pages y cualquier hosting sin backend): el catálogo viaja
// congelado en archivos JSON que genera `python -m app.export_static`.
// El pedido igual funciona porque sale por WhatsApp, que no necesita servidor.
export const IS_STATIC = import.meta.env.VITE_STATIC === '1'

const TOKEN_KEY = 'admin_token'

const staticFile = async (name) => {
  const res = await fetch(`${import.meta.env.BASE_URL}data/${name}.json`)
  if (!res.ok) throw new Error(`No pudimos leer los datos publicados (${name})`)
  return res.json()
}

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && auth) {
    clearToken()
    throw new Error('Sesión vencida, volvé a entrar')
  }
  if (!res.ok) {
    let detail = `Error ${res.status}`
    try {
      const data = await res.json()
      if (typeof data.detail === 'string') detail = data.detail
      else if (Array.isArray(data.detail)) detail = data.detail[0]?.msg ?? detail
    } catch {
      /* respuesta sin cuerpo JSON */
    }
    throw new Error(detail)
  }
  if (res.status === 204) return null
  return res.json()
}

const staticApi = {
  shop: () => staticFile('shop'),
  catalog: () => staticFile('catalog'),
  customizer: () => staticFile('customizer'),
  products: async (params = '') => {
    const catalog = await staticFile('catalog')
    const todos = catalog.flatMap((c) => c.products)
    const query = new URLSearchParams(params.replace(/^\?/, ''))
    const categoria = query.get('category')
    const destacados = query.get('featured')
    return todos
      .filter((p) => !categoria || p.category_slug === categoria)
      .filter((p) => destacados === null || String(p.featured) === destacados)
  },
  // Sin backend no hay dónde guardarlo: el pedido viaja por WhatsApp igual.
  createOrder: async () => null,
}

export const api = {
  shop: () => (IS_STATIC ? staticApi.shop() : request('/api/shop')),
  catalog: () => (IS_STATIC ? staticApi.catalog() : request('/api/catalog')),
  products: (params = '') =>
    IS_STATIC ? staticApi.products(params) : request(`/api/products${params}`),
  customizer: () => (IS_STATIC ? staticApi.customizer() : request('/api/customizer')),
  createOrder: (payload) =>
    IS_STATIC ? staticApi.createOrder() : request('/api/orders', { method: 'POST', body: payload }),

  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/api/auth/me', { auth: true }),

  admin: {
    categories: () => request('/api/admin/categories', { auth: true }),
    createCategory: (b) => request('/api/admin/categories', { method: 'POST', body: b, auth: true }),
    updateCategory: (id, b) =>
      request(`/api/admin/categories/${id}`, { method: 'PATCH', body: b, auth: true }),
    deleteCategory: (id) =>
      request(`/api/admin/categories/${id}`, { method: 'DELETE', auth: true }),

    createVariant: (b) => request('/api/admin/variants', { method: 'POST', body: b, auth: true }),
    updateVariant: (id, b) =>
      request(`/api/admin/variants/${id}`, { method: 'PATCH', body: b, auth: true }),
    deleteVariant: (id) => request(`/api/admin/variants/${id}`, { method: 'DELETE', auth: true }),

    products: () => request('/api/admin/products', { auth: true }),
    createProduct: (b) => request('/api/admin/products', { method: 'POST', body: b, auth: true }),
    updateProduct: (id, b) =>
      request(`/api/admin/products/${id}`, { method: 'PATCH', body: b, auth: true }),
    deleteProduct: (id) => request(`/api/admin/products/${id}`, { method: 'DELETE', auth: true }),

    groups: () => request('/api/admin/option-groups', { auth: true }),
    createGroup: (b) =>
      request('/api/admin/option-groups', { method: 'POST', body: b, auth: true }),
    updateGroup: (id, b) =>
      request(`/api/admin/option-groups/${id}`, { method: 'PATCH', body: b, auth: true }),
    deleteGroup: (id) =>
      request(`/api/admin/option-groups/${id}`, { method: 'DELETE', auth: true }),

    createOption: (b) => request('/api/admin/options', { method: 'POST', body: b, auth: true }),
    updateOption: (id, b) =>
      request(`/api/admin/options/${id}`, { method: 'PATCH', body: b, auth: true }),
    deleteOption: (id) => request(`/api/admin/options/${id}`, { method: 'DELETE', auth: true }),

    orders: () => request('/api/admin/orders', { auth: true }),
    updateOrderStatus: (id, status) =>
      request(`/api/admin/orders/${id}`, { method: 'PATCH', body: { status }, auth: true }),
    deleteOrder: (id) => request(`/api/admin/orders/${id}`, { method: 'DELETE', auth: true }),
  },
}

export const money = (value) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value ?? 0)
