import { motion } from 'framer-motion'
import Offcanvas from 'react-bootstrap/Offcanvas'
import { Bell, Compass, LayoutDashboard, LogOut, Menu, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import { AppLogo } from './ui.jsx'

export function AppShell({
  children,
  currentSection,
  onLogout,
  onSectionChange,
  sections,
  setSidebarOpen,
  sidebarOpen,
  user,
}) {
  const roleLabel = user?.role === 'COLLEGE_ADMIN' ? 'College Admin' : 'Student Organizer'

  return (
    <div className="min-h-screen hero-gradient">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1800px] items-center justify-between gap-5 px-6 py-5 sm:px-8 lg:px-12 xl:px-14">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="glass-panel elevated-hover inline-flex h-12 w-12 items-center justify-center rounded-[18px] lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open workspace menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <AppLogo />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden min-w-[260px] rounded-[18px] border border-slate-300 bg-white px-6 py-4 text-right shadow-sm md:block">
              <p className="mb-0 text-[1.05rem] font-semibold text-slate-900">{user?.full_name}</p>
              <p className="mb-0 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-slate-800">{roleLabel}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1800px] grid-cols-1 gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[420px_minmax(0,1fr)] lg:gap-10 lg:px-12 xl:px-14">
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
