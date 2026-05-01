import { AnimatePresence, motion } from 'framer-motion'
import { LoaderCircle, MoonStar, Search, SunMedium, X } from 'lucide-react'

export function AppLogo() {
  return (
    <div className="flex min-w-0 items-center gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-950 via-brand-600 to-blue-600 text-white shadow-lg shadow-slate-900/20">
        <span className="font-display text-[1.35rem] font-semibold">CC</span>
      </div>
      <div className="min-w-0">
        <p className="mb-0 font-display text-[1.35rem] font-semibold tracking-tight text-slate-950 dark:text-slate-50">CampusConnect</p>
        <p className="mb-0 hidden text-[0.88rem] font-medium text-soft sm:block">Student communities, events, and hiring signals.</p>
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
    <section className={`surface-panel enterprise-strip p-6 md:p-8 xl:p-9 ${className}`}>
      {(title || description || action) && (
        <div className="mb-7 flex flex-col gap-4 border-b border-slate-200/90 pb-6 dark:border-slate-700/80 md:flex-row md:items-start md:justify-between">
          <div>
            {title ? <h2 className="mb-1 font-display text-[1.55rem] leading-tight font-semibold tracking-tight text-slate-950 dark:text-slate-50 md:text-[1.8rem]">{title}</h2> : null}
            {description ? <p className="mb-0 max-w-3xl text-[0.98rem] leading-7 text-soft">{description}</p> : null}
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
      className="glass-panel elevated-hover enterprise-strip min-h-[220px] p-6 xl:p-7"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="mb-0 text-[0.94rem] font-semibold uppercase text-slate-900">{label}</p>
        {Icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      <p className="mb-3 font-display text-[3rem] font-semibold tracking-tight text-slate-950 xl:text-[3.4rem]">{value}</p>
      <p className="mb-0 text-[0.98rem] leading-7 text-soft">{helper}</p>
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
    <span className={`inline-flex min-h-8 items-center rounded-md px-3.5 py-1.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function PrimaryButton({ children, className = '', busy = false, ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-600 to-blue-600 px-5 py-3 text-[0.98rem] font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
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
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-[0.98rem] font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-600 dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-brand-400 dark:hover:text-brand-300 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Field({ label, hint, children }) {
  return (
    <label className="block space-y-3">
      <span className="text-[0.92rem] font-semibold text-slate-950 dark:text-slate-100">{label}</span>
      {children}
      {hint ? <span className="block text-[0.88rem] font-medium text-soft">{hint}</span> : null}
    </label>
  )
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full min-h-12 rounded-lg border border-slate-300 bg-white px-4 py-3 text-[0.98rem] font-medium text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-900/85 dark:text-slate-50 dark:placeholder:text-slate-400 ${props.className || ''}`}
    />
  )
}

export function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`min-h-36 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-[0.98rem] font-medium text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-900/85 dark:text-slate-50 dark:placeholder:text-slate-400 ${props.className || ''}`}
    />
  )
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`w-full min-h-12 rounded-lg border border-slate-300 bg-white px-4 py-3 text-[0.98rem] font-medium text-slate-950 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-900/85 dark:text-slate-50 ${props.className || ''}`}
    />
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search' }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-500" />
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full min-h-12 rounded-lg border border-slate-300 bg-white py-3 pr-4 pl-12 text-[0.98rem] font-medium text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-900/85 dark:text-slate-50 dark:placeholder:text-slate-400"
      />
    </div>
  )
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300/90 bg-slate-50 p-10 text-center">
      <h3 className="mb-2 font-display text-[1.35rem] font-semibold text-slate-950">{title}</h3>
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
        className={`mb-5 flex items-start justify-between gap-3 rounded-lg border px-5 py-4 text-base ${tones[tone]}`}
      >
        <p className="mb-0">{message}</p>
        {onClose ? (
          <button type="button" onClick={onClose} className="text-current/70 transition hover:text-current" aria-label="Dismiss message">
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </motion.div>
    </AnimatePresence>
  )
}
