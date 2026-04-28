import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info, Loader2, Search, X } from 'lucide-react'

export function AppLogo({ collapsed = false }) {
  return (
    <div className="sidebar-logo">
      <div className="sidebar-logo-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {!collapsed && (
        <div>
          <div className="sidebar-logo-text">CampusConnect</div>
          <div className="sidebar-logo-sub">Enterprise</div>
        </div>
      )}
    </div>
  )
}

export function SectionCard({ title, description, action, children, className = '' }) {
  return (
    <div className={`card ${className}`}>
      {(title || description || action) && (
        <div className="card-header">
          <div>
            {title && <h2 className="card-title">{title}</h2>}
            {description && <p className="card-description">{description}</p>}
          </div>
          {action && <div style={{ flexShrink: 0 }}>{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

export function StatCard({ label, value, helper, icon: Icon, trend }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="stat-card"
    >
      {Icon && (
        <div className="stat-icon">
          <Icon size={18} />
        </div>
      )}
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-helper">{helper}</div>
      {trend && (
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{
            fontSize: '0.72rem', fontWeight: 700,
            color: trend > 0 ? 'var(--success)' : 'var(--danger)',
            background: trend > 0 ? 'var(--success-bg)' : 'var(--danger-bg)',
            padding: '2px 7px', borderRadius: 20
          }}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>vs last week</span>
        </div>
      )}
    </motion.div>
  )
}

export function Pill({ children, tone = 'default' }) {
  const toneMap = {
    default: 'badge-default',
    success: 'badge-success',
    warn: 'badge-warning',
    info: 'badge-info',
    danger: 'badge-danger',
    accent: 'badge-accent',
  }
  return <span className={`badge ${toneMap[tone] || 'badge-default'}`}>{children}</span>
}

export function PrimaryButton({ children, className = '', busy = false, type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`btn btn-primary ${className}`}
      disabled={busy || props.disabled}
      {...props}
    >
      {busy ? <div className="spinner" /> : null}
      {children}
    </button>
  )
}

export function SecondaryButton({ children, className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`btn btn-secondary ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function DangerButton({ children, className = '', ...props }) {
  return (
    <button type="button" className={`btn btn-danger ${className}`} {...props}>
      {children}
    </button>
  )
}

export function Field({ label, hint, children }) {
  return (
    <div className="form-field">
      {label && <label className="form-label">{label}</label>}
      {children}
      {hint && <span className="form-hint">{hint}</span>}
    </div>
  )
}

export function Input({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`form-input ${className}`}
    />
  )
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      {...props}
      className={`form-input form-textarea ${className}`}
    />
  )
}

export function Select({ className = '', children, ...props }) {
  return (
    <select {...props} className={`form-input form-select ${className}`}>
      {children}
    </select>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="search-input-wrap">
      <Search className="search-input-icon" size={16} />
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="form-input"
        style={{ paddingLeft: 38 }}
      />
    </div>
  )
}

export function EmptyState({ title, message, action, icon: Icon }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        {Icon ? <Icon size={24} /> : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
          </svg>
        )}
      </div>
      <div className="empty-state-title">{title}</div>
      <p className="empty-state-desc">{message}</p>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  )
}

export function AlertBanner({ tone = 'info', message, onClose }) {
  if (!message) return null

  const toneClass = {
    info: 'alert-info',
    success: 'alert-success',
    danger: 'alert-danger',
    warning: 'alert-warning',
  }

  const icons = {
    info: Info,
    success: CheckCircle2,
    danger: AlertCircle,
    warning: AlertCircle,
  }

  const Icon = icons[tone] || Info

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className={`alert ${toneClass[tone] || 'alert-info'}`}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <Icon size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{message}</span>
        </div>
        {onClose && (
          <button type="button" className="alert-close" onClick={onClose} aria-label="Dismiss">
            <X size={14} />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--navy-900, #0d1424)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16
    }}>
      <div style={{
        width: 44, height: 44,
        background: 'linear-gradient(135deg, #6366f1, #818cf8)',
        borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(99,102,241,0.4)'
      }}>
        <Loader2 size={22} color="white" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
      <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.83rem', fontWeight: 500 }}>{message}</span>
    </div>
  )
}

export function Divider({ label }) {
  if (label) {
    return (
      <div className="section-divider">{label}</div>
    )
  }
  return <div className="divider" />
}

export function SkillTag({ children }) {
  return <span className="skill-tag">{children}</span>
}

export function Avatar({ name, size = 34 }) {
  const initials = name
    ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '??'

  return (
    <div style={{
      width: size, height: size,
      borderRadius: Math.round(size * 0.27),
      background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      fontSize: size * 0.32,
      fontWeight: 700,
      color: 'white',
      letterSpacing: '0.03em'
    }}>
      {initials}
    </div>
  )
}