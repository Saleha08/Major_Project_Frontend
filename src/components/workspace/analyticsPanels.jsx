import { motion } from 'framer-motion'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { formatDate, formatDateTime } from '../../lib/api.js'
import { Pill, PrimaryButton, SecondaryButton } from '../ui.jsx'

/* ─── Trend Panel ────────────────────────────────────────────── */
export function TrendPanel({ title, description, items, colorClass }) {
  const maxValue = Math.max(...items.map((item) => item.value), 1)

  return (
    <div
      className="rounded-[var(--radius-xl)] border border-sky-100/80 bg-white p-6"
      style={{ boxShadow: 'var(--shadow-xs)' }}
    >
      <div className="mb-5">
        <h3 className="font-display text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-0.5 text-base text-slate-500">{description}</p>
      </div>
      <div className="space-y-3.5">
        {items.length
          ? items.map((item) => {
              const width = `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 8 : 0)}%`
              return (
                <div key={`${title}-${item.label}`} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-base">
                    <span className="font-medium text-slate-700 truncate">{item.label}</span>
                    <span className="shrink-0 font-bold text-slate-900">{item.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-sky-50">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width }}
                      transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                      className={`h-full rounded-full ${colorClass}`}
                    />
                  </div>
                </div>
              )
            })
          : <p className="text-base text-slate-400">No activity captured yet.</p>}
      </div>
    </div>
  )
}

/* ─── Breakdown Panel ────────────────────────────────────────── */
export function BreakdownPanel({ title, description, items }) {
  const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0)
  const toneMap = {
    success: 'bg-emerald-500',
    warn:    'bg-amber-400',
    danger:  'bg-rose-500',
    info:    'bg-sky-500',
    default: 'bg-slate-300',
  }

  return (
    <div
      className="rounded-[var(--radius-xl)] border border-sky-100/80 bg-white p-6"
      style={{ boxShadow: 'var(--shadow-xs)' }}
    >
      <div className="mb-5">
        <h3 className="font-display text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-0.5 text-base text-slate-500">{description}</p>
      </div>
      <div className="mb-4 flex h-2.5 overflow-hidden rounded-full bg-sky-50">
        {items.map((item) => {
          const value = Number(item.value || 0)
          const width = total > 0 ? `${(value / total) * 100}%` : '0%'
          return (
            <motion.div
              key={`${title}-${item.label}`}
              initial={{ width: 0 }}
              animate={{ width }}
              transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
              className={toneMap[item.tone || 'default']}
              aria-hidden="true"
            />
          )
        })}
      </div>
      <div className="space-y-2">
        {items.length
          ? items.map((item) => {
              const value = Number(item.value || 0)
              const percent = total > 0 ? Math.round((value / total) * 100) : 0
              return (
                <div key={`${title}-${item.label}-legend`} className="flex items-center justify-between gap-3 rounded-[12px] bg-sky-50/60 px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${toneMap[item.tone || 'default']}`} />
                    <span className="text-base font-medium text-slate-700">{item.label}</span>
                  </div>
                  <span className="text-base font-bold text-slate-900">
                    {value} <span className="font-normal text-slate-400">({percent}%)</span>
                  </span>
                </div>
              )
            })
          : <p className="text-base text-slate-400">No breakdown data available yet.</p>}
      </div>
    </div>
  )
}

/* ─── Insight Panel ──────────────────────────────────────────── */
export function InsightPanel({ title, items }) {
  return (
    <div
      className="rounded-[var(--radius-xl)] border border-sky-100/80 bg-white p-6"
      style={{ boxShadow: 'var(--shadow-xs)' }}
    >
      <h3 className="mb-4 font-display text-lg font-semibold text-slate-900">{title}</h3>
      <ul className="mb-0 list-none space-y-2 pl-0">
        {items.map((item, i) => (
          <li
            key={`${title}-${i}`}
            className="flex items-start gap-3 rounded-[12px] bg-sky-50/60 px-4 py-3 text-base leading-relaxed text-slate-700"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ─── Event Card ─────────────────────────────────────────────── */

// Accent configs per category
const CATEGORY_ACCENT = {
  TECH:     { bar: '#0ea5e9', tint: 'var(--card-tint-blue)',   border: 'rgba(14,165,233,0.18)' },
  CULTURAL: { bar: '#11b37f', tint: 'var(--card-tint-teal)',   border: 'rgba(17,179,127,0.18)' },
  SPORTS:   { bar: '#f59e0b', tint: 'var(--card-tint-amber)',  border: 'rgba(245,158,11,0.18)' },
}

export function EventCard({ event, isSaved = false, onToggleSaved, onApply, saveBusy = false }) {
  const SaveIcon = isSaved ? BookmarkCheck : Bookmark
  const categoryTone = event.category === 'TECH' ? 'info' : event.category === 'CULTURAL' ? 'success' : 'warn'
  const accent = CATEGORY_ACCENT[event.category] || CATEGORY_ACCENT.TECH

  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="card-hover relative flex h-full flex-col overflow-hidden rounded-[var(--radius-xl)] p-5"
      style={{
        background: accent.tint,
        border: `1px solid ${accent.border}`,
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {/* Accent top bar */}
      <div className="absolute left-0 right-0 top-0 h-[3px]" style={{ background: accent.bar }} aria-hidden />

      {/* Header row */}
      <div className="mb-4 flex items-center justify-between gap-2 pt-1">
        <Pill tone={categoryTone}>{event.category}</Pill>
        <div className="flex items-center gap-2">
          <Pill tone={event.status === 'OPEN' ? 'success' : 'default'}>{event.status}</Pill>
          {onToggleSaved && (
            <button
              type="button"
              onClick={() => onToggleSaved(!isSaved)}
              disabled={saveBusy}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition ${
                isSaved
                  ? 'border-brand-200 bg-brand-50 text-brand-600'
                  : 'border-sky-200 bg-white text-slate-400 hover:border-brand-300 hover:text-brand-600'
              } disabled:cursor-not-allowed disabled:opacity-60`}
              aria-label={isSaved ? 'Remove from saved' : 'Save event'}
            >
              <SaveIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <h3 className="mb-2 font-display text-base font-semibold text-slate-900 leading-snug">{event.title}</h3>
      <p className="mb-4 text-base leading-relaxed text-slate-500 line-clamp-2">{event.description}</p>

      <div className="mb-4 space-y-2 text-base text-slate-600">
        <p className="mb-0"><span className="font-semibold text-slate-800">Event:</span> {event.event_name}</p>
        <p className="mb-0"><span className="font-semibold text-slate-800">Organizer:</span> {event.organizer?.full_name}</p>
        <p className="mb-0"><span className="font-semibold text-slate-800">Deadline:</span> {formatDate(event.deadline)}</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {String(event.required_skills || '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 4).map((skill) => (
          <span key={skill} className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-medium text-slate-600 border border-sky-100">
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-auto flex gap-2">
        {onToggleSaved && (
          <SecondaryButton className="shrink-0" onClick={() => onToggleSaved(!isSaved)} disabled={saveBusy}>
            {isSaved ? 'Saved' : 'Save'}
          </SecondaryButton>
        )}
        <PrimaryButton className="flex-1" onClick={onApply}>Apply now</PrimaryButton>
      </div>
    </motion.article>
  )
}

/* ─── Snapshot List ──────────────────────────────────────────── */

const EVENT_CARD_STYLES = [
  { bg: 'bg-sky-50',     border: 'border-sky-200',     dot: 'bg-sky-400',     label: 'text-sky-700'     },
  { bg: 'bg-violet-50',  border: 'border-violet-200',  dot: 'bg-violet-400',  label: 'text-violet-700'  },
  { bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-400', label: 'text-emerald-700' },
  { bg: 'bg-amber-50',   border: 'border-amber-200',   dot: 'bg-amber-400',   label: 'text-amber-700'   },
]

const NOTIF_CARD_STYLES = [
  { bg: 'bg-brand-50',   border: 'border-brand-200',   dot: 'bg-brand-400',   time: 'text-brand-600'   },
  { bg: 'bg-purple-50',  border: 'border-purple-200',  dot: 'bg-purple-400',  time: 'text-purple-600'  },
  { bg: 'bg-rose-50',    border: 'border-rose-200',    dot: 'bg-rose-400',    time: 'text-rose-600'    },
  { bg: 'bg-sky-50',     border: 'border-sky-200',     dot: 'bg-sky-400',     time: 'text-sky-600'     },
]

export function SnapshotList({ title, items, type }) {
  return (
    <div
      className="rounded-[var(--radius-xl)] border border-sky-100/80 bg-white p-5"
      style={{ boxShadow: 'var(--shadow-xs)' }}
    >
      <h3 className="mb-4 font-display text-lg font-semibold text-slate-900">{title}</h3>
      <div className="space-y-2.5">
        {items.length
          ? items.map((item, i) => {
              if (type === 'event') {
                const s = EVENT_CARD_STYLES[i % EVENT_CARD_STYLES.length]
                return (
                  <div key={item.id} className={`flex items-start gap-3 rounded-[12px] border p-4 transition hover:brightness-95 ${s.bg} ${s.border}`}>
                    <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${s.dot}`} aria-hidden />
                    <div className="min-w-0">
                      <p className="mb-0.5 text-base font-semibold text-slate-900 leading-snug truncate">{item.title}</p>
                      <p className={`text-sm font-medium ${s.label}`}>{item.event_name} · {formatDate(item.deadline)}</p>
                    </div>
                  </div>
                )
              }
              const s = NOTIF_CARD_STYLES[i % NOTIF_CARD_STYLES.length]
              return (
                <div key={item.id} className={`flex items-start gap-3 rounded-[12px] border p-4 transition hover:brightness-95 ${s.bg} ${s.border}`}>
                  <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${s.dot}`} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-base font-medium text-slate-800 leading-relaxed">{item.message}</p>
                    <p className={`text-sm font-semibold ${s.time}`}>{formatDateTime(item.created_at) || 'No timestamp'}</p>
                  </div>
                </div>
              )
            })
          : <p className="text-base text-slate-400">Nothing here yet.</p>}
      </div>
    </div>
  )
}
