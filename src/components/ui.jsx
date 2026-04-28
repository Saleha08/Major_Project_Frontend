import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Modal from 'react-bootstrap/Modal'
import { ChevronLeft, ChevronRight, LoaderCircle, MoonStar, Search, SunMedium } from 'lucide-react'

export function AppLogo() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-brand-400 via-brand-500 to-cyan-500 text-white shadow-lg shadow-brand-500/25">
        <span className="font-display text-[1.35rem] font-semibold">CC</span>
      </div>
      <div>
        <p className="mb-0 font-display text-[1.35rem] font-semibold tracking-tight text-slate-950 dark:text-slate-50">CampusConnect</p>
        <p className="mb-0 text-[0.98rem] font-medium text-slate-800 dark:text-slate-300">Student communities, events, and hiring signals.</p>
      </div>
    </div>
  )
}

export function ThemeButton({ theme, onToggle }) {
  const Icon = theme === 'dark' ? SunMedium : MoonStar

  return (
    <button
      type="button"
      onClick={onToggle}
      className="glass-panel elevated-hover inline-flex h-12 w-12 items-center justify-center rounded-[18px] text-slate-700 dark:text-slate-200 dark:hover:text-brand-300"
      aria-label="Toggle color theme"
    >
      <Icon className="h-5 w-5" />
    </button>
  )
}

export function SectionCard({ title, description, action, children, className = '' }) {
  return (
    <section className={`surface-panel rounded-[20px] p-7 md:p-9 xl:p-10 ${className}`}>
      {(title || description || action) && (
        <div className="mb-7 flex flex-col gap-4 border-b border-slate-200/90 pb-6 dark:border-slate-700/80 md:flex-row md:items-center md:justify-between">
          <div>
            {title ? <h2 className="mb-1 font-display text-[1.8rem] leading-tight font-semibold tracking-tight text-slate-950 dark:text-slate-50 md:text-[2rem]">{title}</h2> : null}
            {description ? <p className="mb-0 text-[1.02rem] leading-8 text-slate-800 dark:text-slate-300">{description}</p> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function StatCard({ label, value, helper, icon: Icon }) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="glass-panel elevated-hover min-h-[260px] rounded-[20px] p-8 xl:p-9"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="mb-0 text-[1.05rem] font-semibold text-slate-900">{label}</p>
        {Icon ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      <p className="mb-3 font-display text-[3.4rem] font-semibold tracking-tight text-slate-950 xl:text-[4rem]">{value}</p>
      <p className="mb-0 text-[1.02rem] leading-8 text-slate-800">{helper}</p>
    </motion.article>
  )
}

export function Pill({ children, tone = 'default' }) {
  const tones = {
    default: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    warn: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    info: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  }

  return (
    <span className={`inline-flex min-h-8 items-center rounded-full px-3.5 py-1.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function PrimaryButton({ children, className = '', busy = false, ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-[18px] bg-brand-500 px-6 py-4 text-[1.02rem] font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:-translate-y-0.5 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      disabled={busy || props.disabled}
      {...props}
    >
      {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  )
}

export function SecondaryButton({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-[18px] border border-slate-300 bg-white px-6 py-4 text-[1.02rem] font-medium text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-600 dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-brand-400 dark:hover:text-brand-300 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Field({ label, hint, children }) {
  return (
    <label className="block space-y-3">
      <span className="text-[1rem] font-semibold text-slate-950 dark:text-slate-100">{label}</span>
      {children}
      {hint ? <span className="block text-[0.96rem] font-medium text-slate-800 dark:text-slate-300">{hint}</span> : null}
    </label>
  )
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full min-h-14 rounded-[18px] border border-slate-300 bg-white px-5 py-4 text-[1.02rem] font-medium text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-900/85 dark:text-slate-50 dark:placeholder:text-slate-400 ${props.className || ''}`}
    />
  )
}

export function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`min-h-36 w-full rounded-[18px] border border-slate-300 bg-white px-5 py-4 text-[1.02rem] font-medium text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-900/85 dark:text-slate-50 dark:placeholder:text-slate-400 ${props.className || ''}`}
    />
  )
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`w-full min-h-14 rounded-[18px] border border-slate-300 bg-white px-5 py-4 text-[1.02rem] font-medium text-slate-950 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-900/85 dark:text-slate-50 ${props.className || ''}`}
    />
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search' }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
      <Input value={value} onChange={onChange} placeholder={placeholder} className="pl-12" />
    </div>
  )
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="rounded-[20px] border border-dashed border-slate-300/90 bg-slate-50 p-10 text-center">
      <h3 className="mb-2 font-display text-[1.45rem] font-semibold text-slate-950">{title}</h3>
      <p className="mx-auto mb-4 max-w-md text-base leading-7 text-slate-700">{message}</p>
      {action}
    </div>
  )
}

export function AlertBanner({ tone = 'info', message, onClose }) {
  if (!message) {
    return null
  }

  const tones = {
    info: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200',
    danger: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200',
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className={`mb-5 flex items-start justify-between gap-3 rounded-[18px] border px-5 py-4 text-base ${tones[tone]}`}
      >
        <p className="mb-0">{message}</p>
        {onClose ? (
          <button type="button" onClick={onClose} className="text-current/70 transition hover:text-current" aria-label="Dismiss message">
            x
          </button>
        ) : null}
      </motion.div>
    </AnimatePresence>
  )
}

const buttonVariants = {
  primary: 'bg-brand-500 text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 hover:-translate-y-0.5',
  secondary: 'border border-slate-300 bg-white text-slate-800 shadow-sm hover:border-brand-300 hover:text-brand-600 dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100',
  outline: 'border border-slate-300 bg-transparent text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800/50',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/80',
}

/** Unified button — variants: primary | secondary | outline | ghost */
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
    sm: 'min-h-10 px-4 py-2 text-sm rounded-xl gap-1.5',
    md: 'min-h-12 px-5 py-3 text-[1rem] rounded-[14px] gap-2',
    lg: 'min-h-14 px-6 py-4 text-[1.02rem] rounded-[16px] gap-2',
  }

  return (
    <button
      type="button"
      disabled={busy || disabled}
      className={`inline-flex items-center justify-center font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${sizes[size]} ${buttonVariants[variant]} ${className}`}
      {...props}
    >
      {busy ? <LoaderCircle className="h-4 w-4 shrink-0 animate-spin" /> : null}
      {!busy && LeftIcon ? <LeftIcon className="h-4 w-4 shrink-0" /> : null}
      {children}
      {!busy && RightIcon ? <RightIcon className="h-4 w-4 shrink-0" /> : null}
    </button>
  )
}

export function Card({ children, className = '', padding = 'md', interactive = false }) {
  const paddings = { sm: 'p-4', md: 'p-6', lg: 'p-8' }

  return (
    <div
      className={`rounded-[var(--radius-xl)] border border-slate-200/90 bg-[var(--surface-strong)] shadow-[var(--shadow-sm)] ${interactive ? 'transition hover:border-brand-200 hover:shadow-md' : ''} ${paddings[padding]} ${className}`}
    >
      {children}
    </div>
  )
}

export function AppModal({
  show,
  onHide,
  title,
  children,
  footer,
  size,
}) {
  return (
    <Modal show={show} onHide={onHide} centered size={size} contentClassName="rounded-2xl border-0 shadow-2xl overflow-hidden">
      <Modal.Header closeButton className="border-b border-slate-100 bg-white px-6 py-4">
        <Modal.Title className="font-display text-xl font-semibold text-slate-900">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-6 py-5">{children}</Modal.Body>
      {footer ? <Modal.Footer className="border-t border-slate-100 bg-slate-50/80 px-6 py-4">{footer}</Modal.Footer> : null}
    </Modal>
  )
}

export function DataTable({
  columns,
  rows,
  pageSize = 8,
  emptyMessage = 'No rows to display.',
}) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const safePage = Math.min(page, totalPages)

  const slice = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return rows.slice(start, start + pageSize)
  }, [rows, safePage, pageSize])

  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center text-sm text-slate-600">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[520px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/90">
            {columns.map((col) => (
              <th key={col.key} scope="col" className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slice.map((row, ri) => (
            <tr key={row.id ?? ri} className="border-b border-slate-100 transition hover:bg-slate-50/90">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-slate-800">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-4 py-3">
        <p className="mb-0 text-xs text-slate-600">
          Page {safePage} of {totalPages} · {rows.length} total
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gradient-to-r from-slate-100 via-slate-200/80 to-slate-100 bg-[length:200%_100%] ${className}`}
      aria-hidden
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export function ErrorState({ title = 'Something went wrong', message, action }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50/90 px-6 py-8 text-center">
      <h3 className="mb-2 font-display text-lg font-semibold text-rose-900">{title}</h3>
      <p className="mb-4 text-sm text-rose-800/90">{message}</p>
      {action}
    </div>
  )
}

export function Badge({ children, variant = 'neutral' }) {
  const map = {
    neutral: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-900',
    danger: 'bg-rose-100 text-rose-800',
    info: 'bg-sky-100 text-sky-900',
    brand: 'bg-brand-100 text-brand-800',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${map[variant]}`}>
      {children}
    </span>
  )
}

export function FieldError({ message }) {
  if (!message) {
    return null
  }

  return <p className="mt-1.5 text-sm font-medium text-rose-600" role="alert">{message}</p>
}
