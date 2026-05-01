import { motion } from 'framer-motion'
import Offcanvas from 'react-bootstrap/Offcanvas'
import { Bell, Compass, LayoutDashboard, LogOut, Menu, Search, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import { AppLogo } from './ui.jsx'

export function AppShell({
  children,
  currentSection,
  headerSearchPlaceholder = 'Search workspace…',
  onLogout,
  onSectionChange,
  sections,
  setSidebarOpen,
  sidebarOpen,
  unreadNotifications = 0,
  user,
}) {
  const roleLabel = user?.role === 'COLLEGE_ADMIN' ? 'College Admin' : 'Student'

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      {/* ── Sticky top navbar ── */}
      <header
        className="sticky top-0 z-30 border-b border-sky-100/80 bg-white/90 backdrop-blur-xl"
        style={{ boxShadow: '0 1px 0 rgba(14,165,233,0.08), 0 4px 16px rgba(14,165,233,0.04)' }}
      >
        <div
          className="flex w-full items-center gap-4 px-4 py-3 sm:px-6"
        >
          {/* Mobile menu toggle */}
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-brand-300 hover:text-brand-600 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open workspace menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo — desktop */}
          <div className="hidden lg:block">
            <AppLogo />
          </div>

          {/* Logo text — mobile */}
          <p className="truncate font-display text-base font-semibold text-slate-900 lg:hidden">
            CampusConnect
          </p>

          {/* Search bar */}
          <div className="mx-auto hidden max-w-md flex-1 lg:flex">
            <label className="relative flex w-full items-center">
              <Search
                className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400"
                aria-hidden
              />
              <input
                type="search"
                readOnly
                placeholder={headerSearchPlaceholder}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-600 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                aria-label="Workspace search"
              />
            </label>
          </div>

          {/* Right actions */}
          <div className="ml-auto flex shrink-0 items-center gap-2.5">
            {/* Notification bell */}
            <button
              type="button"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600"
              onClick={() => onSectionChange('notifications')}
              aria-label={`Notifications${unreadNotifications ? `, ${unreadNotifications} unread` : ''}`}
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadNotifications > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white shadow-sm">
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}
            </button>

            {/* User chip */}
            <div className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2 shadow-sm sm:flex">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-bold text-white">
                {(user?.full_name || '?').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 leading-tight">
                  {user?.full_name}
                </p>
                <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-slate-400 leading-tight">
                  {roleLabel}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main layout ── */}
      <div className="grid w-full grid-cols-1 gap-0 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-[56px] h-[calc(100vh-56px)] overflow-y-auto soft-scrollbar">
            <SidebarCard
              currentSection={currentSection}
              onLogout={onLogout}
              onSectionChange={onSectionChange}
              sections={sections}
              user={user}
            />
          </div>
        </aside>

        {/* Page content */}
        <main className="min-w-0 p-4 sm:p-6">{children}</main>
      </div>

      {/* ── Mobile offcanvas sidebar ── */}
      <Offcanvas
        show={sidebarOpen}
        onHide={() => setSidebarOpen(false)}
        placement="start"
        className="bg-transparent border-0"
        style={{ maxWidth: '320px' }}
      >
        <Offcanvas.Header
          closeButton
          className="border-b border-slate-200 bg-white px-5 py-3"
        />
        <Offcanvas.Body className="bg-slate-100/80 p-4">
          <SidebarCard
            currentSection={currentSection}
            onLogout={() => {
              setSidebarOpen(false)
              onLogout()
            }}
            onSectionChange={(section) => {
              setSidebarOpen(false)
              onSectionChange(section)
            }}
            sections={sections}
            user={user}
          />
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  )
}

function SidebarCard({ currentSection, onLogout, onSectionChange, sections, user }) {
  const icons = {
    overview: LayoutDashboard,
    discover: Compass,
    profile: UserRound,
    notifications: Bell,
    admin: ShieldCheck,
    extras: Sparkles,
  }

  return (
    <div
      className="flex h-full flex-col border-r border-sky-100 bg-white"
    >
      {/* User hero block */}
      <div
        className="px-5 py-6"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f2744 100%)',
        }}
      >
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-base font-bold text-white shadow-md">
            {(user?.full_name || '?').slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-white leading-tight break-words">
              {user?.full_name}
            </p>
            <p className="text-sm font-medium text-white/60 leading-tight mt-0.5">
              {user?.role === 'COLLEGE_ADMIN' ? 'College Admin' : 'Student'}
            </p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-white/60">
          Campus events, applications, and approvals — all in one place.
        </p>
      </div>

      {/* Navigation */}
      <nav aria-label="Workspace sections" className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {sections.map((section) => {
            const Icon = section.icon || icons.extras
            const active = currentSection === section.key

            return (
              <motion.button
                key={section.key}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => onSectionChange(section.key)}
                className={`flex w-full items-center justify-between rounded-[10px] px-4 py-3 text-left transition-all ${
                  active
                    ? 'text-white shadow-sm'
                    : 'text-slate-600 hover:bg-sky-50 hover:text-slate-900'
                }`}
                style={active ? { background: 'var(--gradient-brand)', boxShadow: '0 4px 12px rgba(17,179,127,0.25)' } : {}}
                aria-current={active ? 'page' : undefined}
              >
                <span className="flex items-center gap-3">
                  <Icon
                    className={`h-5 w-5 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`}
                  />
                  <span className="text-base font-semibold">{section.label}</span>
                </span>
                {section.badge ? (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {section.badge}
                  </span>
                ) : null}
              </motion.button>
            )
          })}
        </div>
      </nav>

      {/* Sign out */}
      <div className="border-t border-slate-100 px-3 py-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-sky-200 bg-white px-4 py-3 text-base font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </button>
      </div>
    </div>
  )
}
