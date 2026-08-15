import { useEffect } from 'react'

export function Button({ variant = 'solid', className = '', ...props }) {
  const styles = {
    solid: 'bg-rosa text-ink hover:bg-cream',
    ghost: 'border border-ink-line text-cream hover:border-rosa',
    danger: 'border border-cereza/50 text-cereza hover:bg-cereza/10',
  }
  return (
    <button
      type="button"
      {...props}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${styles[variant]} ${className}`}
    />
  )
}

export function Field({ label, hint, className = '', as = 'input', options, ...props }) {
  const base =
    'w-full rounded-xl border border-ink-line bg-ink px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-cream-dim/50 focus:border-rosa'
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs text-cream-dim">{label}</span>
      {as === 'textarea' ? (
        <textarea {...props} rows={3} className={base} />
      ) : as === 'select' ? (
        <select {...props} className={base}>
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-ink">
              {o.label}
            </option>
          ))}
        </select>
      ) : as === 'checkbox' ? (
        <input type="checkbox" {...props} className="h-5 w-5 accent-[#f2c6c2]" />
      ) : (
        <input {...props} className={base} />
      )}
      {hint && <span className="mt-1 block text-[11px] text-cream-dim">{hint}</span>}
    </label>
  )
}

export function Modal({ open, title, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-ink/80 p-4 backdrop-blur-sm md:p-10">
      <div className="w-full max-w-2xl rounded-[28px] border border-ink-line bg-ink-soft">
        <div className="flex items-center justify-between border-b border-ink-line px-6 py-4">
          <h3 className="display text-xl">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-line text-cream-dim hover:text-cream"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-ink-line px-6 py-4">{footer}</div>
        )}
      </div>
    </div>
  )
}

export function Panel({ title, action, children }) {
  return (
    <section className="rounded-[28px] border border-ink-line bg-ink-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-line px-6 py-4">
        <h2 className="display text-xl">{title}</h2>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </section>
  )
}
