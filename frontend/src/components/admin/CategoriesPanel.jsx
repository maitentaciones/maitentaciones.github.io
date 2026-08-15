import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Button, Field, Modal, Panel } from './ui'

const EMPTY = { slug: '', name: '', tagline: '', position: 0, active: true }

export default function CategoriesPanel({ onError }) {
  const [categories, setCategories] = useState([])
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => api.admin.categories().then(setCategories).catch((e) => onError(e.message))

  useEffect(() => {
    load()
  }, [])

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setEditing((c) => ({ ...c, [field]: value }))
  }

  const save = async () => {
    setSaving(true)
    try {
      const payload = { ...editing, position: Number(editing.position) || 0 }
      if (editing.id) {
        const { id, ...body } = payload
        await api.admin.updateCategory(id, body)
      } else {
        await api.admin.createCategory(payload)
      }
      setEditing(null)
      await load()
    } catch (e) {
      onError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (category) => {
    if (
      !confirm(`¿Eliminar la categoría "${category.name}"? Se borran también sus productos.`)
    )
      return
    try {
      await api.admin.deleteCategory(category.id)
      await load()
    } catch (e) {
      onError(e.message)
    }
  }

  return (
    <>
      <Panel
        title={`Categorías (${categories.length})`}
        action={<Button onClick={() => setEditing({ ...EMPTY, position: categories.length + 1 })}>+ Nueva</Button>}
      >
        <ul className="divide-y divide-ink-line">
          {categories.map((c) => (
            <li key={c.id} className="group flex items-center gap-4 py-3">
              <span className="font-mono text-xs text-cream-dim">{c.position}</span>
              <div className="min-w-0 flex-1">
                <p>
                  {c.name}
                  {!c.active && <span className="ml-2 text-xs text-cream-dim">(oculta)</span>}
                </p>
                <p className="truncate text-xs text-cream-dim">{c.tagline || c.slug}</p>
              </div>
              <div className="flex gap-2 opacity-60 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setEditing(c)}
                  className="text-xs underline-offset-4 hover:underline"
                >
                  editar
                </button>
                <button
                  type="button"
                  onClick={() => remove(c)}
                  className="text-xs text-cereza underline-offset-4 hover:underline"
                >
                  borrar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Modal
        open={Boolean(editing)}
        title={editing?.id ? 'Editar categoría' : 'Nueva categoría'}
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={save} disabled={saving || !editing?.name || !editing?.slug}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </>
        }
      >
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre" value={editing.name} onChange={set('name')} />
            <Field
              label="Slug"
              value={editing.slug}
              onChange={set('slug')}
              hint="Sin espacios ni acentos: tortas-clasicas"
            />
            <Field
              label="Bajada"
              value={editing.tagline}
              onChange={set('tagline')}
              className="col-span-2"
            />
            <Field label="Orden" type="number" value={editing.position} onChange={set('position')} />
            <label className="flex items-end gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                checked={editing.active}
                onChange={set('active')}
                className="h-4 w-4 accent-[#f2c6c2]"
              />
              Visible en la web
            </label>
          </div>
        )}
      </Modal>
    </>
  )
}
