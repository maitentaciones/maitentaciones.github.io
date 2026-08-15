import { useEffect, useState } from 'react'
import { api, money } from '../../lib/api'
import { Button, Field, Modal, Panel } from './ui'

const EMPTY_OPTION = {
  name: '',
  description: '',
  price_delta: 0,
  swatch: '#e8b4b8',
  image_url: '',
  active: true,
  position: 0,
  group_id: 0,
}

const EMPTY_GROUP = {
  slug: '',
  name: '',
  helper: '',
  kind: 'single',
  required: true,
  max_choices: 1,
  is_base_price: false,
  position: 0,
  active: true,
}

export default function CustomizerPanel({ onError }) {
  const [groups, setGroups] = useState([])
  const [option, setOption] = useState(null)
  const [group, setGroup] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => api.admin.groups().then(setGroups).catch((e) => onError(e.message))

  useEffect(() => {
    load()
  }, [])

  const setField = (setter) => (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setter((prev) => ({ ...prev, [field]: value }))
  }
  const setOptionField = setField(setOption)
  const setGroupField = setField(setGroup)

  const saveOption = async () => {
    setSaving(true)
    try {
      const payload = {
        ...option,
        price_delta: Number(option.price_delta) || 0,
        position: Number(option.position) || 0,
        group_id: Number(option.group_id),
      }
      if (option.id) {
        const { id, ...body } = payload
        await api.admin.updateOption(id, body)
      } else {
        await api.admin.createOption(payload)
      }
      setOption(null)
      await load()
    } catch (e) {
      onError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const saveGroup = async () => {
    setSaving(true)
    try {
      const payload = {
        ...group,
        max_choices: Number(group.max_choices) || 1,
        position: Number(group.position) || 0,
      }
      delete payload.options
      if (group.id) {
        const { id, ...body } = payload
        await api.admin.updateGroup(id, body)
      } else {
        await api.admin.createGroup(payload)
      }
      setGroup(null)
      await load()
    } catch (e) {
      onError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const removeOption = async (opt) => {
    if (!confirm(`¿Eliminar la opción "${opt.name}"?`)) return
    try {
      await api.admin.deleteOption(opt.id)
      await load()
    } catch (e) {
      onError(e.message)
    }
  }

  const removeGroup = async (g) => {
    if (!confirm(`¿Eliminar el paso "${g.name}" y todas sus opciones?`)) return
    try {
      await api.admin.deleteGroup(g.id)
      await load()
    } catch (e) {
      onError(e.message)
    }
  }

  return (
    <>
      <Panel
        title="Personalizador de tortas"
        action={
          <Button onClick={() => setGroup({ ...EMPTY_GROUP, position: groups.length + 1 })}>
            + Nuevo paso
          </Button>
        }
      >
        <p className="mb-6 text-sm text-cream-dim">
          Cada paso es una pregunta que se le hace al cliente. El paso marcado como «precio
          base» define el precio de arranque; en el resto, cada opción suma su valor.
        </p>

        <div className="space-y-4">
          {groups.map((g) => (
            <div key={g.id} className="rounded-2xl border border-ink-line">
              <div className="flex flex-wrap items-center gap-3 border-b border-ink-line px-5 py-3">
                <span className="font-mono text-xs text-cream-dim">{g.position}</span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    {g.name}
                    <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] text-cream-dim">
                      {g.kind === 'multi' ? `hasta ${g.max_choices}` : 'una opción'}
                    </span>
                    {g.is_base_price && (
                      <span className="rounded-full bg-rosa px-2 py-0.5 text-[11px] text-ink">
                        precio base
                      </span>
                    )}
                    {!g.required && (
                      <span className="text-[11px] text-cream-dim">opcional</span>
                    )}
                    {!g.active && <span className="text-[11px] text-cereza">oculto</span>}
                  </p>
                  <p className="truncate text-xs text-cream-dim">{g.helper}</p>
                </div>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setOption({ ...EMPTY_OPTION, group_id: g.id, position: g.options.length + 1 })}
                    className="underline-offset-4 hover:underline"
                  >
                    + opción
                  </button>
                  <button
                    type="button"
                    onClick={() => setGroup(g)}
                    className="underline-offset-4 hover:underline"
                  >
                    editar
                  </button>
                  <button
                    type="button"
                    onClick={() => removeGroup(g)}
                    className="text-cereza underline-offset-4 hover:underline"
                  >
                    borrar
                  </button>
                </div>
              </div>

              <ul className="divide-y divide-ink-line">
                {g.options.map((o) => (
                  <li key={o.id} className="group flex items-center gap-3 px-5 py-2.5">
                    <span
                      className="h-6 w-6 shrink-0 rounded-full ring-1 ring-inset ring-white/15"
                      style={{ backgroundColor: o.swatch }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">
                        {o.name}
                        {!o.active && <span className="ml-2 text-xs text-cream-dim">(oculta)</span>}
                      </p>
                      {o.description && (
                        <p className="truncate text-xs text-cream-dim">{o.description}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-sm tabular-nums text-cream-dim">
                      {g.is_base_price
                        ? money(o.price_delta)
                        : o.price_delta > 0
                          ? `+${money(o.price_delta)}`
                          : 'incluido'}
                    </span>
                    <div className="flex shrink-0 gap-2 text-xs opacity-60 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setOption(o)}
                        className="underline-offset-4 hover:underline"
                      >
                        editar
                      </button>
                      <button
                        type="button"
                        onClick={() => removeOption(o)}
                        className="text-cereza underline-offset-4 hover:underline"
                      >
                        borrar
                      </button>
                    </div>
                  </li>
                ))}
                {!g.options.length && (
                  <li className="px-5 py-3 text-sm text-cream-dim">Todavía sin opciones.</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </Panel>

      {/* Modal de opción */}
      <Modal
        open={Boolean(option)}
        title={option?.id ? 'Editar opción' : 'Nueva opción'}
        onClose={() => setOption(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOption(null)}>
              Cancelar
            </Button>
            <Button onClick={saveOption} disabled={saving || !option?.name}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </>
        }
      >
        {option && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre" value={option.name} onChange={setOptionField('name')} />
            <Field
              label="Paso"
              as="select"
              value={option.group_id}
              onChange={setOptionField('group_id')}
              options={groups.map((g) => ({ value: g.id, label: g.name }))}
            />
            <Field
              label="Descripción"
              value={option.description}
              onChange={setOptionField('description')}
              className="col-span-2"
            />
            <Field
              label="Precio"
              type="number"
              value={option.price_delta}
              onChange={setOptionField('price_delta')}
              hint="En el paso de precio base es el total; en los demás, cuánto suma."
            />
            <div>
              <span className="mb-1 block text-xs text-cream-dim">Color en el dibujo</span>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={option.swatch}
                  onChange={setOptionField('swatch')}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-ink-line bg-ink"
                />
                <input
                  value={option.swatch}
                  onChange={setOptionField('swatch')}
                  className="w-full rounded-xl border border-ink-line bg-ink px-3 py-2.5 text-sm outline-none focus:border-rosa"
                />
              </div>
            </div>
            <Field
              label="Orden"
              type="number"
              value={option.position}
              onChange={setOptionField('position')}
            />
            <label className="flex items-end gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                checked={option.active}
                onChange={setOptionField('active')}
                className="h-4 w-4 accent-[#f2c6c2]"
              />
              Disponible
            </label>
          </div>
        )}
      </Modal>

      {/* Modal de paso */}
      <Modal
        open={Boolean(group)}
        title={group?.id ? 'Editar paso' : 'Nuevo paso'}
        onClose={() => setGroup(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setGroup(null)}>
              Cancelar
            </Button>
            <Button onClick={saveGroup} disabled={saving || !group?.name || !group?.slug}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </>
        }
      >
        {group && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre" value={group.name} onChange={setGroupField('name')} />
            <Field
              label="Slug"
              value={group.slug}
              onChange={setGroupField('slug')}
              hint="bizcochuelo, relleno, cobertura y decoracion se reflejan en el dibujo."
            />
            <Field
              label="Ayuda para el cliente"
              value={group.helper}
              onChange={setGroupField('helper')}
              className="col-span-2"
            />
            <Field
              label="Tipo"
              as="select"
              value={group.kind}
              onChange={setGroupField('kind')}
              options={[
                { value: 'single', label: 'Elige una' },
                { value: 'multi', label: 'Puede elegir varias' },
              ]}
            />
            <Field
              label="Máximo de opciones"
              type="number"
              value={group.max_choices}
              onChange={setGroupField('max_choices')}
            />
            <Field label="Orden" type="number" value={group.position} onChange={setGroupField('position')} />
            <div className="flex flex-col justify-end gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={group.required}
                  onChange={setGroupField('required')}
                  className="h-4 w-4 accent-[#f2c6c2]"
                />
                Obligatorio
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={group.is_base_price}
                  onChange={setGroupField('is_base_price')}
                  className="h-4 w-4 accent-[#f2c6c2]"
                />
                Define el precio base
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={group.active}
                  onChange={setGroupField('active')}
                  className="h-4 w-4 accent-[#f2c6c2]"
                />
                Visible
              </label>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
