/**
 * Lightweight SVG charts — no extra chart library.
 */

const COLORS = ['#11b37f', '#8b5cf6', '#0ea5e9', '#f59e0b', '#ec4899', '#64748b']

export function SimplePieChart({ items = [], title, description }) {
  const total = items.reduce((s, i) => s + Math.max(0, Number(i.value) || 0), 0)
  const safe = total > 0 ? total : 1

  const segments = items.reduce((result, item, idx) => {
    const v = Math.max(0, Number(item.value) || 0)
    const pct = (v / safe) * 100
    const start = result.nextStart
    result.list.push({ ...item, pct, start, color: item.color || COLORS[idx % COLORS.length] })
    result.nextStart += pct
    return result
  }, { list: [], nextStart: 0 }).list

  const gradient = segments.length
    ? `conic-gradient(${segments.map((s) => `${s.color} ${s.start}% ${s.start + s.pct}%`).join(', ')})`
    : 'conic-gradient(#e2e8f0 0% 100%)'

  return (
    <div className="rounded-[var(--radius-lg)] border border-slate-200/90 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="mb-1 font-display text-lg font-semibold text-slate-900">{title}</h3>
        {description ? <p className="mb-0 text-sm text-slate-600">{description}</p> : null}
      </div>
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
        <div
          className="h-44 w-44 shrink-0 rounded-full border-4 border-white shadow-md"
          style={{ background: gradient }}
          role="img"
          aria-label="Distribution chart"
        />
        <ul className="min-w-0 flex-1 space-y-2">
          {segments.length ? segments.map((s) => (
            <li key={s.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                <span className="truncate font-medium text-slate-700">{s.label}</span>
              </span>
              <span className="shrink-0 font-semibold text-slate-900">{s.value}</span>
            </li>
          )) : <li className="text-sm text-slate-500">No data.</li>}
        </ul>
      </div>
    </div>
  )
}

export function SimpleLineChart({ items = [], title, description, color = '#11b37f' }) {
  const nums = items.map((i) => Math.max(0, Number(i.value) || 0))
  const max = Math.max(...nums, 1)
  const w = 320
  const h = 140
  const pad = 8
  const pts = items.length
    ? items.map((item, idx) => {
        const x = pad + (idx / Math.max(items.length - 1, 1)) * (w - pad * 2)
        const y = h - pad - (nums[idx] / max) * (h - pad * 2)
        return `${x},${y}`
      }).join(' ')
    : ''

  return (
    <div className="rounded-[var(--radius-lg)] border border-slate-200/90 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="mb-1 font-display text-lg font-semibold text-slate-900">{title}</h3>
        {description ? <p className="mb-0 text-sm text-slate-600">{description}</p> : null}
      </div>
      {items.length ? (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-h-40 text-slate-900" aria-hidden>
          <defs>
            <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={pts}
          />
        </svg>
      ) : (
        <p className="text-sm text-slate-500">No trend data.</p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item.label} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}
