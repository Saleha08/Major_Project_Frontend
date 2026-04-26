import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Modal from 'react-bootstrap/Modal'
import {
  Bell,
  Briefcase,
  CalendarPlus2,
  Compass,
  LayoutDashboard,
  SearchCode,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell.jsx'
import {
  AlertBanner,
  EmptyState,
  Field,
  Input,
  Pill,
  PrimaryButton,
  SearchInput,
  SectionCard,
  SecondaryButton,
  Select,
  StatCard,
  Textarea,
} from '../components/ui.jsx'
import { useApp } from '../context/useApp.js'
import { formatDate, formatDateTime, toArray } from '../lib/api.js'

const defaultEventForm = {
  title: '',
  event_name: '',
  category: 'TECH',
  number_of_positions: 1,
  deadline: '',
  description: '',
  required_skills: '',
}

const defaultProfileForm = {
  bio: '',
  department: '',
  year: '',
  profile_picture: '',
  skills: '',
  interests: '',
}

function WorkspacePage() {
  const navigate = useNavigate()
  const { api, logout, persistSession, token, user } = useApp()
  const userRole = user?.role
  const isAdmin = userRole === 'COLLEGE_ADMIN'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentSection, setCurrentSection] = useState('overview')
  const [banner, setBanner] = useState({ tone: 'info', message: '' })
  const [busy, setBusy] = useState('')
  const [eventForm, setEventForm] = useState(defaultEventForm)
  const [profileForm, setProfileForm] = useState(defaultProfileForm)
  const [studentFilters, setStudentFilters] = useState({ search: '', department: '', year: '', skills: '' })
  const [applyModal, setApplyModal] = useState({ open: false, eventId: '', eventTitle: '' })
  const [applyMessage, setApplyMessage] = useState('')
  const [selectedEventId, setSelectedEventId] = useState('')
  const [workspace, setWorkspace] = useState({
    events: [],
    myEvents: [],
    myApplications: [],
    notifications: [],
    pendingEvents: [],
    allAdminEvents: [],
    students: [],
    profile: null,
    experiences: [],
    eventApplications: [],
  })

  const sections = isAdmin
    ? [
        { key: 'overview', label: 'Overview', icon: LayoutDashboard },
        { key: 'admin', label: 'Admin Queue', icon: ShieldCheck },
        { key: 'notifications', label: 'Notifications', icon: Bell },
      ]
    : [
        { key: 'overview', label: 'Overview', icon: LayoutDashboard },
        { key: 'discover', label: 'Discover', icon: Compass },
        { key: 'events', label: 'My Events', icon: CalendarPlus2 },
        { key: 'applications', label: 'Applications', icon: Briefcase },
        { key: 'students', label: 'Students', icon: SearchCode },
        { key: 'notifications', label: 'Notifications', icon: Bell },
        { key: 'profile', label: 'Profile', icon: UserRound },
      ]

  const refreshWorkspace = useCallback(async () => {
    try {
      const [
        me,
        publicEvents,
        myEvents,
        myApplications,
        notifications,
        profileResult,
        pendingEventsResult,
        allAdminEventsResult,
      ] = await Promise.allSettled([
        api.get('/auth/me', { token }),
        api.get('/events?limit=12', { token }),
        api.get('/events/my-events?limit=20', { token }),
        api.get('/applications/my-applications?limit=20', { token }),
        api.get('/notifications?limit=20', { token }),
        api.get('/profile', { token }),
        userRole === 'COLLEGE_ADMIN' ? api.get('/admin/events/pending?limit=20', { token }) : Promise.resolve(null),
        userRole === 'COLLEGE_ADMIN' ? api.get('/admin/events?limit=20', { token }) : Promise.resolve(null),
      ])

      const requiredFailures = [me, publicEvents, myEvents, myApplications, notifications]
        .filter((result) => result.status === 'rejected')

      if (requiredFailures.length > 0) {
        throw requiredFailures[0].reason
      }

      const meData = me.value
      const publicEventsData = publicEvents.value
      const myEventsData = myEvents.value
      const myApplicationsData = myApplications.value
      const notificationsData = notifications.value
      const profileData = profileResult.status === 'fulfilled' ? profileResult.value : null
      const pendingEventsData = pendingEventsResult.status === 'fulfilled' ? pendingEventsResult.value : null
      const allAdminEventsData = allAdminEventsResult.status === 'fulfilled' ? allAdminEventsResult.value : null

      const nextUser = meData.data?.user || user
      if (
        nextUser &&
        (
          nextUser.id !== user?.id ||
          nextUser.role !== user?.role ||
          nextUser.full_name !== user?.full_name ||
          nextUser.email !== user?.email ||
          nextUser.status !== user?.status
        )
      ) {
        persistSession(token, nextUser)
      }
      setWorkspace((current) => ({
        ...current,
        events: publicEventsData.data?.events || [],
        myEvents: myEventsData.data?.events || [],
        myApplications: myApplicationsData.data?.applications || [],
        notifications: notificationsData.data?.notifications || [],
        pendingEvents: pendingEventsData?.data?.events || [],
        allAdminEvents: allAdminEventsData?.data?.events || [],
        profile: profileData?.data?.profile || null,
        experiences: profileData?.data?.experiences || [],
      }))

      if (profileData?.data?.profile) {
        setProfileForm({
          bio: profileData.data.profile.bio || '',
          department: profileData.data.profile.department || '',
          year: profileData.data.profile.year || '',
          profile_picture: profileData.data.profile.profile_picture || '',
          skills: toArray(profileData.data.profile.skills).join(', '),
          interests: toArray(profileData.data.profile.interests).join(', '),
        })
      }
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
      if (error.status === 401) {
        logout()
        navigate('/auth')
      }
    }
  }, [api, logout, navigate, persistSession, token, user, userRole])

  const searchStudents = useCallback(async (event) => {
    if (event) event.preventDefault()
    setBusy('students')

    const query = new URLSearchParams()
    if (studentFilters.search) query.set('search', studentFilters.search)
    if (studentFilters.department) query.set('department', studentFilters.department)
    if (studentFilters.year) query.set('year', studentFilters.year)
    toArray(studentFilters.skills).forEach((skill) => query.append('skills', skill))

    try {
      const response = await api.get(`/students/search?${query.toString()}`, { token })
      setWorkspace((current) => ({
        ...current,
        students: response.data?.students || [],
      }))
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally {
      setBusy('')
    }
  }, [api, studentFilters, token])

  async function handleCreateEvent(event) {
    event.preventDefault()
    setBusy('event')

    try {
      await api.post('/events', {
        ...eventForm,
        number_of_positions: Number(eventForm.number_of_positions),
        required_skills: toArray(eventForm.required_skills),
      }, { token })
      setEventForm(defaultEventForm)
      setBanner({ tone: 'success', message: 'Event submitted. It is now waiting for admin approval.' })
      await refreshWorkspace()
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally {
      setBusy('')
    }
  }

  async function handleUpdateProfile(event) {
    event.preventDefault()
    setBusy('profile')

    try {
      const payload = {}

      if (profileForm.bio.trim()) payload.bio = profileForm.bio.trim()
      if (profileForm.department.trim()) payload.department = profileForm.department.trim()
      if (profileForm.year !== '') payload.year = Number(profileForm.year)
      if (profileForm.profile_picture.trim()) payload.profile_picture = profileForm.profile_picture.trim()
      if (toArray(profileForm.skills).length) payload.skills = toArray(profileForm.skills)
      if (toArray(profileForm.interests).length) payload.interests = toArray(profileForm.interests)

      if (Object.keys(payload).length === 0) {
        setBanner({ tone: 'danger', message: 'Add at least one valid profile field before saving.' })
        setBusy('')
        return
      }

      await api.put('/profile', payload, { token })
      setBanner({ tone: 'success', message: 'Profile updated successfully.' })
      await refreshWorkspace()
    } catch (error) {
      const fieldErrors = error.payload?.errors?.map((item) => item.message).join(' ')
      setBanner({ tone: 'danger', message: fieldErrors || error.message })
    } finally {
      setBusy('')
    }
  }

  async function handleApplyToEvent() {
    setBusy('apply')

    try {
      await api.post('/applications', {
        event_id: applyModal.eventId,
        message: applyMessage,
      }, { token })
      setApplyModal({ open: false, eventId: '', eventTitle: '' })
      setApplyMessage('')
      setBanner({ tone: 'success', message: 'Application submitted successfully.' })
      await refreshWorkspace()
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally {
      setBusy('')
    }
  }

  const fetchEventApplications = useCallback(async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/applications?limit=20`, { token })
      setWorkspace((current) => ({
        ...current,
        eventApplications: response.data?.applications || [],
      }))
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    }
  }, [api, token])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      refreshWorkspace()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [refreshWorkspace])

  useEffect(() => {
    if (currentSection === 'students' && token) {
      const timer = window.setTimeout(() => {
        searchStudents()
      }, 0)

      return () => window.clearTimeout(timer)
    }
  }, [currentSection, searchStudents, token])

  useEffect(() => {
    if (selectedEventId && token) {
      const timer = window.setTimeout(() => {
        fetchEventApplications(selectedEventId)
      }, 0)

      return () => window.clearTimeout(timer)
    }
  }, [fetchEventApplications, selectedEventId, token])

  useEffect(() => {
    if (isAdmin && ['discover', 'events', 'applications', 'students', 'profile'].includes(currentSection)) {
      const timer = window.setTimeout(() => {
        setCurrentSection('overview')
      }, 0)

      return () => window.clearTimeout(timer)
    }
  }, [currentSection, isAdmin])

  async function handleStatusUpdate(applicationId, status) {
    setBusy(applicationId)

    try {
      await api.patch(`/applications/${applicationId}/status`, { status }, { token })
      setBanner({ tone: 'success', message: `Application moved to ${status}.` })
      await refreshWorkspace()
      if (selectedEventId) {
        await fetchEventApplications(selectedEventId)
      }
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally {
      setBusy('')
    }
  }

  async function handleAdminReview(eventId, decision) {
    setBusy(eventId + decision)

    try {
      if (decision === 'approve') {
        await api.patch(`/admin/events/${eventId}/approve`, {}, { token })
      } else {
        await api.patch(`/admin/events/${eventId}/reject`, { reason: 'Needs revision before approval.' }, { token })
      }
      setBanner({ tone: 'success', message: `Event ${decision}d successfully.` })
      await refreshWorkspace()
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally {
      setBusy('')
    }
  }

  async function handleNotificationAction(id, action) {
    setBusy(id + action)

    try {
      if (action === 'read') {
        await api.patch(`/notifications/${id}/read`, {}, { token })
      }
      if (action === 'delete') {
        await api.delete(`/notifications/${id}`, { token })
      }
      if (action === 'read-all') {
        await api.patch('/notifications/read-all', {}, { token })
      }
      await refreshWorkspace()
    } catch (error) {
      setBanner({ tone: 'danger', message: error.message })
    } finally {
      setBusy('')
    }
  }

  function handleLogout() {
    logout()
    navigate('/auth')
  }

  const stats = isAdmin
    ? [
        { label: 'Pending approvals', value: workspace.pendingEvents.length, helper: 'Events currently waiting for moderation.', icon: ShieldCheck },
        { label: 'Total events', value: workspace.allAdminEvents.length, helper: 'Full moderation ledger across all states.', icon: CalendarPlus2 },
        { label: 'Unread notifications', value: workspace.notifications.filter((item) => !item.is_read).length, helper: 'Recent operational updates for the admin workspace.', icon: Bell },
      ]
    : [
        { label: 'Open opportunities', value: workspace.events.length, helper: 'Approved events students can act on right now.', icon: Compass },
        { label: 'Events you manage', value: workspace.myEvents.length, helper: 'Your personal organizer pipeline.', icon: CalendarPlus2 },
        { label: 'Unread notifications', value: workspace.notifications.filter((item) => !item.is_read).length, helper: 'Keep replies and approvals from stalling.', icon: Bell },
      ]

  return (
    <AppShell
      currentSection={currentSection}
      onLogout={handleLogout}
      onSectionChange={setCurrentSection}
      sections={sections}
      setSidebarOpen={setSidebarOpen}
      sidebarOpen={sidebarOpen}
      user={user}
    >
      <div className="space-y-6">
        <AlertBanner tone={banner.tone} message={banner.message} onClose={() => setBanner({ tone: 'info', message: '' })} />

        {currentSection === 'overview' ? (
          <>
            <section className="grid gap-5 xl:grid-cols-3">
              {stats.map((item) => (
                <StatCard key={item.label} {...item} />
              ))}
            </section>
            <SectionCard title="What’s moving today" description="A quick pulse across activity in your workspace.">
              <div className="grid gap-5 2xl:grid-cols-[1.1fr_0.9fr]">
                <SnapshotList title={isAdmin ? 'Pending review' : 'Recent events'} items={(isAdmin ? workspace.pendingEvents : workspace.events).slice(0, 4)} type="event" />
                <SnapshotList title="Latest notifications" items={workspace.notifications.slice(0, 4)} type="notification" />
              </div>
            </SectionCard>
          </>
        ) : null}

        {!isAdmin && currentSection === 'discover' ? (
          <SectionCard title="Discover events" description="Public approved events from the backend, ready for students to explore and apply.">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {workspace.events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onApply={() => setApplyModal({ open: true, eventId: event.id, eventTitle: event.title })}
                />
              ))}
            </div>
          </SectionCard>
        ) : null}

        {!isAdmin && currentSection === 'events' ? (
          <div className="grid gap-6 2xl:grid-cols-[1.15fr_0.85fr]">
            <SectionCard title="Create a new event" description="Submissions go through admin approval before becoming public.">
              <form onSubmit={handleCreateEvent} className="grid gap-4">
                <Field label="Title"><Input value={eventForm.title} onChange={(event) => setEventForm({ ...eventForm, title: event.target.value })} required /></Field>
                <Field label="Event name"><Input value={eventForm.event_name} onChange={(event) => setEventForm({ ...eventForm, event_name: event.target.value })} required /></Field>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Category">
                    <Select value={eventForm.category} onChange={(event) => setEventForm({ ...eventForm, category: event.target.value })}>
                      <option value="TECH">Tech</option>
                      <option value="CULTURAL">Cultural</option>
                      <option value="SPORTS">Sports</option>
                    </Select>
                  </Field>
                  <Field label="Positions">
                    <Input type="number" min="1" value={eventForm.number_of_positions} onChange={(event) => setEventForm({ ...eventForm, number_of_positions: event.target.value })} required />
                  </Field>
                  <Field label="Deadline">
                    <Input type="datetime-local" value={eventForm.deadline} onChange={(event) => setEventForm({ ...eventForm, deadline: event.target.value })} required />
                  </Field>
                </div>
                <Field label="Required skills" hint="Comma-separated values such as React, Node.js, Design">
                  <Input value={eventForm.required_skills} onChange={(event) => setEventForm({ ...eventForm, required_skills: event.target.value })} />
                </Field>
                <Field label="Description">
                  <Textarea value={eventForm.description} onChange={(event) => setEventForm({ ...eventForm, description: event.target.value })} required />
                </Field>
                <PrimaryButton type="submit" busy={busy === 'event'}>Submit event</PrimaryButton>
              </form>
            </SectionCard>

            <SectionCard title="Managed events" description="Track approval status and review applications for your listings.">
              <div className="space-y-3">
                {workspace.myEvents.length ? workspace.myEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => setSelectedEventId(event.id)}
                    className={`w-full rounded-[24px] border p-4 text-left transition ${
                      selectedEventId === event.id
                        ? 'border-brand-400 bg-brand-50 dark:bg-brand-500/10'
                        : 'border-slate-200 hover:border-brand-300 dark:border-slate-700'
                    }`}
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Pill tone="info">{event.category}</Pill>
                      <Pill tone={event.approval_status === 'APPROVED' ? 'success' : event.approval_status === 'REJECTED' ? 'danger' : 'warn'}>
                        {event.approval_status}
                      </Pill>
                    </div>
                    <h3 className="mb-1 font-display text-lg font-semibold">{event.title}</h3>
                    <p className="mb-2 text-sm text-soft">{event.description}</p>
                    <p className="mb-0 text-xs text-soft">Deadline {formatDate(event.deadline)}</p>
                  </button>
                )) : <EmptyState title="No managed events yet" message="Create your first opportunity to start receiving applications." />}
              </div>

              {selectedEventId ? (
                <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-800">
                  <h3 className="mb-3 font-display text-lg font-semibold">Applications</h3>
                  <div className="space-y-3">
                    {workspace.eventApplications.length ? workspace.eventApplications.map((application) => (
                      <div key={application.id} className="rounded-[24px] border border-slate-200 p-4 dark:border-slate-700">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="mb-1 font-semibold">{application.student?.full_name}</p>
                            <p className="mb-0 text-sm text-soft">{application.student?.profile?.department || 'Department pending'} • Year {application.student?.profile?.year || 'NA'}</p>
                          </div>
                          <Pill tone={application.status === 'PENDING' ? 'warn' : application.status === 'REJECTED' ? 'danger' : 'success'}>
                            {application.status}
                          </Pill>
                        </div>
                        <p className="text-sm text-soft">{application.message || 'No note attached.'}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {['SHORTLISTED', 'SELECTED', 'REJECTED', 'COMPLETED'].map((status) => (
                            <SecondaryButton
                              key={status}
                              onClick={() => handleStatusUpdate(application.id, status)}
                              disabled={busy === application.id}
                              className="text-xs"
                            >
                              {status}
                            </SecondaryButton>
                          ))}
                        </div>
                      </div>
                    )) : <EmptyState title="No applications yet" message="Applications will appear here after students respond to your event." />}
                  </div>
                </div>
              ) : null}
            </SectionCard>
          </div>
        ) : null}

        {!isAdmin && currentSection === 'applications' ? (
          <SectionCard title="My applications" description="Track where you stand across your submitted applications.">
            <div className="space-y-4">
              {workspace.myApplications.length ? workspace.myApplications.map((application) => (
                <div key={application.id} className="glass-panel rounded-[24px] p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="mb-1 font-display text-lg font-semibold">{application.event?.title}</h3>
                      <p className="mb-0 text-sm text-soft">{application.event?.organizer?.full_name}</p>
                    </div>
                    <Pill tone={application.status === 'PENDING' ? 'warn' : application.status === 'REJECTED' ? 'danger' : 'success'}>
                      {application.status}
                    </Pill>
                  </div>
                  <p className="mb-0 text-sm text-soft">{application.message || 'No application note submitted.'}</p>
                </div>
              )) : <EmptyState title="No applications yet" message="You have not applied to any events yet. Discover one and send your first application." />}
            </div>
          </SectionCard>
        ) : null}

        {!isAdmin && currentSection === 'students' ? (
          <SectionCard title="Student search" description="Discover student profiles by skill, department, year, and keyword.">
            <form onSubmit={searchStudents} className="mb-5 grid gap-4 md:grid-cols-4">
              <SearchInput value={studentFilters.search} onChange={(event) => setStudentFilters({ ...studentFilters, search: event.target.value })} placeholder="Name or email" />
              <Input placeholder="Department" value={studentFilters.department} onChange={(event) => setStudentFilters({ ...studentFilters, department: event.target.value })} />
              <Input placeholder="Year" value={studentFilters.year} onChange={(event) => setStudentFilters({ ...studentFilters, year: event.target.value })} />
              <div className="flex gap-3">
                <Input placeholder="Skills" value={studentFilters.skills} onChange={(event) => setStudentFilters({ ...studentFilters, skills: event.target.value })} />
                <PrimaryButton type="submit" busy={busy === 'students'}>Search</PrimaryButton>
              </div>
            </form>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {workspace.students.length ? workspace.students.map((student) => (
                <div key={student.id} className="glass-panel rounded-[24px] p-5">
                  <h3 className="mb-1 font-display text-lg font-semibold">{student.full_name}</h3>
                  <p className="mb-2 text-sm text-soft">{student.email}</p>
                  <p className="mb-3 text-sm text-soft">{student.profile?.department || 'Department pending'} • Year {student.profile?.year || 'NA'}</p>
                  <div className="flex flex-wrap gap-2">
                    {toArray(student.profile?.skills).map((skill) => (
                      <span key={skill} className="rounded-full bg-white/80 px-3 py-1 text-xs dark:bg-slate-900/70">{skill}</span>
                    ))}
                  </div>
                </div>
              )) : <EmptyState title="No students found" message="Try a broader search, or open this after more users complete their profiles." />}
            </div>
          </SectionCard>
        ) : null}

        {currentSection === 'notifications' ? (
          <SectionCard
            title="Notifications"
            description="Actionable updates from applications, approvals, and status changes."
            action={<SecondaryButton onClick={() => handleNotificationAction('', 'read-all')}>Mark all as read</SecondaryButton>}
          >
            <div className="space-y-3">
              {workspace.notifications.length ? workspace.notifications.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 rounded-[24px] border border-slate-200 p-4 dark:border-slate-700 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Pill tone={item.is_read ? 'default' : 'info'}>{item.is_read ? 'Read' : 'Unread'}</Pill>
                      <span className="text-xs text-soft">{formatDateTime(item.created_at)}</span>
                    </div>
                    <p className="mb-0 text-sm">{item.message}</p>
                  </div>
                  <div className="flex gap-2">
                    {!item.is_read ? <SecondaryButton onClick={() => handleNotificationAction(item.id, 'read')}>Mark read</SecondaryButton> : null}
                    <SecondaryButton onClick={() => handleNotificationAction(item.id, 'delete')}>Delete</SecondaryButton>
                  </div>
                </div>
              )) : <EmptyState title="No notifications yet" message="New application activity and moderation updates will show up here." />}
            </div>
          </SectionCard>
        ) : null}

        {!isAdmin && currentSection === 'profile' ? (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <SectionCard title="Profile settings" description="Keep your public academic and skills profile current.">
              <form onSubmit={handleUpdateProfile} className="grid gap-4">
                <Field label="Bio"><Textarea value={profileForm.bio} onChange={(event) => setProfileForm({ ...profileForm, bio: event.target.value })} /></Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Department"><Input value={profileForm.department} onChange={(event) => setProfileForm({ ...profileForm, department: event.target.value })} /></Field>
                  <Field label="Year"><Input type="number" min="1" max="5" value={profileForm.year} onChange={(event) => setProfileForm({ ...profileForm, year: event.target.value })} /></Field>
                </div>
                <Field label="Profile picture URL"><Input value={profileForm.profile_picture} onChange={(event) => setProfileForm({ ...profileForm, profile_picture: event.target.value })} /></Field>
                <Field label="Skills" hint="Comma-separated values"><Input value={profileForm.skills} onChange={(event) => setProfileForm({ ...profileForm, skills: event.target.value })} /></Field>
                <Field label="Interests" hint="Comma-separated values"><Input value={profileForm.interests} onChange={(event) => setProfileForm({ ...profileForm, interests: event.target.value })} /></Field>
                <PrimaryButton type="submit" busy={busy === 'profile'}>Save profile</PrimaryButton>
              </form>
            </SectionCard>

            <SectionCard title="Profile preview" description="A quick read of what collaborators and organizers can see.">
              <div className="glass-panel rounded-[32px] p-7">
                <h3 className="mb-2 font-display text-4xl leading-tight font-semibold text-slate-950 dark:text-slate-50">{user?.full_name}</h3>
                <p className="mb-3 text-sm text-soft">{workspace.profile?.department || 'Department pending'} • Year {workspace.profile?.year || 'NA'}</p>
                <p className="mb-5 text-[15px] leading-7 text-slate-700 dark:text-slate-300">{workspace.profile?.bio || 'Add a bio so people understand your interests and strengths.'}</p>
                <div className="mb-4 flex flex-wrap gap-2">
                  {toArray(workspace.profile?.skills).map((skill) => (
                    <span key={skill} className="rounded-full bg-white/80 px-3 py-1 text-xs dark:bg-slate-900/70">{skill}</span>
                  ))}
                </div>
                <div className="border-t border-slate-200 pt-5 dark:border-slate-700">
                  <h4 className="mb-3 font-display text-2xl font-semibold text-slate-950 dark:text-slate-50">Experiences</h4>
                  <div className="space-y-3">
                    {workspace.experiences.length ? workspace.experiences.map((experience) => (
                      <div key={experience.id} className="rounded-2xl bg-slate-50/80 p-4 dark:bg-slate-900/60">
                        <p className="mb-1 font-medium">{experience.title}</p>
                        <p className="mb-0 text-sm text-soft">{experience.event_name} • {formatDate(experience.completed_at)}</p>
                      </div>
                    )) : <p className="mb-0 text-sm text-soft">Completed events will become profile experiences automatically.</p>}
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        ) : null}

        {isAdmin && currentSection === 'admin' ? (
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <SectionCard title="Pending approvals" description="Events currently waiting for moderation.">
              <div className="space-y-3">
                {workspace.pendingEvents.length ? workspace.pendingEvents.map((event) => (
                  <div key={event.id} className="rounded-[24px] border border-slate-200 p-4 dark:border-slate-700">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="mb-1 font-display text-lg font-semibold">{event.title}</h3>
                        <p className="mb-0 text-sm text-soft">{event.organizer?.full_name}</p>
                      </div>
                      <Pill tone="warn">{event.approval_status}</Pill>
                    </div>
                    <p className="mb-3 text-sm text-soft">{event.description}</p>
                    <div className="flex gap-2">
                      <PrimaryButton busy={busy === `${event.id}approve`} onClick={() => handleAdminReview(event.id, 'approve')}>Approve</PrimaryButton>
                      <SecondaryButton onClick={() => handleAdminReview(event.id, 'reject')}>Reject</SecondaryButton>
                    </div>
                  </div>
                )) : <EmptyState title="Queue is clear" message="No pending events are waiting for review right now." />}
              </div>
            </SectionCard>

            <SectionCard title="Moderation ledger" description="All events across approval states.">
              <div className="space-y-3">
                {workspace.allAdminEvents.map((event) => (
                  <div key={event.id} className="glass-panel rounded-[24px] p-4">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="mb-0 font-display text-lg font-semibold">{event.title}</h3>
                      <Pill tone={event.approval_status === 'APPROVED' ? 'success' : event.approval_status === 'REJECTED' ? 'danger' : 'warn'}>
                        {event.approval_status}
                      </Pill>
                    </div>
                    <p className="mb-1 text-sm text-soft">{event.organizer?.full_name}</p>
                    <p className="mb-0 text-sm text-soft">Created {formatDate(event.created_at)}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        ) : null}
      </div>

      <Modal show={applyModal.open} onHide={() => setApplyModal({ open: false, eventId: '', eventTitle: '' })} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="font-display text-2xl font-semibold">Apply to {applyModal.eventTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Field label="Message to the organizer">
            <Textarea value={applyMessage} onChange={(event) => setApplyMessage(event.target.value)} placeholder="Tell them why you are a strong fit." />
          </Field>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <SecondaryButton onClick={() => setApplyModal({ open: false, eventId: '', eventTitle: '' })}>Cancel</SecondaryButton>
          <PrimaryButton busy={busy === 'apply'} onClick={handleApplyToEvent}>Send application</PrimaryButton>
        </Modal.Footer>
      </Modal>
    </AppShell>
  )
}

function EventCard({ event, onApply }) {
  return (
    <motion.article whileHover={{ y: -4 }} className="glass-panel flex h-full flex-col rounded-[28px] p-5">
      <div className="mb-4 flex items-center justify-between">
        <Pill tone={event.category === 'TECH' ? 'info' : event.category === 'CULTURAL' ? 'success' : 'warn'}>
          {event.category}
        </Pill>
        <Pill tone={event.status === 'OPEN' ? 'success' : 'default'}>{event.status}</Pill>
      </div>
      <h3 className="mb-2 font-display text-xl font-semibold">{event.title}</h3>
      <p className="mb-4 text-sm text-soft">{event.description}</p>
      <div className="mb-4 space-y-2 text-sm text-soft">
        <p className="mb-0"><span className="font-medium text-slate-700 dark:text-slate-200">Event name:</span> {event.event_name}</p>
        <p className="mb-0"><span className="font-medium text-slate-700 dark:text-slate-200">Organizer:</span> {event.organizer?.full_name}</p>
        <p className="mb-0"><span className="font-medium text-slate-700 dark:text-slate-200">Deadline:</span> {formatDate(event.deadline)}</p>
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        {toArray(event.required_skills).slice(0, 4).map((skill) => (
          <span key={skill} className="rounded-full bg-white/80 px-3 py-1 text-xs dark:bg-slate-900/70">{skill}</span>
        ))}
      </div>
      <PrimaryButton className="mt-auto w-full" onClick={onApply}>Apply now</PrimaryButton>
    </motion.article>
  )
}

function SnapshotList({ title, items, type }) {
  return (
    <div className="rounded-[30px] border border-slate-200/90 bg-white/70 p-7">
      <h3 className="mb-5 font-display text-3xl font-semibold text-slate-950">{title}</h3>
      <div className="space-y-3">
        {items.length ? items.map((item) => (
          <div key={item.id} className="rounded-[24px] bg-slate-100 p-5">
            {type === 'event' ? (
              <>
                <p className="mb-1 text-lg font-semibold text-slate-950">{item.title}</p>
                <p className="mb-0 text-sm text-soft">{item.event_name} • {formatDate(item.deadline)}</p>
              </>
            ) : (
              <>
                <p className="mb-1 text-base font-semibold text-slate-900">{item.message}</p>
                <p className="mb-0 text-sm text-soft">{formatDateTime(item.created_at)}</p>
              </>
            )}
          </div>
        )) : <p className="mb-0 text-base text-slate-600">Nothing here yet.</p>}
      </div>
    </div>
  )
}

export default WorkspacePage
