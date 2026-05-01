/**
 * Lightweight SVG charts — no extra chart library.
 */

const COLORS = ['#11b37f', '#7c3aed', '#0ea5e9', '#f59e0b', '#ec4899', '#64748b']

/* ─── Pie / Donut Chart ──────────────────────────────────────── */
export function SimplePieChart({ items = [], title, description }) {
  const total = items.reduce((s, i) => s + Math.max(0, Number(i.value) || 0), 0)
  const safe = total > 0 ? total : 1

  const segments = items.reduce(
    (result, item, idx) => {
      const v = Math.max(0, Number(item.value) || 0)
      const pct = (v / safe) * 100
      const start = result.nextStart
      result.list.push({ ...item, pct, start, color: item.color || COLORS[idx % COLORS.length] })
      result.nextStart += pct
      return result
    },
    { list: [], nextStart: 0 },
  ).list

  const gradient = segments.length
    ? `conic-gradient(${segments.map((s) => `${s.color} ${s.start}% ${s.start + s.pct}%`).join(', ')})`
    : 'conic-gradient(#e0f2fe 0% 100%)'

  return (
    <div
      className="rounded-[var(--radius-xl)] border border-sky-100/80 bg-white p-6"
      style={{ boxShadow: 'var(--shadow-xs)' }}
    >
      <div className="mb-5">
        <h3 className="font-display text-base font-semibold text-slate-900">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {/* Donut */}
        <div className="relative shrink-0">
          <div
            className="h-36 w-36 rounded-full"
            style={{ background: gradient, boxShadow: '0 4px 20px rgba(14,165,233,0.15)' }}
            role="img"
            aria-label="Distribution chart"
          />
          {/* Center hole */}
          <div className="absolute inset-[18%] rounded-full bg-white" />
        </div>
        {/* Legend */}
        <ul className="min-w-0 flex-1 space-y-2">
          {segments.length
            ? segments.map((s) => (
                <li key={s.label} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                    <span className="truncate font-medium text-slate-700">{s.label}</span>
                  </span>
                  <span className="shrink-0 font-bold text-slate-900">{s.value}</span>
                </li>
              ))
            : <li className="text-sm text-slate-400">No data.</li>}
        </ul>
      </div>
    </div>
  )
}

/* ─── Line Chart ─────────────────────────────────────────────── */
export function SimpleLineChart({ items = [], title, description, color = '#11b37f' }) {
  const nums = items.map((i) => Math.max(0, Number(i.value) || 0))
  const max = Math.max(...nums, 1)
  const w = 320
  const h = 120
  const pad = 10

  const pts = items.length
    ? items.map((item, idx) => {
        const x = pad + (idx / Math.max(items.length - 1, 1)) * (w - pad * 2)
        const y = h - pad - (nums[idx] / max) * (h - pad * 2)
        return `${x},${y}`
      }).join(' ')
    : ''

  const areaPath = items.length
    ? `M ${pad},${h - pad} ` +
      items.map((item, idx) => {
        const x = pad + (idx / Math.max(items.length - 1, 1)) * (w - pad * 2)
        const y = h - pad - (nums[idx] / max) * (h - pad * 2)
        return `L ${x},${y}`
      }).join(' ') +
      ` L ${w - pad},${h - pad} Z`
    : ''

  const gradId = `lineFill-${color.replace('#', '')}`

  return (
    <div
      className="rounded-[var(--radius-xl)] border border-sky-100/80 bg-white p-6"
      style={{ boxShadow: 'var(--shadow-xs)' }}
    >
      <div className="mb-4">
        <h3 className="font-display text-base font-semibold text-slate-900">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>

      {items.length ? (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: '120px' }} aria-hidden>
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${gradId})`} />
          <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={pts} />
          {items.map((item, idx) => {
            const x = pad + (idx / Math.max(items.length - 1, 1)) * (w - pad * 2)
            const y = h - pad - (nums[idx] / max) * (h - pad * 2)
            return <circle key={item.label} cx={x} cy={y} r="3.5" fill="white" stroke={color} strokeWidth="2" />
          })}
        </svg>
      ) : (
        <p className="text-sm text-slate-400">No trend data.</p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item.label} className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 border border-sky-100">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}
