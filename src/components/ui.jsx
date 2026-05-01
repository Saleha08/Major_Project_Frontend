import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Modal from 'react-bootstrap/Modal'
import { ChevronLeft, ChevronRight, LoaderCircle, Search } from 'lucide-react'

/* ─── App Logo ───────────────────────────────────────────────── */
export function AppLogo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex shrink-0 items-center justify-center rounded-[14px] text-white shadow-md"
        style={{
          background: 'var(--gradient-brand)',
          width: compact ? '34px' : '38px',
          height: compact ? '34px' : '38px',
        }}
      >
        <span className="font-display font-bold" style={{ fontSize: compact ? '0.8rem' : '0.9rem' }}>
          CC
        </span>
      </div>
      {!compact && (
        <div>
          <p className="mb-0 font-display text-[1rem] font-semibold tracking-tight text-slate-900 leading-tight">
            CampusConnect
          </p>
          <p className="mb-0 text-[0.7rem] font-medium text-slate-500 leading-tight">
            Events · Applications · Community
          </p>
        </div>
      )}
    </div>
  )
}

/* ─── Section Card ───────────────────────────────────────────── */
export function SectionCard({ title, description, action, children, className = '', tint = 'white' }) {
  const tintClass = {
    white: '',
    teal: 'card-tint-teal',
    blue: 'card-tint-blue',
    purple: 'card-tint-purple',
    amber: 'card-tint-amber',
    rose: 'card-tint-rose',
  }[tint] || ''

  return (
    <section
      className={`rounded-[var(--radius-2xl)] border border-sky-100/80 p-6 md:p-8 ${tintClass || 'bg-white'} ${className}`}
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      {(title || description || action) && (
        <div className="mb-6 flex flex-col gap-3 border-b border-sky-50 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            {title && (
              <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1.5 text-base leading-relaxed text-slate-500">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

/* ─── Stat Card ──────────────────────────────────────────────── */
export function StatCard({ label, value, helper, icon: Icon, accent }) {
  // Each accent gets a soft gradient background + matching icon gradient
  const accentMap = {
    teal: {
      cardBg: 'var(--card-tint-teal)',
      border: 'rgba(17,179,127,0.2)',
      iconGrad: 'var(--gradient-brand)',
      iconShadow: 'rgba(17,179,127,0.25)',
      accentBar: '#11b37f',
    },
    purple: {
      cardBg: 'var(--card-tint-purple)',
      border: 'rgba(124,58,237,0.18)',
      iconGrad: 'var(--gradient-purple)',
      iconShadow: 'rgba(124,58,237,0.22)',
      accentBar: '#7c3aed',
    },
    blue: {
      cardBg: 'var(--card-tint-blue)',
      border: 'rgba(14,165,233,0.2)',
      iconGrad: 'var(--gradient-sky)',
      iconShadow: 'rgba(14,165,233,0.25)',
      accentBar: '#0ea5e9',
    },
    amber: {
      cardBg: 'var(--card-tint-amber)',
      border: 'rgba(245,158,11,0.2)',
      iconGrad: 'var(--gradient-amber)',
      iconShadow: 'rgba(245,158,11,0.25)',
      accentBar: '#f59e0b',
    },
  }
  const c = accentMap[accent] || accentMap.teal

  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="card-hover relative overflow-hidden rounded-[var(--radius-xl)] p-6"
      style={{
        background: c.cardBg,
        border: `1px solid ${c.border}`,
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {/* Subtle accent bar at top */}
      <div
        className="absolute left-0 right-0 top-0 h-[3px] rounded-t-[var(--radius-xl)]"
        style={{ background: c.accentBar }}
        aria-hidden
      />

      <div className="mb-4 flex items-start justify-between gap-3 pt-1">
        <p className="text-base font-semibold text-slate-600 leading-tight">{label}</p>
        {Icon && (
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md"
            style={{ background: c.iconGrad, boxShadow: `0 4px 12px ${c.iconShadow}` }}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      <p
        className="font-display font-bold tracking-tight text-slate-900 leading-none"
        style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)' }}
      >
        {value}
      </p>
      {helper && <p className="mt-2 text-sm leading-relaxed text-slate-500">{helper}</p>}
    </motion.article>
  )
}

/* ─── Pill ───────────────────────────────────────────────────── */
export function Pill({ children, tone = 'default' }) {
  const tones = {
    default: 'bg-slate-100 text-slate-600',
    success: 'bg-emerald-100 text-emerald-700',
    warn: 'bg-amber-100 text-amber-700',
    info: 'bg-sky-100 text-sky-700',
    danger: 'bg-rose-100 text-rose-700',
    brand: 'bg-brand-100 text-brand-700',
    purple: 'bg-violet-100 text-violet-700',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-none ${tones[tone]}`}>
      {children}
    </span>
  )
}

/* ─── Primary Button — gradient ──────────────────────────────── */
export function PrimaryButton({ children, className = '', busy = false, ...props }) {
  return (
    <button
      type="button"
      className={`btn-gradient-brand inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] px-6 py-3 text-base font-semibold text-white active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      disabled={busy || props.disabled}
      {...props}
    >
      {busy && <LoaderCircle className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}

/* ─── Secondary Button ───────────────────────────────────────── */
export function SecondaryButton({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] border border-sky-200 bg-white px-6 py-3 text-base font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-400 hover:text-brand-600 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

/* ─── Unified Button ─────────────────────────────────────────── */
const buttonVariants = {
  primary:   'btn-gradient-brand text-white',
  secondary: 'border border-sky-200 bg-white text-slate-700 shadow-sm hover:border-brand-400 hover:text-brand-600 hover:-translate-y-0.5 hover:shadow-md',
  outline:   'border border-sky-200 bg-transparent text-slate-700 hover:bg-sky-50 hover:border-sky-300',
  ghost:     'bg-transparent text-slate-600 hover:bg-sky-50 hover:text-slate-900',
  danger:    'text-white shadow-md shadow-rose-500/20 hover:-translate-y-0.5',
}

export function Button({
  variant = 'primary',
  size = 'md',
  busy = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  children,
  disabled,
  ...props
}) {
  const sizes = {
    sm: 'min-h-9 px-3 py-1.5 text-sm rounded-xl gap-1.5',
    md: 'min-h-11 px-5 py-2.5 text-base rounded-[12px] gap-2',
    lg: 'min-h-12 px-6 py-3 text-base rounded-[14px] gap-2',
  }

  const dangerStyle = variant === 'danger'
    ? { background: 'var(--gradient-rose)', boxShadow: '0 4px 14px rgba(244,63,94,0.28)' }
    : {}

  return (
    <button
      type="button"
      disabled={busy || disabled}
      className={`inline-flex items-center justify-center font-semibold transition active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 ${sizes[size]} ${buttonVariants[variant]} ${className}`}
      style={dangerStyle}
      {...props}
    >
      {busy ? <LoaderCircle className="h-3.5 w-3.5 shrink-0 animate-spin" /> : null}
      {!busy && LeftIcon ? <LeftIcon className="h-3.5 w-3.5 shrink-0" /> : null}
      {children}
      {!busy && RightIcon ? <RightIcon className="h-3.5 w-3.5 shrink-0" /> : null}
    </button>
  )
}

/* ─── Card ───────────────────────────────────────────────────── */
export function Card({ children, className = '', padding = 'md', interactive = false, tint = 'white' }) {
  const paddings = { sm: 'p-4', md: 'p-5', lg: 'p-7' }
  const tintClass = {
    white: 'bg-white',
    teal: 'card-tint-teal',
    blue: 'card-tint-blue',
    purple: 'card-tint-purple',
    amber: 'card-tint-amber',
    rose: 'card-tint-rose',
  }[tint] || 'bg-white'

  return (
    <div
      className={`rounded-[var(--radius-xl)] border border-sky-100/80 ${tintClass} ${
        interactive ? 'card-hover cursor-pointer' : ''
      } ${paddings[padding]} ${className}`}
      style={{ boxShadow: 'var(--shadow-xs)' }}
    >
      {children}
    </div>
  )
}

/* ─── Field ──────────────────────────────────────────────────── */
export function Field({ label, hint, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-base font-semibold text-slate-800">{label}</span>
      {children}
      {hint && <span className="block text-sm font-medium text-slate-500">{hint}</span>}
    </label>
  )
}

/* ─── Input ──────────────────────────────────────────────────── */
export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full min-h-12 rounded-[12px] border border-sky-100 bg-white px-4 py-3 text-base font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-3 focus:ring-brand-100 hover:border-sky-200 ${props.className || ''}`}
    />
  )
}

/* ─── Textarea ───────────────────────────────────────────────── */
export function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`min-h-28 w-full rounded-[12px] border border-sky-100 bg-white px-4 py-3 text-base font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-3 focus:ring-brand-100 hover:border-sky-200 resize-y ${props.className || ''}`}
    />
  )
}

/* ─── Select ─────────────────────────────────────────────────── */
export function Select(props) {
  return (
    <select
      {...props}
      className={`w-full min-h-12 rounded-[12px] border border-sky-100 bg-white px-4 py-3 text-base font-medium text-slate-900 outline-none transition focus:border-brand-400 focus:ring-3 focus:ring-brand-100 hover:border-sky-200 cursor-pointer ${props.className || ''}`}
    />
  )
}

/* ─── Search Input ───────────────────────────────────────────── */
export function SearchInput({ value, onChange, placeholder = 'Search' }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input value={value} onChange={onChange} placeholder={placeholder} className="pl-10" />
    </div>
  )
}

/* ─── Empty State ────────────────────────────────────────────── */
export function EmptyState({ title, message, action }) {
  return (
    <div
      className="rounded-[var(--radius-xl)] border border-dashed border-sky-200 px-6 py-10 text-center"
      style={{ background: 'var(--card-tint-blue)' }}
    >
      <div
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ background: 'var(--gradient-sky-soft)' }}
      >
        <span className="text-xl">📭</span>
      </div>
      <h3 className="mb-1.5 font-display text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mx-auto mb-4 max-w-xs text-base leading-relaxed text-slate-500">{message}</p>
      {action}
    </div>
  )
}

/* ─── Alert Banner ───────────────────────────────────────────── */
export function AlertBanner({ tone = 'info', message, onClose }) {
  if (!message) return null

  const tones = {
    info:    'border-sky-200 bg-sky-50 text-sky-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    danger:  'border-rose-200 bg-rose-50 text-rose-800',
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        className={`mb-4 flex items-start justify-between gap-3 rounded-[14px] border px-4 py-3.5 text-sm font-medium ${tones[tone]}`}
      >
        <p className="mb-0 leading-relaxed">{message}</p>
        {onClose && (
          <button type="button" onClick={onClose} className="shrink-0 text-current/60 transition hover:text-current" aria-label="Dismiss">
            ✕
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

/* ─── App Modal ──────────────────────────────────────────────── */
export function AppModal({ show, onHide, title, children, footer, size }) {
  return (
    <Modal show={show} onHide={onHide} centered size={size} contentClassName="rounded-[20px] border-0 overflow-hidden">
      <Modal.Header closeButton className="border-b border-sky-50 px-6 py-4" style={{ background: 'var(--card-tint-blue)' }}>
        <Modal.Title className="font-display text-lg font-semibold text-slate-900">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-white px-6 py-5">{children}</Modal.Body>
      {footer && (
        <Modal.Footer className="border-t border-sky-50 px-6 py-4" style={{ background: 'var(--card-tint-blue)' }}>
          {footer}
        </Modal.Footer>
      )}
    </Modal>
  )
}

/* ─── Data Table ─────────────────────────────────────────────── */
export function DataTable({ columns, rows, pageSize = 8, emptyMessage = 'No rows to display.' }) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const safePage = Math.min(page, totalPages)

  const slice = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return rows.slice(start, start + pageSize)
  }, [rows, safePage, pageSize])

  if (!rows.length) {
    return (
      <div className="rounded-[14px] border border-dashed border-sky-200 px-6 py-8 text-center text-base text-slate-500" style={{ background: 'var(--card-tint-blue)' }}>
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[16px] border border-sky-100/80 bg-white" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left">
          <thead>
            <tr className="border-b border-sky-50" style={{ background: 'var(--card-tint-blue)' }}>
              {columns.map((col) => (
                <th key={col.key} scope="col" className="whitespace-nowrap px-5 py-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((row, ri) => (
              <tr key={row.id ?? ri} className="border-b border-sky-50/60 transition hover:bg-sky-50/40 last:border-0">
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-4 text-base text-slate-700">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-sky-50 px-5 py-3" style={{ background: 'var(--card-tint-blue)' }}>
        <p className="mb-0 text-sm text-slate-500">Page {safePage} of {totalPages} · {rows.length} total</p>
        <div className="flex gap-1.5">
          <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-sky-200 bg-white text-slate-600 transition hover:bg-sky-50 disabled:opacity-40" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous page">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-sky-200 bg-white text-slate-600 transition hover:bg-sky-50 disabled:opacity-40" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria-label="Next page">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Skeleton ───────────────────────────────────────────────── */
export function Skeleton({ className = '' }) {
  return <div className={`skeleton-shimmer rounded-lg ${className}`} aria-hidden />
}

export function SkeletonCard() {
  return (
    <div className="space-y-3 rounded-[var(--radius-xl)] border border-sky-100/80 bg-white p-5" style={{ boxShadow: 'var(--shadow-xs)' }}>
      <Skeleton className="h-3.5 w-1/3" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-3.5 w-2/3" />
    </div>
  )
}

/* ─── Error State ────────────────────────────────────────────── */
export function ErrorState({ title = 'Something went wrong', message, action }) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-rose-200 px-6 py-8 text-center" style={{ background: 'var(--gradient-rose-soft)' }}>
      <h3 className="mb-2 font-display text-base font-semibold text-rose-900">{title}</h3>
      <p className="mb-4 text-sm text-rose-700">{message}</p>
      {action}
    </div>
  )
}

/* ─── Badge ──────────────────────────────────────────────────── */
export function Badge({ children, variant = 'neutral' }) {
  const map = {
    neutral: 'bg-slate-100 text-slate-600',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger:  'bg-rose-100 text-rose-700',
    info:    'bg-sky-100 text-sky-700',
    brand:   'bg-brand-100 text-brand-700',
    purple:  'bg-violet-100 text-violet-700',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[variant]}`}>
      {children}
    </span>
  )
}

/* ─── Field Error ────────────────────────────────────────────── */
export function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs font-semibold text-rose-600" role="alert">{message}</p>
}
