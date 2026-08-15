import { useEffect, useState } from 'react'
import { api, money } from '../../lib/api'
import { ACCENT_NAMES, accentHex } from '../../lib/accents'
import { Button, Field, Modal, Panel } from './ui'

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const EMPTY = {
  name: '',
  slug: '',
  description: '',
  price: 0,
  price_unit: '',
  image_url: '',
  accent: 'rosa',
  badge: '',
  featured: false,
  active: true,
  position: 0,
  category_id: 0,
}

export default function ProductsPanel({ onError }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const [p, c] = await Promise.all([api.admin.products(), api.admin.categories()])
      setProducts(p)
      setCategories(c)
    } catch (e) {
      onError(e.message)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openNew = () =>
    setEditing({ ...EMPTY, category_id: categories[0]?.id ?? 0, position: products.length + 1 })

  const save = async () => {
    setSaving(true)
    try {
      const payload = {
        ...editing,
        slug: editing.slug || slugify(editing.name),
        price: Number(editing.price) || 0,
        position: Number(editing.position) || 0,
        category_id: Number(editing.category_id),
      }
      if (editing.id) {
        const { id, category_slug, ...body } = payload
        await api.admin.updateProduct(id, body)
      } else {
        await api.admin.createProduct(payload)
      }
      setEditing(null)
      await load()
    } catch (e) {
      onError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (product) => {
    if (!confirm(`¿Eliminar "${product.name}"? No se puede deshacer.`)) return
    try {
      await api.admin.deleteProduct(product.id)
      await load()
    } catch (e) {
      onError(e.message)
    }
  }

  const toggle = async (product, field) => {
    try {
      await api.admin.updateProduct(product.id, { [field]: !product[field] })
      await load()
    } catch (e) {
      onError(e.message)
    }
  }

  const set = (field) => (e) => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setEditing((p) => ({ ...p, [field]: value }))
  }

  return (
    <>
      <Panel
        title={`Productos (${products.length})`}
        action={
          <Button onClick={openNew} disabled={!categories.length}>
            + Nuevo producto
          </Button>
        }
      >
        {!categories.length && (
          <p className="mb-4 text-sm text-cereza">
            Creá primero una categoría en la pestaña «Categorías».
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-ink-line text-left text-xs text-cream-dim">
                <th className="pb-3 font-normal">Producto</th>
                <th className="pb-3 font-normal">Categoría</th>
                <th className="pb-3 font-normal">Precio</th>
                <th className="pb-3 text-center font-normal">Destacado</th>
                <th className="pb-3 text-center font-normal">Visible</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-line">
              {products.map((p) => (
                <tr key={p.id} className="group">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-8 w-8 shrink-0 rounded-lg"
                        style={{ backgroundColor: accentHex(p.accent) }}
                      />
                      <div className="min-w-0">
                        <p className="truncate">{p.name}</p>
                        <p className="truncate text-xs text-cream-dim">{p.price_unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-cream-dim">{p.category_slug}</td>
                  <td className="py-3 tabular-nums">{money(p.price)}</td>
                  <td className="py-3 text-center">
                    <button type="button" onClick={() => toggle(p, 'featured')}>
                      {p.featured ? '★' : '☆'}
                    </button>
                  </td>
                  <td className="py-3 text-center">
                    <button
                      type="button"
                      onClick={() => toggle(p, 'active')}
                      className={p.active ? 'text-pistacho' : 'text-cream-dim'}
                    >
                      {p.active ? 'sí' : 'no'}
                    </button>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-2 opacity-60 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setEditing(p)}
                        className="text-xs underline-offset-4 hover:underline"
                      >
                        editar
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(p)}
                        className="text-xs text-cereza underline-offset-4 hover:underline"
                      >
                        borrar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal
        open={Boolean(editing)}
        title={editing?.id ? `Editar ${editing.name}` : 'Nuevo producto'}
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={save} disabled={saving || !editing?.name}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </>
        }
      >
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre" value={editing.name} onChange={set('name')} className="col-span-2" />
            <Field
              label="Categoría"
              as="select"
              value={editing.category_id}
              onChange={set('category_id')}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
            <Field
              label="Color de la tarjeta"
              as="select"
              value={editing.accent}
              onChange={set('accent')}
              options={ACCENT_NAMES.map((a) => ({ value: a, label: a }))}
            />
            <Field
              label="Descripción"
              as="textarea"
              value={editing.description}
              onChange={set('description')}
              className="col-span-2"
            />
            <Field label="Precio" type="number" value={editing.price} onChange={set('price')} />
            <Field
              label="A qué corresponde"
              value={editing.price_unit}
              onChange={set('price_unit')}
              placeholder="12 porciones, docena…"
            />
            <Field
              label="URL de la foto"
              value={editing.image_url}
              onChange={set('image_url')}
              placeholder="https://…"
              hint="Si la dejás vacía se usa el color de la tarjeta."
              className="col-span-2"
            />
            <Field
              label="Etiqueta"
              value={editing.badge}
              onChange={set('badge')}
              placeholder="La más pedida"
            />
            <Field label="Orden" type="number" value={editing.position} onChange={set('position')} />
            <div className="col-span-2 flex gap-8">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.featured}
                  onChange={set('featured')}
                  className="h-4 w-4 accent-[#f2c6c2]"
                />
                Mostrar en la portada
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.active}
                  onChange={set('active')}
                  className="h-4 w-4 accent-[#f2c6c2]"
                />
                Visible en la web
              </label>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
