import { AnimatePresence, motion } from 'framer-motion'
import { LoaderCircle, MoonStar, Search, SunMedium } from 'lucide-react'

export function AppLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 via-brand-500 to-cyan-500 text-white shadow-lg shadow-brand-500/25">
        <span className="font-display text-lg font-semibold">CC</span>
      </div>
      <div>
        <p className="mb-0 font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">CampusConnect</p>
        <p className="mb-0 text-sm font-medium text-slate-600 dark:text-slate-300">Student communities, events, and hiring signals.</p>
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
      className="glass-panel inline-flex h-11 w-11 items-center justify-center rounded-2xl text-slate-700 transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-600 dark:text-slate-200 dark:hover:text-brand-300"
      aria-label="Toggle color theme"
    >
      <Icon className="h-5 w-5" />
    </button>
  )
}

export function SectionCard({ title, description, action, children, className = '' }) {
  return (
    <section className={`surface-panel rounded-[32px] p-6 md:p-8 ${className}`}>
      {(title || description || action) && (
        <div className="mb-6 flex flex-col gap-3 border-b border-slate-200/80 pb-5 dark:border-slate-700/80 md:flex-row md:items-center md:justify-between">
          <div>
            {title ? <h2 className="mb-1 font-display text-[2rem] leading-tight font-semibold tracking-tight text-slate-950 dark:text-slate-50">{title}</h2> : null}
            {description ? <p className="mb-0 text-[15px] leading-6 text-slate-700 dark:text-slate-300">{description}</p> : null}
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
      className="glass-panel min-h-[210px] rounded-[30px] p-7"
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="mb-0 text-base font-semibold text-slate-800">{label}</p>
        {Icon ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      <p className="mb-3 font-display text-5xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mb-0 text-base leading-7 text-slate-600">{helper}</p>
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
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function PrimaryButton({ children, className = '', busy = false, ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:-translate-y-0.5 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
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
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-600 dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-brand-400 dark:hover:text-brand-300 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Field({ label, hint, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{label}</span>
      {children}
      {hint ? <span className="block text-xs font-medium text-slate-600 dark:text-slate-300">{hint}</span> : null}
    </label>
  )
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-brand-400 dark:border-slate-600 dark:bg-slate-900/85 dark:text-slate-50 dark:placeholder:text-slate-400 ${props.className || ''}`}
    />
  )
}

export function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`min-h-28 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-brand-400 dark:border-slate-600 dark:bg-slate-900/85 dark:text-slate-50 dark:placeholder:text-slate-400 ${props.className || ''}`}
    />
  )
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-brand-400 dark:border-slate-600 dark:bg-slate-900/85 dark:text-slate-50 ${props.className || ''}`}
    />
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search' }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input value={value} onChange={onChange} placeholder={placeholder} className="pl-11" />
    </div>
  )
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="rounded-[30px] border border-dashed border-slate-300/90 bg-slate-50/90 p-10 text-center">
      <h3 className="mb-2 font-display text-2xl font-semibold text-slate-950">{title}</h3>
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
        className={`mb-4 flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${tones[tone]}`}
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
