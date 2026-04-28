import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, CalendarCheck2, LayoutPanelTop, ShieldCheck, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import * as eventsService from '../services/events.js'
import { formatDate, toArray } from '../lib/api.js'
import { AppLogo, Pill, PrimaryButton, SearchInput, SectionCard, Select, StatCard } from '../components/ui.jsx'

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

    eventsService.fetchPublicEvents(null, Object.fromEntries(query))
      .then((response) => {
        setEvents(response.data?.events || [])
      })
      .catch((error) => {
        setMessage(error.message)
      })
  }, [search, category])

  return (
    <div className="min-h-screen hero-gradient">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <AppLogo />
        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="hidden rounded-[var(--radius-lg)] border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-600 sm:inline-flex"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pb-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="surface-panel rounded-[32px] p-6 md:p-8"
          >
            <Pill tone="success">Campus communities that move fast</Pill>
            <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
              Discover events, recruit collaborators, and keep every campus opportunity in one flow.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              CampusConnect brings student events, applications, student discovery, and admin approvals into one responsive workspace.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/auth">
                <PrimaryButton>
                  Launch workspace
                  <ArrowRight className="h-4 w-4" />
                </PrimaryButton>
              </Link>
              <a
                href="#events"
                className="inline-flex min-h-11 items-center rounded-[var(--radius-lg)] border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-300 hover:text-brand-600"
              >
                Browse live events
              </a>
            </div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <StatCard label="Live event discovery" value="06+" helper="Fast public browsing with search and category filters." icon={CalendarCheck2} />
            <StatCard label="Role-aware workspace" value="3 views" helper="Student, organizer, and admin experiences stay separate." icon={LayoutPanelTop} />
            <StatCard label="Admin moderation" value="1 queue" helper="Review pending events and keep approvals moving." icon={ShieldCheck} />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <FeatureCard
            icon={UsersRound}
            title="Student discovery"
            text="Search across skills, interests, year, and department once you’re inside the workspace."
          />
          <FeatureCard
            icon={CalendarCheck2}
            title="Event lifecycle"
            text="Create events, track applicants, shortlist candidates, and keep communication centralized."
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Admin controls"
            text="Approve or reject submissions with a focused moderation panel built for fast review."
          />
        </section>

        <SectionCard
          title="Featured events"
          description="Publicly approved opportunities pulled from your backend."
          className="scroll-mt-20"
          action={<Link to="/auth" className="text-sm font-medium text-brand-600 hover:underline">Open full workspace</Link>}
        >
          <div id="events" className="mb-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title, event name, or description" />
            <Select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="min-h-11 rounded-[var(--radius-lg)] text-sm"
              aria-label="Filter events by category"
            >
              <option value="">All categories</option>
              <option value="TECH">Tech</option>
              <option value="CULTURAL">Cultural</option>
              <option value="SPORTS">Sports</option>
            </Select>
          </div>

          {message ? <p className="mb-4 text-sm text-rose-500">{message}</p> : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event, index) => (
              <motion.article
                key={event.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-panel flex h-full flex-col rounded-[28px] p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <Pill tone={event.category === 'TECH' ? 'info' : event.category === 'SPORTS' ? 'warn' : 'success'}>
                    {event.category}
                  </Pill>
                  <Pill tone="default">{event.status}</Pill>
                </div>
                <h3 className="mb-2 font-display text-xl font-semibold tracking-tight">{event.title}</h3>
                <p className="mb-4 text-sm text-slate-600">{event.description}</p>
                <div className="mt-auto space-y-3 text-sm text-slate-600">
                  <p className="mb-0"><span className="font-medium text-slate-800">Event:</span> {event.event_name}</p>
                  <p className="mb-0"><span className="font-medium text-slate-800">Organizer:</span> {event.organizer?.full_name || 'Campus team'}</p>
                  <p className="mb-0"><span className="font-medium text-slate-800">Deadline:</span> {formatDate(event.deadline)}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {toArray(event.required_skills).slice(0, 3).map((skill) => (
                      <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{skill}</span>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </SectionCard>
      </main>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <motion.article whileHover={{ y: -4 }} className="glass-panel rounded-[var(--radius-xl)] p-6 shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="mb-2 font-display text-xl font-semibold">{title}</h2>
      <p className="mb-0 text-sm leading-6 text-slate-600">{text}</p>
    </motion.article>
  )
}

export default HomePage
