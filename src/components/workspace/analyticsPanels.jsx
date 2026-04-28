import { motion } from 'framer-motion'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { formatDate, formatDateTime } from '../../lib/api.js'
import { Pill, PrimaryButton, SecondaryButton } from '../ui.jsx'

export function TrendPanel({ title, description, items, colorClass }) {
  const maxValue = Math.max(...items.map((item) => item.value), 1)

  return (
    <div className="rounded-[var(--radius-xl)] border border-slate-200 bg-slate-50/70 p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="mb-1 font-display text-[1.35rem] font-semibold text-slate-950">{title}</h3>
        <p className="mb-0 text-[0.98rem] leading-7 text-slate-600">{description}</p>
      </div>
      <div className="space-y-4">
        {items.length ? items.map((item) => {
          const width = `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 10 : 0)}%`

          return (
            <div key={`${title}-${item.label}`} className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-700">{item.label}</span>
                <span className="font-semibold text-slate-950">{item.value}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white">
                <div className={`h-full rounded-full ${colorClass}`} style={{ width }} />
              </div>
            </div>
          )
        }) : <p className="mb-0 text-sm text-slate-500">No activity captured yet.</p>}
      </div>
    </div>
  )
}

export function BreakdownPanel({ title, description, items }) {
  const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0)
  const toneMap = {
    success: 'bg-emerald-500',
    warn: 'bg-amber-400',
    danger: 'bg-rose-500',
    info: 'bg-sky-500',
    default: 'bg-slate-400',
  }

  return (
    <div className="rounded-[var(--radius-xl)] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="mb-1 font-display text-[1.35rem] font-semibold text-slate-950">{title}</h3>
        <p className="mb-0 text-[0.98rem] leading-7 text-slate-600">{description}</p>
      </div>
      <div className="mb-5 flex h-3 overflow-hidden rounded-full bg-slate-100">
        {items.map((item) => {
          const value = Number(item.value || 0)
          const width = total > 0 ? `${(value / total) * 100}%` : '0%'

          return (
            <div
              key={`${title}-${item.label}`}
              className={toneMap[item.tone || 'default']}
              style={{ width }}
              aria-hidden="true"
            />
          )
        })}
      </div>
      <div className="space-y-3">
        {items.length ? items.map((item) => {
          const value = Number(item.value || 0)
          const percent = total > 0 ? Math.round((value / total) * 100) : 0

          return (
            <div key={`${title}-${item.label}-legend`} className="flex items-center justify-between gap-3 rounded-[16px] bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${toneMap[item.tone || 'default']}`} />
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
              </div>
              <span className="text-sm font-semibold text-slate-950">{value} ({percent}%)</span>
            </div>
          )
        }) : <p className="mb-0 text-sm text-slate-500">No breakdown data available yet.</p>}
      </div>
    </div>
  )
}

export function InsightPanel({ title, items }) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-display text-[1.35rem] font-semibold text-slate-950">{title}</h3>
      <ul className="mb-0 list-none space-y-3 pl-0">
        {items.map((item) => (
          <li key={`${title}-${item}`} className="rounded-[16px] bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function EventCard({ event, isSaved = false, onToggleSaved, onApply, saveBusy = false }) {
  const SaveIcon = isSaved ? BookmarkCheck : Bookmark

  return (
    <motion.article whileHover={{ y: -4 }} className="glass-panel elevated-hover flex h-full flex-col rounded-[var(--radius-xl)] p-6">
      <div className="mb-5 flex items-center justify-between gap-2">
        <Pill tone={event.category === 'TECH' ? 'info' : event.category === 'CULTURAL' ? 'success' : 'warn'}>
          {event.category}
        </Pill>
        <div className="flex items-center gap-2">
          <Pill tone={event.status === 'OPEN' ? 'success' : 'default'}>{event.status}</Pill>
          {onToggleSaved ? (
            <button
              type="button"
              onClick={() => onToggleSaved(!isSaved)}
              disabled={saveBusy}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
                isSaved
                  ? 'border-brand-200 bg-brand-50 text-brand-600'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-brand-300 hover:text-brand-600'
              } disabled:cursor-not-allowed disabled:opacity-60`}
              aria-label={isSaved ? 'Remove event from saved list' : 'Save event'}
            >
              <SaveIcon className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
      <h3 className="mb-3 font-display text-[1.45rem] font-semibold text-slate-950">{event.title}</h3>
      <p className="mb-5 text-[1rem] leading-7 text-slate-600">{event.description}</p>
      <div className="mb-5 space-y-3 text-[1rem] text-slate-600">
        <p className="mb-0"><span className="font-semibold text-slate-900">Event name:</span> {event.event_name}</p>
        <p className="mb-0"><span className="font-semibold text-slate-900">Organizer:</span> {event.organizer?.full_name}</p>
        <p className="mb-0"><span className="font-semibold text-slate-900">Deadline:</span> {formatDate(event.deadline)}</p>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {String(event.required_skills || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 4)
          .map((skill) => (
            <span key={skill} className="rounded-full bg-slate-100 px-3.5 py-2 text-[0.9rem] font-medium text-slate-700">{skill}</span>
          ))}
      </div>
      <div className="mt-auto flex gap-3">
        {onToggleSaved ? (
          <SecondaryButton className="min-w-[150px]" onClick={() => onToggleSaved(!isSaved)} disabled={saveBusy}>
            {isSaved ? 'Saved' : 'Save'}
          </SecondaryButton>
        ) : null}
        <PrimaryButton className="w-full" onClick={onApply}>Apply now</PrimaryButton>
      </div>
    </motion.article>
  )
}

export function SnapshotList({ title, items, type }) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-slate-200/90 bg-white/90 p-8 shadow-sm">
      <h3 className="mb-6 font-display text-2xl font-semibold text-slate-950">{title}</h3>
      <div className="space-y-4">
        {items.length ? items.map((item) => (
          <div key={item.id} className="rounded-[18px] bg-slate-100 p-5">
            {type === 'event' ? (
              <>
                <p className="mb-1 text-[1.2rem] font-semibold text-slate-950">{item.title}</p>
                <p className="mb-0 text-[1rem] text-slate-600">{item.event_name} • {formatDate(item.deadline)}</p>
              </>
            ) : (
              <>
                <p className="mb-1 text-[1.05rem] font-semibold text-slate-900">{item.message}</p>
                <p className="mb-0 text-[0.98rem] text-slate-600">{formatDateTime(item.created_at)}</p>
              </>
            )}
          </div>
        )) : <p className="mb-0 text-[1rem] text-slate-600">Nothing here yet.</p>}
      </div>
    </div>
  )
}
