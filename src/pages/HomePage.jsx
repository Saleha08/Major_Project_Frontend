import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, CalendarCheck2, LayoutPanelTop, ShieldCheck, Sparkles, UsersRound, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import * as eventsService from '../services/events.js'
import { formatDate, toArray } from '../lib/api.js'
import { AppLogo, Pill, PrimaryButton, SearchInput, SectionCard, Select, StatCard } from '../components/ui.jsx'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: [0.33, 1, 0.68, 1] },
  }),
}

function HomePage() {
  const [events, setEvents] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const query = new URLSearchParams()
    if (search) query.set('search', search)
    if (category) query.set('category', category)
    query.set('limit', '6')

    eventsService
      .fetchPublicEvents(null, Object.fromEntries(query))
      .then((r) => setEvents(r.data?.events || []))
      .catch((e) => setMessage(e.message))
  }, [search, category])

  return (
    <div className="min-h-screen">

      {/* ── Navbar ── */}
      <header
        className="sticky top-0 z-30 border-b border-sky-100/80 bg-white/90 backdrop-blur-xl"
        style={{ boxShadow: '0 1px 0 rgba(14,165,233,0.08)' }}
      >
        <div className="flex w-full items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <AppLogo />
          <nav className="flex items-center gap-3">
            <a
              href="#events"
              className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
            >
              Browse events
            </a>
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 rounded-[12px] border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-300 hover:text-brand-600"
            >
              Sign in
            </Link>
            <Link to="/auth">
              <PrimaryButton className="hidden sm:inline-flex gap-2 px-5 py-2.5 text-sm">
                Get started
                <ArrowRight className="h-4 w-4" />
              </PrimaryButton>
            </Link>
          </nav>
        </div>
      </header>

      <main className="w-full px-6 pb-16 pt-8 lg:px-10">

        {/* ── Hero ── */}
        <section className="mb-10 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">

          {/* Hero card */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="show"
            className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-slate-200/80 bg-white p-8 md:p-10"
            style={{ boxShadow: 'var(--shadow-md)' }}
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, #11b37f 0%, transparent 70%)' }} aria-hidden />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-56 w-56 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} aria-hidden />

            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700">
                <Sparkles className="h-4 w-4" />
                Campus communities that move fast
              </div>

              <h1
                className="mb-5 font-display font-bold tracking-tight text-slate-900"
                style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', lineHeight: 1.1 }}
              >
                Discover events, recruit collaborators, and keep every campus opportunity in one flow.
              </h1>

              <p className="mb-8 text-lg leading-relaxed text-slate-500">
                CampusConnect brings student events, applications, student discovery, and admin approvals into one responsive workspace.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link to="/auth">
                  <PrimaryButton className="px-7 py-3.5 text-base gap-2">
                    Launch workspace
                    <ArrowRight className="h-4 w-4" />
                  </PrimaryButton>
                </Link>
                <a
                  href="#events"
                  className="inline-flex items-center gap-2 rounded-[14px] border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 shadow-sm transition hover:border-brand-300 hover:text-brand-600"
                >
                  Browse live events
                </a>
              </div>
            </div>
          </motion.div>

          {/* Stat cards */}
          <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
            {[
              { label: 'Live event discovery', value: '06+', helper: 'Fast public browsing with search and category filters.', icon: CalendarCheck2, accent: 'teal', delay: 1 },
              { label: 'Role-aware workspace', value: '3 views', helper: 'Student, organizer, and admin experiences stay separate.', icon: LayoutPanelTop, accent: 'purple', delay: 2 },
              { label: 'Admin moderation', value: '1 queue', helper: 'Review pending events and keep approvals moving.', icon: ShieldCheck, accent: 'blue', delay: 3 },
            ].map((stat) => (
              <motion.div key={stat.label} variants={fadeUp} initial="hidden" animate="show" custom={stat.delay} className="flex-1">
                <StatCard {...stat} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Feature cards ── */}
        <section className="mb-10 grid gap-5 sm:grid-cols-3">
          {[
            { icon: UsersRound, title: 'Student discovery', text: "Search across skills, interests, year, and department once you're inside the workspace.", color: 'from-brand-400 to-brand-600', delay: 0, tint: 'teal' },
            { icon: CalendarCheck2, title: 'Event lifecycle', text: 'Create events, track applicants, shortlist candidates, and keep communication centralized.', color: 'from-violet-500 to-violet-700', delay: 1, tint: 'purple' },
            { icon: ShieldCheck, title: 'Admin controls', text: 'Approve or reject submissions with a focused moderation panel built for fast review.', color: 'from-sky-400 to-sky-600', delay: 2, tint: 'blue' },
          ].map((f) => <FeatureCard key={f.title} {...f} />)}
        </section>

        {/* ── Events section ── */}
        <SectionCard
          title="Featured events"
          description="Publicly approved opportunities pulled from your backend."
          className="scroll-mt-20"
          action={
            <Link to="/auth" className="inline-flex items-center gap-1.5 text-base font-semibold text-brand-600 transition hover:text-brand-700">
              Open full workspace <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          <div id="events" className="mb-5 flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, event name, or description" />
            </div>
            <Select value={category} onChange={(e) => setCategory(e.target.value)} className="sm:w-52" aria-label="Filter by category">
              <option value="">All categories</option>
              <option value="TECH">Tech</option>
              <option value="CULTURAL">Cultural</option>
              <option value="SPORTS">Sports</option>
            </Select>
          </div>

          {message && (
            <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-base font-medium text-rose-600">{message}</p>
          )}

          {events.length === 0 && !message && (
            <div className="rounded-[var(--radius-xl)] border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
              <Zap className="mx-auto mb-3 h-9 w-9 text-slate-300" />
              <p className="text-base font-medium text-slate-500">No events found. Try a different search.</p>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {events.map((event, i) => <PublicEventCard key={event.id} event={event} index={i} />)}
          </div>
        </SectionCard>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200/80 bg-white/80 py-8">
        <div className="flex w-full flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-10">
          <AppLogo />
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} CampusConnect. Built for campus communities.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, text, color, delay, tint = 'white' }) {
  const tintClass = {
    white: 'bg-white',
    teal: 'card-tint-teal',
    blue: 'card-tint-blue',
    purple: 'card-tint-purple',
    amber: 'card-tint-amber',
  }[tint] || 'bg-white'

  return (
    <motion.article
      variants={fadeUp} initial="hidden" animate="show" custom={delay}
      whileHover={{ y: -4 }}
      className={`card-hover rounded-[var(--radius-xl)] border border-sky-100/80 p-7 transition ${tintClass}`}
      style={{ boxShadow: 'var(--shadow-xs)' }}
    >
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-md`}>
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="mb-2 font-display text-lg font-semibold text-slate-900">{title}</h2>
      <p className="text-base leading-relaxed text-slate-500">{text}</p>
    </motion.article>
  )
}

function PublicEventCard({ event, index }) {
  const categoryTone = event.category === 'TECH' ? 'info' : event.category === 'SPORTS' ? 'warn' : 'success'
  const accent = {
    TECH:     { tint: 'var(--card-tint-blue)',   bar: '#0ea5e9', border: 'rgba(14,165,233,0.18)' },
    CULTURAL: { tint: 'var(--card-tint-teal)',   bar: '#11b37f', border: 'rgba(17,179,127,0.18)' },
    SPORTS:   { tint: 'var(--card-tint-amber)',  bar: '#f59e0b', border: 'rgba(245,158,11,0.18)' },
  }[event.category] || { tint: 'var(--card-tint-blue)', bar: '#0ea5e9', border: 'rgba(14,165,233,0.18)' }

  return (
    <motion.article
      variants={fadeUp} initial="hidden" animate="show" custom={index}
      whileHover={{ y: -3 }}
      className="card-hover relative flex h-full flex-col overflow-hidden rounded-[var(--radius-xl)] p-6 transition"
      style={{ background: accent.tint, border: `1px solid ${accent.border}`, boxShadow: 'var(--shadow-xs)' }}
    >
      {/* Accent top bar */}
      <div className="absolute left-0 right-0 top-0 h-[3px] rounded-t-[var(--radius-xl)]" style={{ background: accent.bar }} aria-hidden />

      <div className="mb-4 flex items-center justify-between gap-2 pt-1">
        <Pill tone={categoryTone}>{event.category}</Pill>
        <Pill tone="default">{event.status}</Pill>
      </div>

      <h3 className="mb-2 font-display text-lg font-semibold text-slate-900 leading-snug">{event.title}</h3>
      <p className="mb-4 text-base leading-relaxed text-slate-500 line-clamp-2">{event.description}</p>

      <div className="mt-auto space-y-2 text-base text-slate-600">
        <p className="mb-0"><span className="font-semibold text-slate-800">Event:</span> {event.event_name}</p>
        <p className="mb-0"><span className="font-semibold text-slate-800">Organizer:</span> {event.organizer?.full_name || 'Campus team'}</p>
        <p className="mb-0"><span className="font-semibold text-slate-800">Deadline:</span> {formatDate(event.deadline)}</p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {toArray(event.required_skills).slice(0, 3).map((skill) => (
            <span key={skill} className="rounded-full bg-white/80 px-3 py-0.5 text-sm font-medium text-slate-600 border border-sky-100">{skill}</span>
          ))}
        </div>
      </div>

      <Link to="/auth" className="mt-5 block">
        <button type="button" className="btn-gradient-brand w-full rounded-[12px] py-3 text-base font-semibold text-white">
          Apply now
        </button>
      </Link>
    </motion.article>
  )
}

export default HomePage
