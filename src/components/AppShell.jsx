import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, ChevronRight, LayoutDashboard, LogOut, Menu, X,
  Compass, CalendarPlus2, Briefcase, SearchCode, UserRound,
  ShieldCheck, Bookmark, Sparkles
} from 'lucide-react'
import { Avatar } from './ui.jsx'

const SECTION_ICONS = {
  overview: LayoutDashboard,
  discover: Compass,
  saved: Bookmark,
  events: CalendarPlus2,
  applications: Briefcase,
  students: SearchCode,
  notifications: Bell,
  profile: UserRound,
  admin: ShieldCheck,
  extras: Sparkles,
}

export function AppShell({
  children,
  currentSection,
  onLogout,
  onSectionChange,
  sections,
  setSidebarOpen,
  sidebarOpen,
  user,
  unreadCount = 0,
}) {
  const isAdmin = user?.role === 'COLLEGE_ADMIN'
  const roleLabel = isAdmin ? 'College Admin' : 'Student / Organizer'

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  const currentSectionLabel = sections.find(s => s.key === currentSection)?.label || 'Workspace'

  return (
    <div className="app-shell">
      {/* Sidebar overlay for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              zIndex: 39, backdropFilter: 'blur(2px)'
            }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="sidebar-logo-text">CampusConnect</div>
            <div className="sidebar-logo-sub">Platform</div>
          </div>
        </div>

        {/* Nav sections */}
        <div className="sidebar-section" style={{ flex: 1 }}>
          <div className="sidebar-section-label">Navigation</div>

          {sections.map((section) => {
            const Icon = section.icon || SECTION_ICONS[section.key] || Sparkles
            const active = currentSection === section.key
            const badge = section.key === 'notifications' && unreadCount > 0
              ? unreadCount
              : section.badge

            return (
              <button
                key={section.key}
                type="button"
                onClick={() => {
                  onSectionChange(section.key)
                  setSidebarOpen(false)
                }}
                className={`sidebar-nav-item ${active ? 'active' : ''}`}
              >
                <Icon className="sidebar-nav-icon" size={17} />
                <span>{section.label}</span>
                {badge ? (
                  <span className="sidebar-badge">{badge}</span>
                ) : null}
              </button>
            )
          })}

          <div style={{ marginTop: 20 }}>
            <div className="sidebar-section-label">Account</div>
            <button
              type="button"
              onClick={onLogout}
              className="sidebar-nav-item"
              style={{ color: 'rgba(239,68,68,0.7)' }}
            >
              <LogOut size={17} style={{ opacity: 0.8 }} />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* Footer user info */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sidebar-user-name">{user?.full_name || 'User'}</div>
              <div className="sidebar-user-role">{roleLabel}</div>
            </div>
            <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
          </div>
        </div>
      </nav>

      {/* Main area */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            {/* Mobile menu */}
            <button
              type="button"
              className="topbar-icon-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
              style={{ display: 'none' }}
              id="mobile-menu-btn"
            >
              {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
            <button
              type="button"
              className="topbar-icon-btn lg-hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              <Menu size={16} />
            </button>

            {/* Breadcrumb */}
            <div className="topbar-breadcrumb">
              <span>Workspace</span>
              <ChevronRight size={13} />
              <span className="topbar-breadcrumb-current">{currentSectionLabel}</span>
            </div>
          </div>

          <div className="topbar-right">
            {/* Notification bell */}
            <button type="button" className="topbar-icon-btn" aria-label="Notifications">
              <Bell size={16} />
              {unreadCount > 0 && <span className="topbar-notif-dot" />}
            </button>

            {/* Profile chip */}
            <div className="topbar-profile">
              <Avatar name={user?.full_name} size={28} />
              <div className="topbar-profile-info">
                <div className="topbar-profile-name">{user?.full_name}</div>
                <div className="topbar-profile-role">{roleLabel}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page body */}
        <main>
          <div className="page-content">
            {children}
          </div>
        </main>
      </div>

      <style>{`
        .lg-hidden {
          display: flex;
        }
        @media (min-width: 1025px) {
          .lg-hidden { display: none !important; }
        }
      `}</style>
    </div>
  )
}