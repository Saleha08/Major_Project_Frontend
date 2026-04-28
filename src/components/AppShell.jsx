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
  const roleLabel = user?.role === 'COLLEGE_ADMIN' ? 'College Admin' : 'Student Organizer'

  return (
    <div className="min-h-screen hero-gradient">
      <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-4 px-6 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-12 xl:px-14">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              className="glass-panel elevated-hover inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open workspace menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden lg:block">
              <AppLogo />
            </div>
            <p className="truncate font-display text-lg font-semibold text-slate-900 lg:hidden">CampusConnect</p>
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-3 lg:max-w-xl">
            <label className="relative flex w-full items-center">
              <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" aria-hidden />
              <input
                type="search"
                readOnly
                placeholder={headerSearchPlaceholder}
                className="w-full min-h-11 rounded-[var(--radius-lg)] border border-slate-200 bg-slate-50/90 py-2.5 pl-10 pr-4 text-sm text-slate-600 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                aria-label="Workspace search"
              />
            </label>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-3">
            <button
              type="button"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-brand-300 hover:text-brand-600"
              onClick={() => onSectionChange('notifications')}
              aria-label={`Notifications${unreadNotifications ? `, ${unreadNotifications} unread` : ''}`}
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              ) : null}
            </button>
            <div className="hidden min-w-[200px] rounded-[var(--radius-lg)] border border-slate-200 bg-white px-4 py-3 text-right shadow-sm sm:block">
              <p className="mb-0 truncate text-sm font-semibold text-slate-900">{user?.full_name}</p>
              <p className="mb-0 text-[0.7rem] font-semibold uppercase tracking-wider text-slate-500">{roleLabel}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1800px] grid-cols-1 gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[minmax(280px,380px)_minmax(0,1fr)] lg:gap-10 lg:px-12 xl:px-14">
        <aside className="hidden lg:block">
          <SidebarCard
            currentSection={currentSection}
            onLogout={onLogout}
            onSectionChange={onSectionChange}
            sections={sections}
            user={user}
          />
        </aside>

        <main className="min-w-0 pt-1">{children}</main>
      </div>

      <Offcanvas show={sidebarOpen} onHide={() => setSidebarOpen(false)} placement="start" className="bg-transparent">
        <Offcanvas.Header closeButton className="border-b border-slate-200 bg-white" />
        <Offcanvas.Body className="bg-slate-100 p-4">
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
    <div className="glass-panel rounded-[20px] p-8">
      <div className="mb-8 rounded-[20px] bg-slate-950 p-9 text-white shadow-lg shadow-slate-950/15">
        <p className="mb-2 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
          Workspace
        </p>
        <h2 className="mb-3 font-display text-[2.8rem] leading-[1.02] font-semibold tracking-tight">{user?.full_name}</h2>
        <p className="mb-0 text-[1.05rem] leading-8 text-white/90">
          One place for campus events, applicants, talent search, and approvals.
        </p>
      </div>

      <nav aria-label="Workspace sections" className="space-y-3">
        {sections.map((section) => {
          const Icon = section.icon || icons.extras
          const active = currentSection === section.key

          return (
            <motion.button
              key={section.key}
              whileHover={{ x: 4 }}
              type="button"
              onClick={() => onSectionChange(section.key)}
              className={`flex min-h-16 w-full items-center justify-between rounded-[18px] px-6 py-4 text-left transition ${
                active
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                  : 'bg-transparent text-slate-800 hover:bg-white hover:text-slate-950'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span className="text-[1.05rem] font-semibold">{section.label}</span>
              </span>
              {section.badge ? <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">{section.badge}</span> : null}
            </motion.button>
          )
        })}
      </nav>

      <button
        type="button"
        onClick={onLogout}
        className="mt-8 flex min-h-16 w-full items-center justify-center gap-2 rounded-[18px] border border-slate-300 bg-white px-6 py-4 text-[1.02rem] font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:text-rose-600"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  )
}
