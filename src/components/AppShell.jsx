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
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 shadow-sm shadow-slate-900/5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex w-full max-w-[1800px] items-center justify-between gap-5 px-5 py-4 sm:px-8 lg:px-12 xl:px-14">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="glass-panel elevated-hover inline-flex h-12 w-12 items-center justify-center rounded-lg lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open workspace menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <AppLogo />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden min-w-[250px] rounded-lg border border-slate-300 bg-white px-5 py-3 text-right shadow-sm dark:border-slate-700 dark:bg-slate-900/80 md:block">
              <p className="mb-0 text-[1rem] font-semibold text-slate-900">{user?.full_name}</p>
              <p className="mb-0 text-[0.76rem] font-semibold uppercase text-soft">{roleLabel}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1800px] grid-cols-1 gap-7 px-5 py-7 sm:px-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-8 lg:px-12 xl:px-14">
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
        <Offcanvas.Body className="bg-slate-100 p-4 dark:bg-slate-950">
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
    <div className="glass-panel p-5">
      <div className="enterprise-strip mb-6 rounded-lg bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/15">
        <p className="mb-3 inline-flex items-center rounded-md bg-white/10 px-3 py-1 text-xs font-semibold uppercase text-white/75">
          Workspace
        </p>
        <h2 className="mb-3 font-display text-[2rem] leading-[1.05] font-semibold tracking-tight">{user?.full_name}</h2>
        <p className="mb-0 text-[0.96rem] leading-7 text-white/80">
          One place for campus events, applicants, talent search, and approvals.
        </p>
      </div>

      <nav aria-label="Workspace sections" className="space-y-2">
        {sections.map((section) => {
          const Icon = section.icon || icons.extras
          const active = currentSection === section.key

          return (
            <motion.button
              key={section.key}
              whileHover={{ x: 4 }}
              type="button"
              onClick={() => onSectionChange(section.key)}
              className={`flex min-h-12 w-full items-center justify-between rounded-lg px-4 py-3 text-left transition ${
                active
                  ? 'bg-gradient-to-r from-brand-600 to-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : 'bg-transparent text-slate-800 hover:bg-white hover:text-slate-950 dark:text-slate-200 dark:hover:bg-slate-900'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span className="text-[0.98rem] font-semibold">{section.label}</span>
              </span>
              {section.badge ? <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">{section.badge}</span> : null}
            </motion.button>
          )
        })}
      </nav>

      <button
        type="button"
        onClick={onLogout}
        className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-[0.98rem] font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  )
}
